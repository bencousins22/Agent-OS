
import React, { useEffect, useState, useTransition, useOptimistic } from 'react';
import { Project } from '../types';
import { Briefcase, Plus, Folder, ExternalLink, X, RefreshCw, Github, Sparkles } from 'lucide-react';
import { bus } from '../services/eventBus';
import { fs } from '../services/fileSystem';
import { julesAgent } from '../services/jules';
import { github } from '../services/github';

export const ProjectView: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [optimisticProjects, addOptimisticProject] = useOptimistic(
        projects,
        (state: Project[], newProject: Project) => [...state, newProject]
    ) as [Project[], (project: Project) => void];

    const [showNewModal, setShowNewModal] = useState(false);
    const [mobileTab, setMobileTab] = useState<'projects' | 'team'>('projects');
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newStack, setNewStack] = useState<string[]>([]);
    const [repoUrl, setRepoUrl] = useState('');

    const refreshProjects = () => {
        try {
            if (!fs.exists('/workspace/projects')) fs.mkdir('/workspace/projects');
            const dirs = fs.readDir('/workspace/projects').filter(d => d.type === 'directory');
            const mapped: Project[] = dirs.map(d => ({
                id: d.name,
                name: d.name,
                description: fs.exists(`${d.path}/README.md`) ? fs.readFile(`${d.path}/README.md`).split('\n')[0] : 'Workspace project',
                stack: ['react'],
                lastUpdated: d.lastModified,
                path: d.path
            }));
            setProjects(mapped);
        } catch (e) {
            console.error('Failed to load projects', e);
        }
    };

    useEffect(() => {
        refreshProjects();
    }, []);



    const handleCreate = async () => {
        if (!newName.trim()) return;
        setLoading(true);
        try {
            const slug = newName.trim().replace(/[^a-zA-Z0-9-_]/g, '-');
            const projectPath = `/workspace/projects/${slug}`;
            if (!fs.exists('/workspace/projects')) fs.mkdir('/workspace/projects');
            if (!fs.exists(projectPath)) fs.mkdir(projectPath);
            fs.writeFile(`${projectPath}/README.md`, `# ${newName}\n\n${newDesc || 'New Aussie OS project.'}\n`);
            addOptimisticProject({
                id: slug,
                name: newName.trim(),
                description: newDesc || 'New Aussie OS project.',
                stack: (newStack.length ? newStack : ['react']) as ('react' | 'node' | 'python' | 'rust' | 'gemini')[],
                lastUpdated: Date.now(),
                path: projectPath
            });
            startTransition(() => refreshProjects());

            // Ask Jules to scaffold the project
            julesAgent.processInput?.(`Create a new project at ${projectPath} named "${newName}" with stack ${newStack.join(', ') || 'default'} and README initialized. If GitHub is configured, prepare to sync.`);

            // Optionally sync GitHub metadata
            if (repoUrl.trim() && github.hasToken()) {
                try {
                    await github.processOperation('repo_sync', JSON.stringify({ repo: repoUrl.trim().replace('https://github.com/', '') }));
                } catch (e) {
                    console.warn('GitHub sync failed', e);
                }
            }
        } catch (e) {
            console.error('Project creation failed', e);
        } finally {
            setLoading(false);
            setShowNewModal(false);
            setNewName(''); setNewDesc(''); setNewStack([]); setRepoUrl('');
        }
    };

    const openProject = async (path: string, name: string) => {
        bus.emit('open-project', { path, name });
    };

    return (
        <div className="h-full bg-os-bg flex flex-col overflow-hidden">
            {/* Header - Hidden on Mobile */}
            <div className="hidden md:flex p-4 md:p-6 border-b border-os-border bg-os-panel items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-aussie-500/20 p-2 rounded-lg"><Briefcase className="w-6 h-6 text-aussie-500" /></div>
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-white">Projects</h2>
                        <p className="text-xs text-gray-500">Workspace folders synced with Jules & GitHub</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={refreshProjects} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:border-aussie-500/40 hover:text-white transition-all flex items-center gap-2 text-xs font-semibold active:scale-95">
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                    <button onClick={() => julesAgent.processInput?.('Scan /workspace/projects and summarize active workspaces, then prepare git status.')} className="px-3 py-2 bg-aussie-500/15 border border-aussie-500/30 rounded-lg text-aussie-300 hover:text-white transition-all flex items-center gap-2 text-xs font-semibold active:scale-95">
                        <Sparkles className="w-4 h-4" /> Ask Jules
                    </button>
                    <button onClick={() => setShowNewModal(true)} className="px-4 py-2 bg-aussie-500 hover:bg-aussie-600 text-[#0f1216] rounded-lg font-bold flex items-center gap-2 shadow-lg text-xs md:text-sm active:scale-95 transition-transform">
                        <Plus className="w-4 h-4" /> New Project
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
                <div className="md:hidden flex border-b border-os-border bg-os-panel shrink-0 sticky top-0 z-10">
                    <button onClick={() => setMobileTab('projects')} className={`flex-1 py-3 text-xs font-bold uppercase transition-colors ${mobileTab === 'projects' ? 'text-aussie-500 border-b-2 border-aussie-500 bg-white/5' : 'text-gray-500'}`}>Projects</button>
                </div>

                <div className={`flex-1 p-4 md:p-6 overflow-y-auto pb-24 md:pb-6`}>
                    {(loading || isPending) && (
                        <div className="mb-4 flex items-center gap-2 text-[11px] text-gray-400">
                            <div className="w-2.5 h-2.5 rounded-full bg-aussie-500 animate-pulse shadow-glow" />
                            <span>Creating workspace...</span>
                        </div>
                    )}
                    {projects.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 gap-3">
                            <Folder className="w-10 h-10 text-gray-600" />
                            <p className="text-sm">No projects yet. Create one to get started.</p>
                            <button onClick={() => setShowNewModal(true)} className="px-3 py-2 bg-aussie-500 text-black rounded-lg font-semibold hover:bg-aussie-600 active:scale-95 transition-all text-xs">
                                New Project
                            </button>
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {optimisticProjects.map(project => (
                            <div key={project.id} onClick={() => openProject(project.path, project.name)} className="group bg-os-panel border border-os-border rounded-xl p-5 hover:border-aussie-500/50 transition-all hover:shadow-xl active:scale-[0.98] cursor-pointer">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="bg-os-bg p-2 rounded-lg border border-os-border group-hover:border-aussie-500/30"><Folder className="w-6 h-6 text-aussie-500" /></div>
                                    <ExternalLink className="w-4 h-4 text-os-textDim" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">{project.name}</h3>
                                <p className="text-xs text-os-textDim mb-4 line-clamp-2">{project.description}</p>
                                <div className="flex flex-wrap gap-2 mb-4">{project.stack.map(t => <span key={t} className="px-2 py-1 bg-os-bg border border-os-border rounded text-[10px] font-bold text-gray-300 uppercase">{t}</span>)}</div>
                                <div className="pt-4 border-t border-os-border flex justify-between text-xs text-os-textDim">
                                    <span>{new Date(project.lastUpdated).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1 text-gray-500"><Github className="w-4 h-4" /> Repo ready</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Mobile FAB for new project */}
                    <button 
                        onClick={() => setShowNewModal(true)} 
                        className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-aussie-500 rounded-full shadow-2xl flex items-center justify-center z-20 active:scale-90 transition-transform border-2 border-[#0f1216]"
                    >
                        <Plus className="w-6 h-6 text-black" />
                    </button>
                </div>


            </div>

            {showNewModal && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 md:p-4" onClick={() => setShowNewModal(false)}>
                    <div className="bg-os-panel border-t md:border border-os-border rounded-t-2xl md:rounded-xl p-6 w-full max-w-[500px] shadow-2xl animate-in slide-in-from-bottom duration-300 pb-safe" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between mb-6"><h3 className="text-lg font-bold text-white">New Workspace</h3><button onClick={() => setShowNewModal(false)}><X className="w-5 h-5 text-gray-500"/></button></div>
                        <div className="space-y-4 mb-6">
                            <input value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-os-bg border border-os-border rounded-lg p-3 text-[16px] md:text-sm text-white outline-none focus:border-aussie-500" placeholder="Project Name" autoFocus />
                            <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-os-bg border border-os-border rounded-lg p-3 text-[16px] md:text-sm text-white outline-none focus:border-aussie-500 h-20 resize-none" placeholder="Description" />
                            <div className="flex gap-2 flex-wrap">{['react','node','python','rust','gemini'].map(t=><button key={t} onClick={()=>setNewStack(prev=>prev.includes(t)?prev.filter(x=>x!==t):[...prev,t])} className={`px-3 py-2 rounded text-xs font-bold uppercase border ${newStack.includes(t)?'bg-aussie-500 text-black border-aussie-500':'bg-os-bg text-gray-400 border-os-border'}`}>{t}</button>)}</div>
                            <div className="flex items-center gap-2">
                                <Github className="w-4 h-4 text-gray-500" />
                                <input value={repoUrl} onChange={e => setRepoUrl(e.target.value)} className="flex-1 bg-os-bg border border-os-border rounded-lg p-3 text-[16px] md:text-sm text-white outline-none focus:border-aussie-500" placeholder="GitHub repo (optional) e.g. user/repo or https://github.com/user/repo" />
                            </div>
                        </div>
                        <button onClick={handleCreate} disabled={loading} className="w-full py-3 bg-aussie-500 text-black font-bold rounded-lg text-sm shadow-lg active:scale-95 transition-transform disabled:opacity-60">
                            {loading ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
