import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
export const Resizable = ({ direction, mode = 'parent', reversed = false, minSize = 200, maxSize = 800 }) => {
    const [isDragging, setIsDragging] = useState(false);
    const handleRef = useRef(null);
    useEffect(() => {
        const handle = handleRef.current;
        if (!handle)
            return;
        const onMouseDown = (e) => {
            e.preventDefault();
            setIsDragging(true);
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
            document.body.style.userSelect = 'none';
        };
        const onMouseMove = (e) => {
            if (mode === 'parent') {
                const parent = handle.parentElement;
                if (!parent)
                    return;
                if (direction === 'horizontal') {
                    // Resize parent width
                    const newWidth = e.clientX - parent.getBoundingClientRect().left;
                    if (newWidth > minSize && newWidth < maxSize) {
                        parent.style.width = `${newWidth}px`;
                    }
                }
            }
            else if (mode === 'next') {
                const target = handle.nextElementSibling;
                if (!target)
                    return;
                const rect = target.getBoundingClientRect();
                if (direction === 'horizontal') {
                    if (reversed) {
                        // Dragging left increases width (Right Panel)
                        // Width = RightEdge - MouseX
                        const rightEdge = rect.right;
                        const newWidth = rightEdge - e.clientX;
                        if (newWidth > minSize && newWidth < maxSize) {
                            target.style.width = `${newWidth}px`;
                        }
                    }
                    else {
                        // Dragging right increases width (Left Panel)
                        const newWidth = e.clientX - rect.left;
                        if (newWidth > minSize && newWidth < maxSize) {
                            target.style.width = `${newWidth}px`;
                        }
                    }
                }
                else {
                    // Vertical resizing
                    if (reversed) {
                        // Dragging up increases height (Bottom Panel)
                        // Height = BottomEdge - MouseY
                        const bottomEdge = rect.bottom;
                        const newHeight = bottomEdge - e.clientY;
                        if (newHeight > 100 && newHeight < 600) {
                            target.style.height = `${newHeight}px`;
                        }
                    }
                    else {
                        const newHeight = e.clientY - rect.top;
                        if (newHeight > 100 && newHeight < 600) {
                            target.style.height = `${newHeight}px`;
                        }
                    }
                }
            }
        };
        const onMouseUp = () => {
            setIsDragging(false);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
        handle.addEventListener('mousedown', onMouseDown);
        return () => {
            handle.removeEventListener('mousedown', onMouseDown);
        };
    }, [direction, mode, reversed, minSize, maxSize]);
    return (_jsx("div", { ref: handleRef, className: `
                ${direction === 'horizontal'
            ? 'w-1 cursor-col-resize hover:bg-aussie-500/50 z-50 flex-shrink-0'
            : 'h-1 w-full cursor-row-resize hover:bg-aussie-500/50 z-50 bg-[#0d1117] border-t border-os-border flex-shrink-0'}
                transition-colors
                ${isDragging ? 'bg-aussie-500' : 'bg-transparent'}
            ` }));
};
