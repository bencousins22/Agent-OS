
import React, { useEffect, useRef, useState } from 'react';

interface Props {
    direction: 'horizontal' | 'vertical';
    mode?: 'parent' | 'next'; // 'parent' resizes the container the handle is in. 'next' resizes the next sibling.
    reversed?: boolean; // If true, dragging left/up increases size (for Right/Bottom panels)
    minSize?: number;
    maxSize?: number;
    onResize?: (size: number) => void;
}

export const Resizable: React.FC<Props> = ({ 
    direction, 
    mode = 'parent', 
    reversed = false,
    minSize = 200,
    maxSize = 800,
    onResize
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const handleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handle = handleRef.current;
        if (!handle) return;

        const onMouseDown = (e: MouseEvent) => {
            e.preventDefault();
            setIsDragging(true);
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
            document.body.style.userSelect = 'none';
        };

        const onMouseMove = (e: MouseEvent) => {
            if (mode === 'parent') {
                const parent = handle.parentElement;
                if (!parent) return;

                if (direction === 'horizontal') {
                    // Resize parent width
                    const newWidth = e.clientX - parent.getBoundingClientRect().left;
                    if (newWidth > minSize && newWidth < maxSize) {
                        parent.style.width = `${newWidth}px`;
                        onResize?.(newWidth);
                    }
                }
            } else if (mode === 'next') {
                const target = handle.nextElementSibling as HTMLElement;
                if (!target) return;

                const rect = target.getBoundingClientRect();

                if (direction === 'horizontal') {
                    if (reversed) {
                        // Dragging left increases width (Right Panel)
                        // Width = RightEdge - MouseX
                        const rightEdge = rect.right;
                        const newWidth = rightEdge - e.clientX;
                        if (newWidth > minSize && newWidth < maxSize) {
                            target.style.width = `${newWidth}px`;
                            onResize?.(newWidth);
                        }
                    } else {
                        // Dragging right increases width (Left Panel)
                        const newWidth = e.clientX - rect.left;
                        if (newWidth > minSize && newWidth < maxSize) {
                            target.style.width = `${newWidth}px`;
                            onResize?.(newWidth);
                        }
                    }
                } else {
                    // Vertical resizing
                    if (reversed) {
                        // Dragging up increases height (Bottom Panel)
                        // Height = BottomEdge - MouseY
                        const bottomEdge = rect.bottom;
                        const newHeight = bottomEdge - e.clientY;
                        if (newHeight > 100 && newHeight < 600) {
                            target.style.height = `${newHeight}px`;
                        }
                    } else {
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

    return (
        <div 
            ref={handleRef}
            role="separator"
            aria-orientation={direction === 'horizontal' ? 'vertical' : 'horizontal'}
            className={`
                ${direction === 'horizontal' 
                    ? 'w-2 h-full cursor-col-resize flex-shrink-0' 
                    : 'h-2 w-full cursor-row-resize flex-shrink-0'}
                transition-colors relative group
            `}
        >
            <div 
                className={`
                    absolute inset-0 ${direction === 'horizontal' ? 'px-[6px]' : 'py-[6px]'}
                    flex items-center justify-center
                `}
            >
                <div 
                    className={`
                        ${direction === 'horizontal' ? 'w-[3px] h-full' : 'h-[3px] w-full'}
                        rounded-full bg-white/10 group-hover:bg-aussie-500/60 transition-colors
                        ${isDragging ? 'bg-aussie-500 shadow-[0_0_12px_rgba(0,229,153,0.7)]' : ''}
                    `}
                />
            </div>
        </div>
    );
};
