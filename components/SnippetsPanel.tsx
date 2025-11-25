import React, { useState } from 'react';
import { Search, Copy, Trash2, Plus, Code2, Tag, CheckCircle, ChevronRight } from 'lucide-react';

interface CodeSnippet {
    id: string;
    title: string;
    description: string;
    code: string;
    language: string;
    tags: string[];
    createdAt: number;
    updatedAt: number;
    category: 'utility' | 'component' | 'hook' | 'service' | 'template' | 'other';
}

interface SnippetsPanelProps {
    onInsertSnippet?: (code: string) => void;
    onClose?: () => void;
}

const LANGUAGES = ['javascript', 'typescript', 'python', 'jsx', 'tsx', 'css', 'html', 'sql', 'bash', 'json'];
const CATEGORIES = ['utility', 'component', 'hook', 'service', 'template', 'other'] as const;

export const SnippetsPanel: React.FC<SnippetsPanelProps> = ({ onInsertSnippet, onClose }) => {
    const [snippets, setSnippets] = useState<CodeSnippet[]>(loadSnippets());
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Load snippets from localStorage
    function loadSnippets(): CodeSnippet[] {
        try {
            const stored = localStorage.getItem('code_snippets');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    // Save snippets to localStorage
    function saveSnippets(updated: CodeSnippet[]) {
        try {
            localStorage.setItem('code_snippets', JSON.stringify(updated));
            setSnippets(updated);
        } catch {
            console.error('Failed to save snippets');
        }
    }

    const deleteSnippet = (id: string) => {
        saveSnippets(snippets.filter(s => s.id !== id));
        if (selectedSnippet?.id === id) setSelectedSnippet(null);
    };

    const copyToClipboard = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredSnippets = snippets.filter(s =>
        (searchTerm === '' || s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedCategory === null || s.category === selectedCategory)
    );

    return (
        <div className="card rounded-2xl p-0 h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-aussie-500/20 border border-aussie-500/30 flex items-center justify-center">
                        <Code2 className="w-4 h-4 text-aussie-400" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Code Snippets</h2>
                    <span className="text-xs text-gray-500 ml-2">({snippets.length})</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn-primary py-2 px-3 text-sm flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">New</span>
                    </button>
                    {onClose && <button onClick={onClose} className="btn-ghost p-1">✕</button>}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex gap-4">
                {/* Snippets List */}
                <div className="flex-1 flex flex-col overflow-hidden border-r border-white/10">
                    {/* Search & Filter */}
                    <div className="px-4 py-4 border-b border-white/10 space-y-3 shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search snippets..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-base pl-10 py-2 text-sm w-full"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`badge px-3 py-1.5 text-xs whitespace-nowrap transition-all ${
                                    selectedCategory === null
                                        ? 'badge-primary'
                                        : 'bg-white/10 text-gray-400 hover:bg-white/15'
                                }`}
                            >
                                All
                            </button>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`badge px-3 py-1.5 text-xs whitespace-nowrap transition-all ${
                                        selectedCategory === cat
                                            ? 'badge-primary'
                                            : 'bg-white/10 text-gray-400 hover:bg-white/15'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Snippets Grid */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-2">
                        {filteredSnippets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                                <Code2 className="w-12 h-12 text-gray-600 mb-3 opacity-50" />
                                <p className="text-sm text-gray-500">No snippets found</p>
                            </div>
                        ) : (
                            filteredSnippets.map(snippet => (
                                <SnippetCard
                                    key={snippet.id}
                                    snippet={snippet}
                                    isSelected={selectedSnippet?.id === snippet.id}
                                    onSelect={() => setSelectedSnippet(snippet)}
                                    onDelete={() => deleteSnippet(snippet.id)}
                                    onCopy={() => copyToClipboard(snippet.code, snippet.id)}
                                    isCopied={copiedId === snippet.id}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Preview / Form */}
                <div className="w-96 flex flex-col border-l border-white/10 overflow-hidden hidden lg:flex">
                    {showForm ? (
                        <SnippetForm onSave={(snippet) => {
                            saveSnippets([...snippets, { ...snippet, id: Date.now().toString() }]);
                            setShowForm(false);
                        }} onCancel={() => setShowForm(false)} />
                    ) : selectedSnippet ? (
                        <SnippetPreview snippet={selectedSnippet} onInsert={onInsertSnippet} />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                            <Code2 className="w-12 h-12 text-gray-600 mb-3 opacity-30" />
                            <p className="text-sm text-gray-500">Select a snippet to preview</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SnippetCard: React.FC<{
    snippet: CodeSnippet;
    isSelected: boolean;
    onSelect: () => void;
    onDelete: () => void;
    onCopy: () => void;
    isCopied: boolean;
}> = ({ snippet, isSelected, onSelect, onDelete, onCopy, isCopied }) => (
    <button
        onClick={onSelect}
        className={`card-interactive w-full text-left p-3 transition-all group ${
            isSelected ? '!bg-aussie-500/20 !border-aussie-500/40' : ''
        }`}
    >
        <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                    <h3 className="font-bold text-white text-sm group-hover:text-aussie-300 transition-colors truncate">
                        {snippet.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{snippet.description}</p>
                </div>
                <div className="badge badge-primary text-[9px]">{snippet.language}</div>
            </div>

            {/* Tags */}
            {snippet.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                    {snippet.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[9px] bg-white/10 text-gray-400 px-2 py-0.5 rounded border border-white/10">
                            {tag}
                        </span>
                    ))}
                    {snippet.tags.length > 2 && <span className="text-[9px] text-gray-500">+{snippet.tags.length - 2}</span>}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onCopy(); }}
                    className="btn-tertiary p-1"
                    title="Copy"
                >
                    {isCopied ? <CheckCircle className="w-3 h-3 text-success-500" /> : <Copy className="w-3 h-3" />}
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="btn-tertiary p-1 hover:text-error-400 ml-auto"
                    title="Delete"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>
        </div>
    </button>
);

const SnippetPreview: React.FC<{
    snippet: CodeSnippet;
    onInsert?: (code: string) => void;
}> = ({ snippet, onInsert }) => (
    <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-4 py-4 border-b border-white/10 shrink-0">
            <h3 className="font-bold text-white mb-1">{snippet.title}</h3>
            <p className="text-xs text-gray-400">{snippet.description}</p>
        </div>

        {/* Code Preview */}
        <div className="flex-1 overflow-hidden px-4 py-4">
            <div className="h-full bg-[#0d1117] rounded-lg border border-white/10 overflow-auto custom-scrollbar p-3">
                <pre className="text-xs text-gray-300 font-mono leading-relaxed">
                    <code>{snippet.code}</code>
                </pre>
            </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/10 space-y-2 shrink-0">
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <Tag className="w-3 h-3" />
                <span>{snippet.tags.join(', ')}</span>
            </div>
            <button
                onClick={() => onInsert?.(snippet.code)}
                className="btn-primary w-full py-2 text-sm flex items-center justify-center gap-2"
            >
                <ChevronRight className="w-4 h-4" />
                Insert Snippet
            </button>
        </div>
    </div>
);

const SnippetForm: React.FC<{
    onSave: (snippet: Omit<CodeSnippet, 'id'>) => void;
    onCancel: () => void;
}> = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        code: '',
        language: 'javascript',
        tags: '',
        category: 'utility' as const,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            title: formData.title,
            description: formData.description,
            code: formData.code,
            language: formData.language,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
            category: formData.category,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden p-4 space-y-3">
            <input
                type="text"
                placeholder="Title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-base py-2 text-sm"
            />

            <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-base py-2 text-sm resize-none h-12"
            />

            <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="input-base py-2 text-sm"
            >
                {LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                ))}
            </select>

            <textarea
                placeholder="Code..."
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="input-base py-2 text-sm flex-1 resize-none font-mono text-xs"
            />

            <input
                type="text"
                placeholder="Tags (comma separated)"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="input-base py-2 text-sm"
            />

            <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1 py-2 text-sm">Save</button>
                <button type="button" onClick={onCancel} className="btn-secondary flex-1 py-2 text-sm">Cancel</button>
            </div>
        </form>
    );
};
