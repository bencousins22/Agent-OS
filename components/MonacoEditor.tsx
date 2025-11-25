
import React, { useEffect, useState, useRef } from 'react';
import Editor, { OnMount, loader } from '@monaco-editor/react';
import { fs } from '../services/fileSystem';

// Configure Monaco to load from a stable CDN
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs'
  }
});

interface Props {
    filePath: string | null;
    language: string;
    isMobile?: boolean;
    onCursorChange?: (cursor: { line: number; column: number; path: string }) => void;
    onEditorMount?: (editor: any) => void;
}

export const MonacoEditor: React.FC<Props> = ({ filePath, language, isMobile, onCursorChange, onEditorMount }) => {
    const [content, setContent] = useState('');
    const editorRef = useRef<any>(null);

    useEffect(() => {
        if (filePath) {
            try {
                const c = fs.readFile(filePath);
                setContent(c);
            } catch (e) {
                setContent('// File not found');
            }
        } else {
            setContent('// Select a file to view content');
        }
    }, [filePath]);

    const handleEditorChange = (value: string | undefined) => {
        if (filePath && value !== undefined) {
            fs.writeFile(filePath, value);
        }
    };

    // Track cursor position for status bar
    useEffect(() => {
        if (!editorRef.current || !filePath) return;
        const editor = editorRef.current;

        const emitPosition = () => {
            const pos = editor.getPosition();
            if (pos && onCursorChange) {
                onCursorChange({ line: pos.lineNumber, column: pos.column, path: filePath });
            }
        };

        emitPosition();
        const disposable = editor.onDidChangeCursorPosition(({ position }: any) => {
            if (onCursorChange && position) {
                onCursorChange({ line: position.lineNumber, column: position.column, path: filePath });
            }
        });

        return () => disposable?.dispose();
    }, [filePath, onCursorChange]);



    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        (window as any).monaco = monaco;

        // Call the onEditorMount callback if provided
        if (onEditorMount) {
            onEditorMount(editor);
        }

        // Define modern theme with enhanced syntax highlighting
        monaco.editor.defineTheme('aussie-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6e7681', fontStyle: 'italic' },
                { token: 'keyword', foreground: '00e599', fontStyle: 'bold' }, // Mint - Bold
                { token: 'keyword.control', foreground: '00e599' },
                { token: 'string', foreground: 'a5d6ff' },
                { token: 'string.escape', foreground: '79c0ff' },
                { token: 'number', foreground: 'c9d1d9' },
                { token: 'type', foreground: '7af6c9' }, // Light mint
                { token: 'type.class', foreground: '7af6c9', fontStyle: 'bold' },
                { token: 'function', foreground: 'f97583' },
                { token: 'variable', foreground: 'e6edf3' },
                { token: 'variable.parameter', foreground: 'a5d6ff' },
                { token: 'operator', foreground: '00e599' },
                { token: 'tag', foreground: '7ee787' },
                { token: 'tag.class', foreground: '7ee787', fontStyle: 'bold' },
            ],
            colors: {
                'editor.background': '#0d1117',
                'editor.foreground': '#e6edf3',
                'editor.lineHighlightBackground': '#161b2230',
                'editor.lineHighlightBorder': '#00e59920',
                'editorCursor.foreground': '#00e599',
                'editor.selectionBackground': '#00e59940',
                'editor.inactiveSelectionBackground': '#00e59920',
                'editorLineNumber.foreground': '#484f58',
                'editorLineNumber.activeForeground': '#00e599',
                'editorBracketMatch.background': '#00e59920',
                'editorBracketMatch.border': '#00e599',
                'editor.wordHighlightBackground': '#00e59915',
                'editor.wordHighlightBorder': '#00e59930',
                'editorWhitespace.foreground': '#30363d40',
                'scrollbar.shadow': '#00000050',
                'scrollbarSlider.background': '#00e59920',
                'scrollbarSlider.hoverBackground': '#00e59940',
                'editorError.foreground': '#f85149',
                'editorWarning.foreground': '#d29922',
                'editorInfo.foreground': '#58a6ff',
            }
        });

        monaco.editor.setTheme('aussie-dark');
    };

    if (!filePath) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-[#0d1117] to-[#0a0c10] text-gray-500 relative overflow-hidden">
                {/* Background gradient accent */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-gradient-to-br from-aussie-500 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="text-center relative z-10">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-aussie-500/20 to-transparent border border-aussie-500/30 flex items-center justify-center">
                        <span className="text-5xl">📝</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">No File Selected</h2>
                    <p className="text-sm text-gray-400 max-w-xs mx-auto mb-6">
                        Open a file from the file explorer to start editing
                    </p>
                    <code className="text-xs font-mono text-aussie-500/70 bg-aussie-500/10 border border-aussie-500/20 px-4 py-2 rounded-lg inline-block">
                        NO_ACTIVE_BUFFER
                    </code>
                </div>
            </div>
        );
    }

    return (
        <Editor
            height="100%"
            language={language}
            value={content}
            theme="aussie-dark"
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
                minimap: { enabled: !isMobile, showSlider: 'always' },
                fontSize: isMobile ? 12 : 13,
                fontFamily: "'JetBrains Mono', monospace",
                fontLigatures: true,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                wordWrap: 'on',
                wordWrapColumn: 120,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                contextmenu: !isMobile,
                lineHeight: 22,
                glyphMargin: !isMobile,
                folding: !isMobile,
                foldingHighlight: true,
                lineNumbersMinChars: isMobile ? 3 : 5,
                renderLineHighlight: 'all',
                renderWhitespace: 'none',
                formatOnPaste: true,
                formatOnType: true,
                bracketPairColorization: {
                    enabled: true,
                    independentColorPoolPerBracketType: true,
                },
                guides: {
                    bracketPairs: true,
                    indentation: true,
                },
                scrollbar: {
                    useShadows: true,
                    vertical: 'auto',
                    horizontal: 'auto',
                },
            }}
        />
    );
};
