# Mobile Optimization Guide - React 19 Enhanced Components

## Overview

This directory contains production-ready, React 19-optimized mobile components for Aussie OS. Each component is designed with modern mobile UX patterns, accessibility standards, and performance optimizations.

## Components

### 1. **ActivityBarMobile** - Mobile Bottom Navigation
Replaces the desktop sidebar with a touch-friendly bottom navigation bar.

**Key Features:**
- ✅ Minimum 44px touch target size (WCAG 2.1 Level AAA)
- ✅ Haptic feedback support
- ✅ Badge system for notifications
- ✅ `useTransition` for smooth navigation
- ✅ Reduced motion support
- ✅ ARIA labels and roles

**Usage:**
```tsx
import { ActivityBarMobile } from './MobileOptimized';

<ActivityBarMobile
    activeView={activeView}
    onNavigate={handleNavigate}
    onSpotlight={handleSpotlight}
    onMenuToggle={handleMenuToggle}
    onChatToggle={handleChatToggle}
    unreadMessages={5}
/>
```

**Mobile Navigation Flow:**
- Dashboard → Projects → Code Editor → Browser → Flow
- Chat toggle (badge shows unread count)
- Menu for secondary actions

---

### 2. **ChatInterfaceMobile** - Mobile Chat Panel
Optimized chat interface with React 19's `useOptimistic` hook for instant feedback.

**Key Features:**
- ✅ `useOptimistic` for instant message feedback
- ✅ Sticky composer at bottom
- ✅ Smooth scroll-to-bottom
- ✅ Touch-optimized copy button
- ✅ Markdown rendering with code highlighting
- ✅ Better text scaling on small screens

**Usage:**
```tsx
import { ChatInterfaceMobile } from './MobileOptimized';

<ChatInterfaceMobile
    messages={messages}
    onQuickAction={handleSendMessage}
    isProcessing={isProcessing}
/>
```

**UX Improvements:**
- Messages render with optimistic UI (shows immediately)
- 90% width max to avoid edge-to-edge stretch
- Compact avatar and timestamp display
- One-tap copy for assistant messages
- "Typing..." indicator with animated dots

---

### 3. **TerminalViewMobile** - Mobile Terminal Interface
Touch-friendly terminal emulator with quick command palette.

**Key Features:**
- ✅ Collapsible command palette (4 quick commands)
- ✅ Keyboard history (↑↓ arrows)
- ✅ Command logging with timestamps
- ✅ Color-coded output types
- ✅ Responsive syntax highlighting
- ✅ Touch-optimized input area

**Usage:**
```tsx
import { TerminalViewMobile } from './MobileOptimized';

<TerminalViewMobile
    blocks={terminalBlocks}
    onExecute={handleExecute}
    statusLabel="terminal"
/>
```

**Quick Commands:**
- `ls` - List Files
- `pwd` - Current Directory
- `git status` - Git Status
- `clear` - Clear Terminal

---

## Mobile Utilities & Hooks

### `useTouchGestures`
Detect swipe, long-press, and double-tap gestures.

```tsx
import { useTouchGestures, hapticPatterns } from './MobileOptimized';

const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchGestures({
    onSwipeLeft: () => {
        hapticPatterns.tap();
        navigateNext();
    },
    onSwipeRight: () => {
        hapticPatterns.tap();
        navigatePrev();
    },
    onLongPress: (duration) => {
        hapticPatterns.success();
        showContextMenu();
    },
    threshold: 50, // minimum pixels for swipe
});

return (
    <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
    >
        Content
    </div>
);
```

### `useHapticFeedback`
Simple haptic feedback API wrapper.

```tsx
const { vibrate } = useHapticFeedback();

<button onClick={() => vibrate([10, 20, 10])}>Feedback</button>
```

### `useMotionPreference`
Detect user motion/animation preferences.

```tsx
const { prefersReducedMotion, prefersLightMode } = useMotionPreference();

return (
    <div className={prefersReducedMotion() ? 'motion-reduce:*' : ''}>
        Content
    </div>
);
```

### `useViewport`
Responsive viewport detection without media queries.

```tsx
const { isMobile, isTablet, isDesktop, width, height } = useViewport();

return isMobile ? <MobileLayout /> : <DesktopLayout />;
```

### `useSafeArea`
Get safe area measurements (notches, home indicators).

```tsx
const safeArea = useSafeArea();

return (
    <div style={{ paddingBottom: safeArea.bottom }}>
        Content
    </div>
);
```

---

## React 19 Features Used

### 1. **`useTransition`** - Smooth Navigation
```tsx
const [isPending, startTransition] = useTransition();

const handleNavigate = (view) => {
    startTransition(() => {
        onNavigate(view);
    });
};
```
- Provides visual feedback during route transitions
- Prevents UI freezing on slow networks

### 2. **`useOptimistic`** - Instant Feedback
```tsx
const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMsg) => [...state, { ...newMsg, isOptimistic: true }]
);

// Shows message immediately, removes optimistic flag when server confirms
```
- Messages appear instantly when sent
- Updates in place when server confirms
- Better perceived performance

### 3. **`use()` - Server Components Ready**
All components support React Server Components (future-ready).

### 4. **Suspense Boundaries**
```tsx
<Suspense fallback={<SkeletonLoader />}>
    <ChatInterfaceMobile {...props} />
</Suspense>
```

---

## Integration Steps

### Step 1: Replace Components in `App.tsx`

**Before (Desktop):**
```tsx
import { ActivityBar } from './components/ActivityBar';
```

**After (Mobile):**
```tsx
import { ActivityBarMobile } from './components/MobileOptimized';

// In mobile render path:
{isMobile && (
    <ActivityBarMobile
        activeView={activeView}
        onNavigate={handleNavigate}
        {...props}
    />
)}
```

### Step 2: Update Chat Panel

**Before:**
```tsx
<ChatInterface messages={messages} {...props} />
```

**After:**
```tsx
import { ChatInterfaceMobile } from './components/MobileOptimized';

{isMobile ? (
    <ChatInterfaceMobile messages={messages} {...props} />
) : (
    <ChatInterface messages={messages} {...props} />
)}
```

### Step 3: Update Terminal View

**Before:**
```tsx
<TerminalView blocks={terminalBlocks} isMobile={true} />
```

**After:**
```tsx
import { TerminalViewMobile } from './components/MobileOptimized';

{isMobile ? (
    <TerminalViewMobile blocks={terminalBlocks} {...props} />
) : (
    <TerminalView blocks={terminalBlocks} {...props} />
)}
```

---

## Performance Optimizations

### Code Splitting
```tsx
const ChatInterfaceMobile = lazy(() => 
    import('./components/MobileOptimized').then(m => ({ 
        default: m.ChatInterfaceMobile 
    }))
);
```

### Memoization
All components use `React.memo()` to prevent unnecessary re-renders:
```tsx
export const ChatInterfaceMobile = React.memo(({ messages, ...props }) => {
    // Component code
});
```

### Lazy Loading
```tsx
<Suspense fallback={<SkeletonLoader />}>
    <ChatInterfaceMobile {...props} />
</Suspense>
```

---

## Accessibility (WCAG 2.1 AA)

### Touch Targets
- Minimum 44×44px (iOS) / 48×48dp (Android)
- Adequate spacing between interactive elements

### ARIA Labels
```tsx
<button aria-label="Send message">
    <Send className="w-4 h-4" />
</button>
```

### Keyboard Navigation
- All buttons accessible via keyboard
- Tab order is logical
- `aria-current` for active navigation

### Motion
```tsx
// Respects prefers-reduced-motion
<div className="motion-safe:animate-pulse motion-reduce:animate-none">
    Typing indicator
</div>
```

---

## Browser Support

| Feature | Chrome | Firefox | Safari | iOS |
|---------|--------|---------|--------|-----|
| Touch Events | ✅ | ✅ | ✅ | ✅ |
| Vibration API | ✅ | ✅ | ❌ | ✅ |
| useTransition | ✅ 19+ | ✅ 19+ | ✅ 19+ | ✅ |
| useOptimistic | ✅ 19+ | ✅ 19+ | ✅ 19+ | ✅ |
| Safe Area | ✅ | ✅ | ✅ | ✅ |

---

## Testing Mobile Components

### Device Testing
```bash
npm run dev
# Open http://localhost:5173 on mobile device or use DevTools device emulation
```

### Performance Profiling
```bash
npm run build
# Check bundle size and performance metrics
```

### Gesture Testing
```tsx
// In DevTools console
navigator.vibrate([10, 20, 10]); // Test haptics
```

---

## Common Patterns

### Pull-to-Refresh
```tsx
const { handleTouchStart, handleTouchEnd } = useTouchGestures({
    onSwipeDown: () => {
        refetchMessages();
        hapticPatterns.success();
    },
    threshold: 50,
});
```

### Swipe Navigation
```tsx
const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchGestures({
    onSwipeLeft: () => navigateNext(),
    onSwipeRight: () => navigatePrev(),
});
```

### Long-Press Context Menu
```tsx
const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchGestures({
    onLongPress: () => {
        showContextMenu();
        hapticPatterns.warning();
    },
    longPressDuration: 500,
});
```

---

## Troubleshooting

### Components not rendering
- ✅ Check viewport is < 768px
- ✅ Verify `isMobile` prop is true
- ✅ Check console for errors

### Haptic feedback not working
- ✅ Only works on HTTPS or localhost
- ✅ Device must support Vibration API
- ✅ Check browser compatibility

### Touch gestures not detecting
- ✅ Ensure event handlers are attached
- ✅ Verify touch threshold (default 50px)
- ✅ Check device orientation

---

## Future Enhancements

- [ ] Native mobile app bridges (React Native)
- [ ] Offline support with Service Workers
- [ ] PWA manifest and install prompts
- [ ] Mobile-specific animations using Framer Motion
- [ ] Voice input for terminal commands
- [ ] Gesture recording/customization UI

---

## References

- [React 19 Docs](https://react.dev)
- [Touch Events API](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [WCAG 2.1 Mobile](https://www.w3.org/WAI/WCAG21/Understanding/target-size)
- [Apple Safe Area](https://developer.apple.com/design/human-interface-guidelines/layout/overview/safe-areas/)
- [Android Material Design](https://m3.material.io/foundations/accessible-design)

---

**Last Updated:** November 2025  
**React Version:** 19.2.0  
**Target Devices:** iOS 13+, Android 8+
