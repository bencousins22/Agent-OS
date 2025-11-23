
import React from 'react';
import { Dashboard } from './Dashboard';
import { BrowserView } from './BrowserView';
import { FlowEditor } from './FlowEditor';
import { ProjectView } from './ProjectView';
import { TaskScheduler } from './TaskScheduler';
import { GitHubView } from './GitHubView';
import { SettingsView } from './SettingsView';
import { DeployView } from './DeployView';
import { Marketplace } from './Marketplace';
import { FlowScale } from './apps/FlowScale/FlowScale';
import { MonacoEditor } from './MonacoEditor';
import { TerminalView } from './TerminalView';
import { FileExplorer } from './FileExplorer';
import { BottomTicker } from './BottomTicker';
import { Resizable } from './Resizable';
import { CheckCircle, FileText, Code2, Terminal, Folder } from 'lucide-react';
import { MainView, EditorTab, TerminalBlock } from '../types';

interface WorkspaceProps {
    activeView: MainView;
    onNavigate: (view: MainView) => void;
    onSendMessage: (text: string) => void;
    setChatOpen: (open: boolean) => void;
    isMobile: boolean;
    editorTabs: EditorTab[];
    activeTabPath: string | null;
    setActiveTabPath: (path: string) => void;
    activePanel: 'terminal' | 'problems';
    setActivePanel: (panel: 'terminal' | 'problems') => void;
    terminalBlocks: TerminalBlock[];
    openFile: (path: string) => void;
    mobileCodeView: 'editor' | 'terminal' | 'files';
    setMobileCodeView: (view: 'editor' | 'terminal' | 'files') => void;
    onCursorChange: (cursor: { line: number; column: number; path: string }) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({
    activeView, onNavigate, onSendMessage, setChatOpen, isMobile,
    editorTabs, activeTabPath, setActiveTabPath, activePanel, setActivePanel,
    terminalBlocks, openFile, mobileCodeView, setMobileCodeView, onCursorChange
}) => {
    
    const renderCodeView = () => {
        if (isMobile) {
            return (
                <div className="flex-1 flex flex-col min-h-0 relative bg-os-bg">
                     <div className="h-14 bg-os-panel border-b border-os-border flex items-center shrink-0 px-3 gap-3 shadow-sm">
                        <div className="flex-1 flex overflow-x-auto scrollbar-hide gap-2">
                            {editorTabs.map(tab => (
                                <button key={tab.path} onClick={() => setActiveTabPath(tab.path)} className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTabPath === tab.path ? 'bg-gradient-to-br from-aussie-500/15 to-aussie-500/5 text-aussie-500 border border-aussie-500/30 shadow-md' : 'text-os-textDim border border-transparent hover:bg-white/5'}`}>{tab.title}</button>
                            ))}
                        </div>
                        <div className="flex bg-black/30 rounded-xl p-1 gap-1 shadow-inner">
                            <button onClick={() => setMobileCodeView('editor')} className={`p-2.5 rounded-lg transition-all ${mobileCodeView === 'editor' ? 'bg-white/15 text-white shadow-sm' : 'text-gray-500'}`}><Code2 className="w-5 h-5"/></button>
                            <button onClick={() => setMobileCodeView('terminal')} className={`p-2.5 rounded-lg transition-all ${mobileCodeView === 'terminal' ? 'bg-white/15 text-white shadow-sm' : 'text-gray-500'}`}><Terminal className="w-5 h-5"/></button>
                            <button onClick={() => setMobileCodeView('files')} className={`p-2.5 rounded-lg transition-all ${mobileCodeView === 'files' ? 'bg-white/15 text-white shadow-sm' : 'text-gray-500'}`}><Folder className="w-5 h-5"/></button>
                        </div>
                     </div>
                     <div className="flex-1 relative overflow-hidden">
                        {mobileCodeView === 'editor' && <MonacoEditor filePath={activeTabPath} language={editorTabs.find(t=>t.path===activeTabPath)?.language||'plaintext'} isMobile={true} onCursorChange={onCursorChange} />}
                        {mobileCodeView === 'terminal' && <TerminalView blocks={terminalBlocks} isMobile={true} />}
                        {mobileCodeView === 'files' && <FileExplorer onFileClick={(path) => { openFile(path); setMobileCodeView('editor'); }} />}
                     </div>
                </div>
            );
        }

        return (
            <div className="flex h-full w-full flex-row min-w-0 overflow-hidden">
                 <div className="flex-1 flex flex-col min-w-0 border-r border-os-border">
                     <div className="h-11 md:h-12 flex bg-os-bg/95 backdrop-blur-md border-b border-os-border shrink-0 sticky top-0 z-10 shadow-sm">
                        <div className="flex overflow-x-auto scrollbar-hide flex-1">
                            {editorTabs.map(tab => (
                                <div key={tab.path} onClick={() => setActiveTabPath(tab.path)} className={`flex items-center gap-2.5 px-5 min-w-[160px] max-w-[240px] cursor-pointer border-r border-os-border/60 select-none text-xs md:text-sm relative group transition-all ${activeTabPath === tab.path ? 'bg-os-panel text-white font-semibold' : 'text-os-textDim hover:bg-os-panel/50 hover:text-white'}`}>
                                    {activeTabPath === tab.path && <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-aussie-500 via-aussie-400 to-emerald-500 shadow-glow" />}
                                    <FileText className="w-4 h-4 opacity-80" />
                                    <span className="truncate flex-1">{tab.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 relative min-w-0">
                        <MonacoEditor 
                            filePath={activeTabPath} 
                            language={editorTabs.find(t=>t.path===activeTabPath)?.language||'plaintext'} 
                            onCursorChange={onCursorChange}
                        />
                    </div>
                    <Resizable direction="vertical" mode="next" reversed={true} />
                    <div className="h-[240px] md:h-[280px] flex flex-col bg-os-bg shrink-0 border-t border-os-border shadow-lg">
                        <div className="h-10 md:h-11 flex items-center px-4 border-b border-os-border gap-5 bg-os-panel/95 backdrop-blur-md sticky top-0 z-10">
                            <button onClick={() => setActivePanel('terminal')} className={`text-xs md:text-sm font-bold uppercase tracking-wider h-full px-3 border-b-[3px] transition-all ${activePanel === 'terminal' ? 'border-aussie-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700'}`}>Terminal</button>
                            <button onClick={() => setActivePanel('problems')} className={`text-xs md:text-sm font-bold uppercase tracking-wider h-full px-3 border-b-[3px] transition-all ${activePanel === 'problems' ? 'border-aussie-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700'}`}>Problems</button>
                        </div>
                        <div className="flex-1 overflow-hidden relative">{activePanel === 'terminal' ? <TerminalView blocks={terminalBlocks} /> : <div className="flex items-center justify-center h-full text-gray-500 text-sm"><CheckCircle className="w-6 h-6 mr-3 text-aussie-500"/>No problems found.</div>}</div>
                    </div>
                 </div>
                 <Resizable direction="horizontal" mode="next" reversed={true} />
                 <div className="flex flex-col bg-os-bg shrink-0 border-l border-os-border min-w-[240px] md:min-w-[260px]" style={{ width: 'clamp(240px, 20vw, 360px)' }}>
                    <div className="h-10 md:h-11 flex bg-os-panel/95 backdrop-blur-md border-b border-os-border shrink-0 items-center px-4 text-xs md:text-sm font-bold uppercase tracking-wider text-gray-400 shadow-sm">Explorer</div>
                    <div className="flex-1 overflow-hidden relative"><FileExplorer onFileClick={openFile} /></div>
                 </div>
            </div>
        );
    };

    return (
        <div className={`flex-1 flex flex-col min-w-0 bg-os-bg relative h-full overflow-auto`}>
            {activeView === 'dashboard' && <Dashboard onNavigate={onNavigate} activeView={activeView} />}
            {activeView === 'browser' && <BrowserView onInteract={(q) => { onSendMessage(q); setChatOpen(true); }} />}
            {activeView === 'flow' && <FlowEditor />}
            {activeView === 'projects' && <ProjectView />}
            {activeView === 'scheduler' && <TaskScheduler />}
            {activeView === 'github' && <GitHubView />}
            {activeView === 'settings' && <SettingsView />}
            {activeView === 'deploy' && <DeployView />}
            {activeView === 'marketplace' && <Marketplace />}
            {activeView === 'flow-scale' && <FlowScale />}
            {activeView === 'code' && renderCodeView()}
            {!isMobile && <BottomTicker />}
        </div>
    );
};
