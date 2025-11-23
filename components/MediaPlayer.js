import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { fs } from '../services/fileSystem';
export const MediaPlayer = ({ file, onClose }) => {
    const [src, setSrc] = useState('');
    const [error, setError] = useState(false);
    useEffect(() => {
        if (file) {
            try {
                // In our simulated FS, media files contain the URL string
                const content = fs.readFile(file.path);
                setSrc(content.trim());
                setError(false);
            }
            catch (e) {
                setError(true);
            }
        }
    }, [file]);
    if (!file)
        return null;
    return (_jsx("div", { className: "absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200", children: _jsxs("div", { className: "relative w-[80%] max-w-4xl bg-[#161b22] rounded-xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col", children: [_jsxs("div", { className: "flex items-center justify-between p-3 border-b border-gray-700 bg-[#0d1117]", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs font-bold px-2 py-1 bg-blue-600 rounded text-white uppercase", children: file.type }), _jsx("span", { className: "text-sm text-gray-300 font-mono", children: file.path })] }), _jsx("button", { onClick: onClose, className: "p-1 hover:bg-gray-700 rounded-full transition-colors", children: _jsx(X, { className: "w-5 h-5 text-gray-400 hover:text-white" }) })] }), _jsx("div", { className: "flex-1 bg-black flex items-center justify-center min-h-[400px] relative group", children: error ? (_jsx("div", { className: "text-red-400", children: "Failed to load media source." })) : (_jsxs(_Fragment, { children: [file.type === 'video' && (_jsx("video", { src: src, controls: true, autoPlay: true, className: "w-full h-full max-h-[600px] outline-none" })), file.type === 'audio' && (_jsxs("div", { className: "w-full p-8 flex flex-col items-center gap-4", children: [_jsx("div", { className: "w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full animate-pulse" }), _jsx("audio", { src: src, controls: true, className: "w-full" })] })), file.type === 'image' && (_jsx("img", { src: src, alt: "Preview", className: "max-w-full max-h-[600px] object-contain" }))] })) })] }) }));
};
