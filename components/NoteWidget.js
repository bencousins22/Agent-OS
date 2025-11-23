import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { X, GripHorizontal } from 'lucide-react';
import { dashboardState } from '../services/dashboardState';
const COLORS = ['bg-[#1c2128]', 'bg-yellow-500/20', 'bg-blue-500/20', 'bg-green-500/20', 'bg-red-500/20', 'bg-purple-500/20'];
export const NoteWidget = ({ id, initialContent = '', color = 'bg-[#1c2128]', onClose }) => {
    const [content, setContent] = useState(initialContent);
    const [bg, setBg] = useState(color);
    const [isDragging, setIsDragging] = useState(false);
    const noteRef = useRef(null);
    const handleSave = () => {
        dashboardState.updateWidget(id, { data: { content, color: bg } });
    };
    // Save on unmount/change
    useEffect(() => {
        const timer = setTimeout(handleSave, 500);
        return () => clearTimeout(timer);
    }, [content, bg]);
    const handleDragStart = (e) => {
        e.preventDefault();
        setIsDragging(true);
        const startX = e.clientX;
        const startY = e.clientY;
        const widget = dashboardState.getWidgets().find(w => w.id === id);
        const initialX = widget?.x || 0;
        const initialY = widget?.y || 0;
        const onMouseMove = (mv) => {
            const dx = mv.clientX - startX;
            const dy = mv.clientY - startY;
            if (noteRef.current) {
                noteRef.current.parentElement.style.left = `${initialX + dx}px`;
                noteRef.current.parentElement.style.top = `${initialY + dy}px`;
            }
        };
        const onMouseUp = (mv) => {
            setIsDragging(false);
            const dx = mv.clientX - startX;
            const dy = mv.clientY - startY;
            dashboardState.updateWidget(id, { x: initialX + dx, y: initialY + dy });
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };
    return (_jsxs("div", { ref: noteRef, className: `w-64 h-64 rounded-xl border border-white/10 shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl transition-colors ${bg}`, children: [_jsxs("div", { className: "h-8 flex items-center justify-between px-2 cursor-grab active:cursor-grabbing bg-white/5 hover:bg-white/10 transition-colors", onMouseDown: handleDragStart, children: [_jsx(GripHorizontal, { className: "w-4 h-4 text-gray-500" }), _jsxs("div", { className: "flex gap-1.5", children: [_jsx("div", { className: "flex gap-1", children: COLORS.map(c => (_jsx("button", { onClick: () => setBg(c), className: `w-3 h-3 rounded-full border border-white/10 ${c.replace('/20', '')} hover:scale-110 transition-transform` }, c))) }), _jsx("button", { onClick: onClose, className: "text-gray-500 hover:text-red-400 ml-2", children: _jsx(X, { className: "w-4 h-4" }) })] })] }), _jsx("textarea", { value: content, onChange: e => setContent(e.target.value), onBlur: handleSave, className: "flex-1 bg-transparent p-4 text-sm text-gray-200 resize-none outline-none placeholder-gray-600 font-medium leading-relaxed", placeholder: "Sticky note..." }), _jsxs("div", { className: "h-6 px-4 flex items-center justify-between text-[10px] text-gray-500 select-none border-t border-white/5", children: [_jsxs("span", { children: [content.length, " chars"] }), _jsx("span", { className: "opacity-50", children: "Auto-saving" })] })] }));
};
