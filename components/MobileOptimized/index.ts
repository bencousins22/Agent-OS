/**
 * MobileOptimized/index.ts
 * Central export for all React 19 mobile-optimized components
 */

export { ActivityBarMobile } from './ActivityBarMobile';
export { ChatInterfaceMobile } from './ChatInterfaceMobile';
export { TerminalViewMobile } from './TerminalViewMobile';
export {
    useTouchGestures,
    useHapticFeedback,
    useMotionPreference,
    useViewport,
    useSafeArea,
    hapticPatterns,
    type TouchGestureConfig,
} from './MobileUtilities';

// Re-export for convenience
export * from './MobileUtilities';
