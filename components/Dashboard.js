import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, memo, useRef } from 'react';
import { fs } from '../services/fileSystem';
import { Bot, Terminal, Globe, FileText, Rocket, Github, Folder, StickyNote, Settings, Trash2, Zap } from 'lucide-react';
import { notify } from '../services/notification';
import { dashboardState } from '../services/dashboardState';
import { wm } from '../services/windowManager';
import { WindowManager } from './WindowManager';
import { NoteWidget } from './NoteWidget';
import { julesAgent } from '../services/jules';
import { bus } from '../services/eventBus';
import { NAV_ITEMS } from './ActivityBar';
import { WebOsDock } from './WebOsDock';
// Grid config
const GRID_W = 90;
const GRID_H = 100;
const PADDING = 20;
const MOBILE_TOP_PADDING = 120; // Increased to reliably clear the 60px mobile header + safe areas
const ClockWidget = memo(({ onClose }) => {
    const [time, setTime] = useState(new Date());
    useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);
    return (_jsxs("div", { className: "bg-os-panel/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl w-[240px] cursor-move select-none group hover:bg-os-panel/60 transition-colors ring-1 ring-white/5", children: [_jsxs("div", { className: "flex justify-between items-start mb-1", children: [_jsx("div", { className: "text-[10px] font-bold text-aussie-500 uppercase tracking-widest opacity-80", children: "Local Time" }), _jsx(Trash2, { className: "w-3 h-3 cursor-pointer text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all", onClick: onClose })] }), _jsx("div", { className: "text-4xl font-mono font-bold text-white tracking-tight mb-1 drop-shadow-md", children: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }), _jsx("div", { className: "text-xs text-gray-400 font-medium", children: time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }) })] }));
});
export const Dashboard = memo(({ onNavigate, activeView }) => {
    const [icons, setIcons] = useState([]);
    const [widgets, setWidgets] = useState([]);
    const [wallpaper, setWallpaper] = useState(dashboardState.getWallpaper());
    const [selectedIcon, setSelectedIcon] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [iconPositions, setIconPositions] = useState({});
    const [containerSize, setContainerSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [openWindows, setOpenWindows] = useState([]);
    const [layoutLocked, setLayoutLocked] = useState(false);
    const [dragTarget, setDragTarget] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);
    useEffect(() => {
        refreshDesktop();
        const i = setInterval(refreshDesktop, 5000);
        const unsub = dashboardState.subscribe((state) => {
            setWidgets(state.widgets);
            setWallpaper(state.wallpaper);
        });
        try {
            const saved = localStorage.getItem('desktop_icon_positions');
            if (saved)
                setIconPositions(JSON.parse(saved));
        }
        catch (e) { }
        const closeMenu = () => setContextMenu(null);
        window.addEventListener('click', closeMenu);
        const handleResize = () => {
            if (containerRef.current) {
                setContainerSize({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        const unsubWindows = wm.subscribe((wins) => setOpenWindows(wins));
        const offBus = bus.subscribe((e) => {
            if (e.type === 'agent-create-widget') {
                const targetX = Math.min(containerSize.width - 220, Math.max(40, (e.payload?.x ?? Math.random() * containerSize.width)));
                const targetY = Math.min(containerSize.height - 220, Math.max(80, (e.payload?.y ?? Math.random() * containerSize.height)));
                dashboardState.addWidget(e.payload?.widgetType || 'note', targetX, targetY);
            }
        });
        return () => {
            clearInterval(i);
            unsub();
            window.removeEventListener('click', closeMenu);
            window.removeEventListener('resize', handleResize);
            unsubWindows();
            offBus();
        };
    }, []);
    useEffect(() => {
        if (Object.keys(iconPositions).length > 0) {
            localStorage.setItem('desktop_icon_positions', JSON.stringify(iconPositions));
        }
        else {
            localStorage.removeItem('desktop_icon_positions');
        }
    }, [iconPositions]);
    const refreshDesktop = () => {
        try {
            const files = fs.readDir('/home/aussie/Desktop');
            const desktopIcons = files.map(f => {
                let type = f.type === 'directory' ? 'folder' : 'file';
                let appTarget;
                let windowAppId;
                if (f.name.endsWith('.lnk')) {
                    const content = fs.readFile(f.path);
                    if (content.startsWith('app:')) {
                        type = 'app';
                        appTarget = content.split(':')[1];
                    }
                    else if (content.startsWith('app-window:')) {
                        type = 'app';
                        windowAppId = content.split(':')[1];
                    }
                }
                return { name: f.name.replace('.lnk', ''), path: f.path, type, appTarget, windowAppId };
            });
            setIcons(desktopIcons);
        }
        catch (e) {
            console.error(e);
        }
    };
    const getIconPosition = (name, index) => {
        if (iconPositions[name])
            return iconPositions[name];
        const isMobile = window.innerWidth < 768;
        const startY = isMobile ? PADDING + MOBILE_TOP_PADDING : PADDING;
        // Auto Grid Layout
        const availableHeight = Math.max(300, containerSize.height - (startY * 2));
        const maxRows = Math.floor(availableHeight / GRID_H);
        const safeRows = maxRows > 0 ? maxRows : 1;
        // Column-major (fills top-down, then left-right) for Desktop
        if (!isMobile) {
            const col = Math.floor(index / safeRows);
            const row = index % safeRows;
            return { x: PADDING + (col * GRID_W), y: PADDING + (row * GRID_H) };
        }
        else {
            // Row major for mobile with generous top margin
            const cols = Math.floor(containerSize.width / GRID_W);
            const safeCols = Math.max(1, cols);
            const mobileCol = index % safeCols;
            const mobileRow = Math.floor(index / safeCols);
            return { x: PADDING + mobileCol * GRID_W, y: startY + mobileRow * GRID_H };
        }
    };
    const handleMouseDown = (e, name, currentX, currentY) => {
        if (layoutLocked)
            return;
        e.stopPropagation();
        setSelectedIcon(name);
        setDragTarget(name);
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setDragOffset({
            x: clientX - currentX,
            y: clientY - currentY
        });
    };
    const handleMove = (e) => {
        if (dragTarget) {
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            const newX = clientX - dragOffset.x;
            const newY = clientY - dragOffset.y;
            setIconPositions(prev => ({
                ...prev,
                [dragTarget]: { x: newX, y: newY }
            }));
        }
    };
    const handleEnd = () => {
        if (dragTarget) {
            const pos = iconPositions[dragTarget];
            if (pos) {
                const snapW = GRID_W / 2;
                const snapH = GRID_H / 2;
                const snappedX = Math.round(pos.x / snapW) * snapW;
                const snappedY = Math.round(pos.y / snapH) * snapH;
                const maxX = Math.max(100, containerSize.width - 80);
                const maxY = Math.max(100, containerSize.height - 80);
                const boundedX = Math.max(10, Math.min(maxX, snappedX));
                const boundedY = Math.max(10, Math.min(maxY, snappedY));
                setIconPositions(prev => ({
                    ...prev,
                    [dragTarget]: { x: boundedX, y: boundedY }
                }));
            }
            setDragTarget(null);
        }
    };
    const resetLayout = () => {
        setIconPositions({});
        try {
            localStorage.removeItem('desktop_icon_positions');
        }
        catch { }
    };
    const handleDoubleClick = (icon) => {
        if (icon.type === 'app') {
            if (icon.windowAppId) {
                wm.openWindow(icon.windowAppId, icon.name);
            }
            else if (icon.appTarget) {
                onNavigate(icon.appTarget);
            }
        }
        else if (icon.type === 'file') {
            notify.info(icon.name, fs.readFile(icon.path).substring(0, 100));
        }
        else if (icon.type === 'folder') {
            bus.emit('switch-view', { view: 'code' });
        }
        setContextMenu(null);
    };
    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const menuW = 220;
        const menuH = 320;
        let x = e.clientX;
        let y = e.clientY;
        if (x + menuW > vw)
            x = vw - menuW - 10;
        if (y + menuH > vh)
            y = vh - menuH - 10;
        setContextMenu({ x, y });
    };
    // Actions
    const addWidget = (type) => {
        const centerX = (containerSize.width / 2) - 100;
        const centerY = (containerSize.height / 2) - 100;
        dashboardState.addWidget(type, centerX, centerY);
        setContextMenu(null);
    };
    const createBotApp = () => {
        julesAgent.processInput("Create a new NBA Bot app called 'Lakers Analytics'");
        setContextMenu(null);
    };
    const removeWidget = (id) => dashboardState.removeWidget(id);
    const createTextFile = () => {
        const name = `New File ${Date.now()}.txt`;
        fs.writeFile(`/home/aussie/Desktop/${name}`, '');
        refreshDesktop();
        setContextMenu(null);
    };
    const createFolder = () => {
        const name = `New Folder ${Date.now()}`;
        fs.mkdir(`/home/aussie/Desktop/${name}`);
        refreshDesktop();
        setContextMenu(null);
    };
    const getIconComponent = (name, type) => {
        if (name.includes('Hyperliquid'))
            return Zap;
        if (name.includes('NBA') || name.includes('Soccer') || name.includes('Store'))
            return Bot;
        switch (name) {
            case 'Browser': return Globe;
            case 'Terminal': return Terminal;
            case 'Jules Flow': return Rocket;
            case 'GitHub': return Github;
            case 'Deploy': return Rocket;
            case 'My Projects': return Folder;
            default: return type === 'folder' ? Folder : FileText;
        }
    };
    return (_jsxs("div", { ref: containerRef, className: "h-full w-full relative overflow-hidden bg-os-bg select-none touch-none font-sans px-3 sm:px-4 lg:px-8", onClick: () => setSelectedIcon(null), onContextMenu: handleContextMenu, onMouseMove: handleMove, onMouseUp: handleEnd, onMouseLeave: handleEnd, onTouchMove: handleMove, onTouchEnd: handleEnd, children: [_jsx("div", { className: "absolute inset-x-0 top-4 sm:top-6 pb-24 z-20 pointer-events-none", children: _jsxs("div", { className: "max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 pointer-events-auto", children: [_jsxs("div", { className: "w-full rounded-3xl border border-white/10 bg-[#0e111a]/85 backdrop-blur-xl p-6 shadow-2xl shadow-black/40 flex flex-col md:flex-row md:items-center md:justify-between gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "text-[11px] font-bold uppercase tracking-[0.2em] text-aussie-500", children: "Aussie OS Command Center" }), _jsx("div", { className: "text-[clamp(1.25rem,2vw,1.75rem)] font-bold text-white leading-tight", children: "All components, one launchpad." }), _jsx("div", { className: "text-sm text-gray-400 max-w-xl leading-relaxed", children: "Jump into any workspace: code, browser, flow, scheduler, deploy, marketplace, GitHub, and chat/agent." })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full md:w-auto", children: [_jsx("button", { onClick: () => onNavigate('code'), className: "px-4 py-2 rounded-lg bg-aussie-500 text-black font-bold text-sm shadow-lg shadow-aussie-500/20 hover:bg-aussie-600 active:scale-95 transition-transform", children: "Open Code" }), _jsx("button", { onClick: () => onNavigate('browser'), className: "px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-sm hover:border-aussie-500/40 hover:bg-aussie-500/5", children: "Open Browser" }), _jsx("button", { onClick: () => onNavigate('marketplace'), className: "px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-sm hover:border-aussie-500/40 hover:bg-aussie-500/5", children: "App Store" })] })] }), _jsx("div", { className: "grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-3", children: [...NAV_ITEMS].map(item => (_jsxs("button", { onClick: () => onNavigate(item.view), className: `group w-full text-left rounded-xl border border-white/10 bg-[#0e111a]/85 backdrop-blur-xl p-3 flex flex-col items-start gap-2 hover:border-aussie-500/40 hover:bg-aussie-500/5 transition-colors shadow-lg shadow-black/30 ${activeView === item.view ? 'ring-1 ring-aussie-500/40' : ''}`, children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-aussie-500", children: _jsx(item.icon, { className: "w-4 h-4" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "text-xs font-bold text-white truncate", children: item.tooltip }), _jsx("div", { className: "text-[10px] text-gray-500 uppercase tracking-wider", children: "Launch" })] })] }, item.view))) }), _jsxs("div", { className: "flex flex-wrap items-center gap-3 pt-2", children: [_jsx("button", { onClick: () => setLayoutLocked(v => !v), className: `px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${layoutLocked ? 'bg-white/10 border-white/20 text-gray-200' : 'bg-aussie-500 text-black border-transparent shadow-lg shadow-aussie-500/20'}`, children: layoutLocked ? 'Unlock Layout' : 'Lock Layout' }), _jsx("button", { onClick: resetLayout, className: "px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 border border-white/10 text-gray-200 hover:border-aussie-500/40 hover:bg-aussie-500/5 transition-colors", children: "Reset Icons" }), _jsx("div", { className: "text-[10px] text-gray-500", children: "Drag icons/widgets when unlocked. Snap-to-grid auto-adjusts on resize." })] })] }) }), _jsxs("div", { className: "absolute inset-0 z-0 pointer-events-none", children: [_jsx("div", { className: `absolute inset-0 ${wallpaper.type === 'gradient' || wallpaper.type === 'solid' ? wallpaper.value : ''}`, style: wallpaper.type === 'image' ? { backgroundImage: `url(${wallpaper.value})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {} }), _jsx("div", { className: "absolute inset-0 opacity-10", style: { backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px' } })] }), _jsx("div", { className: "absolute top-4 left-4 xl:left-72 z-30 hidden md:block", children: _jsx(WebOsDock, { onNavigate: onNavigate }) }), _jsx("div", { className: "absolute inset-0 z-10 overflow-hidden", children: icons.map((icon, index) => {
                    const IconComp = getIconComponent(icon.name, icon.type);
                    const isSelected = selectedIcon === icon.name;
                    const isDragging = dragTarget === icon.name;
                    const pos = getIconPosition(icon.name, index);
                    return (_jsxs("div", { style: {
                            position: 'absolute',
                            left: pos.x,
                            top: pos.y,
                            width: '80px',
                            touchAction: 'none'
                        }, onMouseDown: (e) => handleMouseDown(e, icon.name, pos.x, pos.y), onTouchStart: (e) => handleMouseDown(e, icon.name, pos.x, pos.y), onClick: (e) => { e.stopPropagation(); setSelectedIcon(icon.name); }, onDoubleClick: (e) => { e.stopPropagation(); handleDoubleClick(icon); }, onContextMenu: (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedIcon(icon.name);
                            setContextMenu({ x: 'touches' in e ? e.touches[0].clientX : e.clientX, y: 'touches' in e ? e.touches[0].clientY : e.clientY });
                        }, className: `
                                flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200 group select-none
                                ${isSelected ? 'bg-aussie-500/20 backdrop-blur-sm ring-1 ring-aussie-500/50' : 'hover:bg-white/10'}
                                ${isDragging ? 'opacity-90 scale-105 z-50 cursor-grabbing' : 'cursor-pointer'}
                            `, children: [_jsxs("div", { className: `
                                w-12 h-12 rounded-xl flex items-center justify-center shadow-xl shrink-0 relative overflow-hidden transition-transform duration-200
                                ${icon.name.includes('Hyperliquid') ? 'bg-gradient-to-br from-[#1a1d24] to-[#000000] text-aussie-500 border border-aussie-500/30' :
                                    icon.name.includes('NBA') ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white' :
                                        icon.name.includes('Bot') ? 'bg-gradient-to-br from-aussie-500 to-emerald-700 text-white' :
                                            'bg-[#1c2128]/90 border border-white/5 text-gray-400'}
                                ${isSelected ? 'scale-105' : ''}
                            `, children: [_jsx("div", { className: "absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none" }), _jsx(IconComp, { className: `w-6 h-6 drop-shadow-md ${isSelected && !icon.name.includes('Bot') ? 'text-aussie-500' : ''}`, strokeWidth: 1.5 })] }), _jsx("span", { className: `
                                text-[11px] font-medium text-center leading-tight line-clamp-2 w-full break-words px-1.5 py-0.5 rounded text-shadow select-none transition-colors
                                ${isSelected ? 'text-white font-bold' : 'text-gray-200 drop-shadow-md'}
                            `, style: { textShadow: '0 1px 3px rgba(0,0,0,0.8)' }, children: icon.name })] }, icon.name));
                }) }), widgets.map(widget => (_jsxs("div", { className: "absolute z-20 pointer-events-auto", style: { top: widget.y, left: widget.x }, children: [widget.type === 'clock' && _jsx(ClockWidget, { onClose: () => removeWidget(widget.id) }), widget.type === 'note' && _jsx(NoteWidget, { id: widget.id, initialContent: widget.data?.content, color: widget.data?.color, onClose: () => removeWidget(widget.id) })] }, widget.id))), _jsx(WindowManager, {}), contextMenu && (_jsx("div", { className: "fixed z-[9999] w-56 bg-[#161b22]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl py-1.5 animate-in fade-in zoom-in duration-100 ring-1 ring-black/50", style: { top: contextMenu.y, left: contextMenu.x }, onClick: e => e.stopPropagation(), onContextMenu: e => e.preventDefault(), children: selectedIcon ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1 truncate", children: selectedIcon }), _jsx(ContextItem, { icon: Zap, label: "Open", onClick: () => {
                                const icon = icons.find(i => i.name === selectedIcon);
                                if (icon)
                                    handleDoubleClick(icon);
                                setContextMenu(null);
                            } }), _jsx("div", { className: "h-px bg-white/5 my-1.5 mx-2" }), _jsx(ContextItem, { icon: Trash2, label: "Delete", onClick: () => {
                                const icon = icons.find(i => i.name === selectedIcon);
                                if (icon) {
                                    fs.delete(icon.path);
                                    refreshDesktop();
                                }
                                setContextMenu(null);
                            } })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1", children: "Create" }), _jsx(ContextItem, { icon: StickyNote, label: "New Sticky Note", onClick: () => addWidget('note') }), _jsx(ContextItem, { icon: Folder, label: "New Folder", onClick: createFolder }), _jsx(ContextItem, { icon: FileText, label: "New Text File", onClick: createTextFile }), _jsx("div", { className: "h-px bg-white/5 my-1.5 mx-2" }), _jsx(ContextItem, { icon: Bot, label: "Create Bot App", onClick: createBotApp }), _jsx("div", { className: "h-px bg-white/5 my-1.5 mx-2" }), _jsx(ContextItem, { icon: Settings, label: "Settings", onClick: () => { onNavigate('settings'); setContextMenu(null); } })] })) }))] }));
});
const ContextItem = ({ icon: Icon, label, onClick }) => (_jsxs("button", { onClick: onClick, className: "w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-aussie-500 hover:text-black text-gray-300 transition-colors group", children: [_jsx(Icon, { className: "w-4 h-4 text-gray-500 group-hover:text-black" }), _jsx("span", { className: "text-xs font-bold", children: label })] }));
const QuickStat = ({ label, value }) => (_jsxs("div", { className: "rounded-xl bg-white/5 border border-white/10 px-3 py-2", children: [_jsx("div", { className: "text-[10px] uppercase tracking-wider text-gray-500 font-bold", children: label }), _jsx("div", { className: "text-lg font-bold text-white", children: value })] }));
