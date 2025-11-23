import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { bus } from '../services/eventBus';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
export const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    useEffect(() => {
        const unsubscribe = bus.subscribe((e) => {
            if (e.type === 'notification') {
                const notif = e.payload;
                setNotifications(prev => [...prev, notif]);
                // Auto dismiss
                setTimeout(() => {
                    setNotifications(prev => prev.filter(n => n.id !== notif.id));
                }, 5000);
            }
        });
        return () => unsubscribe();
    }, []);
    if (notifications.length === 0)
        return null;
    return (_jsx("div", { className: "absolute top-2 left-4 right-4 md:top-4 md:right-4 md:left-auto z-[9999] flex flex-col gap-2 md:w-80 pointer-events-none", children: notifications.map(n => (_jsxs("div", { className: "bg-[#161b22] border border-gray-700 shadow-xl rounded-lg p-4 flex gap-3 pointer-events-auto animate-in slide-in-from-top md:slide-in-from-right duration-300", children: [_jsxs("div", { className: `
                        shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                        ${n.type === 'success' ? 'bg-green-500/20 text-green-500' :
                        n.type === 'error' ? 'bg-red-500/20 text-red-500' :
                            n.type === 'warning' ? 'bg-orange-500/20 text-orange-500' :
                                'bg-blue-500/20 text-blue-500'}
                    `, children: [n.type === 'success' && _jsx(CheckCircle, { className: "w-5 h-5" }), n.type === 'error' && _jsx(AlertCircle, { className: "w-5 h-5" }), n.type === 'warning' && _jsx(AlertTriangle, { className: "w-5 h-5" }), n.type === 'info' && _jsx(Info, { className: "w-5 h-5" })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "font-bold text-sm text-gray-200", children: n.title }), _jsx("p", { className: "text-xs text-gray-400 truncate", children: n.message })] }), _jsx("button", { onClick: () => setNotifications(prev => prev.filter(x => x.id !== n.id)), className: "shrink-0 text-gray-500 hover:text-white", children: _jsx(X, { className: "w-4 h-4" }) })] }, n.id))) }));
};
