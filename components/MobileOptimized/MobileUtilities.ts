/**
 * MobileUtilities.ts - React 19 mobile optimization utilities
 * Provides hooks and helpers for:
 * - Touch event handling
 * - Gesture recognition (swipe, long-press)
 * - Viewport detection
 * - Haptic feedback
 * - Motion preferences
 */

import React, { useEffect, useRef, useCallback } from 'react';

/**
 * Touch gesture type definitions
 */
export interface TouchGestureConfig {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    onLongPress?: (duration: number) => void;
    onDoubleTap?: () => void;
    threshold?: number; // minimum distance for swipe (px)
    longPressDuration?: number; // ms
}

/**
 * Hook for detecting touch gestures
 */
export const useTouchGestures = (config: TouchGestureConfig) => {
    const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
    const touchMove = useRef<{ x: number; y: number } | null>(null);
    const lastTapRef = useRef<number>(0);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);

    const threshold = config.threshold || 50;
    const longPressDuration = config.longPressDuration || 500;

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const { clientX, clientY } = e.touches[0];
        touchStart.current = { x: clientX, y: clientY, time: Date.now() };
        touchMove.current = null;

        // Set up long press timer
        if (config.onLongPress) {
            longPressTimer.current = setTimeout(() => {
                config.onLongPress?.(longPressDuration);
            }, longPressDuration);
        }
    }, [config, longPressDuration]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!touchStart.current) return;
        const { clientX, clientY } = e.touches[0];
        touchMove.current = { x: clientX, y: clientY };

        // Cancel long press on move
        if (longPressTimer.current !== undefined) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = undefined;
        }
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (!touchStart.current || !touchMove.current) return;

        const deltaX = touchMove.current.x - touchStart.current.x;
        const deltaY = touchMove.current.y - touchStart.current.y;
        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
        const timeDelta = Date.now() - touchStart.current.time;

        // Detect swipe
        if (distance > threshold && timeDelta < 300) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 0) {
                    config.onSwipeRight?.();
                } else {
                    config.onSwipeLeft?.();
                }
            } else {
                // Vertical swipe
                if (deltaY > 0) {
                    config.onSwipeDown?.();
                } else {
                    config.onSwipeUp?.();
                }
            }
        }

        // Detect double tap
        if (config.onDoubleTap && distance < 20) {
            const now = Date.now();
            if (now - lastTapRef.current < 300) {
                config.onDoubleTap();
                lastTapRef.current = 0;
            } else {
                lastTapRef.current = now;
            }
        }

        // Clear long press timer
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }

        touchStart.current = null;
        touchMove.current = null;
    }, [config, threshold]);

    return { handleTouchStart, handleTouchMove, handleTouchEnd };
};

/**
 * Hook for haptic feedback
 */
export const useHapticFeedback = () => {
    const vibrate = useCallback((pattern: number | number[] = 10) => {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }, []);

    return { vibrate };
};

/**
 * Hook for detecting motion preferences
 */
export const useMotionPreference = () => {
    const prefersReducedMotion = useCallback(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }, []);

    const prefersLightMode = useCallback(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia('(prefers-color-scheme: light)').matches;
    }, []);

    return { prefersReducedMotion, prefersLightMode };
};

/**
 * Hook for viewport dimensions and responsive detection
 */
export const useViewport = (): {
    width: number;
    height: number;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
} => {
    const [viewport, setViewport] = React.useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
        isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
        isTablet: typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024,
        isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : false,
    });

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            setViewport({
                width,
                height,
                isMobile: width < 768,
                isTablet: width >= 768 && width < 1024,
                isDesktop: width >= 1024,
            });
        };

        handleResize(); // Set initial size
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return viewport;
};

/**
 * Hook for safe area (notches, home indicators)
 */
export const useSafeArea = (): { top: number; right: number; bottom: number; left: number } => {
    const [safeArea, setSafeArea] = React.useState({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    });

    useEffect(() => {
        if (typeof window !== 'undefined' && CSS && CSS.supports) {
            const root = document.documentElement;
            const top = CSS.supports('padding: max(0px)')
                ? parseInt(getComputedStyle(root).getPropertyValue('--safe-area-inset-top') || '0')
                : 0;
            const right = CSS.supports('padding: max(0px)')
                ? parseInt(getComputedStyle(root).getPropertyValue('--safe-area-inset-right') || '0')
                : 0;
            const bottom = CSS.supports('padding: max(0px)')
                ? parseInt(getComputedStyle(root).getPropertyValue('--safe-area-inset-bottom') || '0')
                : 0;
            const left = CSS.supports('padding: max(0px)')
                ? parseInt(getComputedStyle(root).getPropertyValue('--safe-area-inset-left') || '0')
                : 0;

            setSafeArea({ top, right, bottom, left });
        }
    }, []);

    return safeArea;
};

/**
 * Utility to trigger haptic feedback patterns
 */
export const hapticPatterns = {
    tap: () => {
        if ('vibrate' in navigator) navigator.vibrate(10);
    },
    success: () => {
        if ('vibrate' in navigator) navigator.vibrate([10, 20, 10]);
    },
    error: () => {
        if ('vibrate' in navigator) navigator.vibrate([50, 30, 50]);
    },
    warning: () => {
        if ('vibrate' in navigator) navigator.vibrate([20, 10, 20, 10, 20]);
    },
};

export default {
    useTouchGestures,
    useHapticFeedback,
    useMotionPreference,
    useViewport,
    useSafeArea,
    hapticPatterns,
};
