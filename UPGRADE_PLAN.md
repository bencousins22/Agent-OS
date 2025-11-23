# Aussie OS UI Upgrade Plan (React 19 Beta)

This plan audits every UI surface and maps a desktop/mobile upgrade path using current React 19.2 guidance (`startTransition`, `useOptimistic`, `useActionState`, `useEffectEvent`, concurrent Suspense boundaries) and the latest component docs (Monaco 0.45, Lucide React 0.554, Vite 6). Beta UI direction focuses on: design tokens + motion primitives, mobile-first layout with safe-area handling, accessibility (a11y labels, reduced motion), and optimistic UX for agent actions.

## Core Principles
- **React 19 patterns**: wrap heavy view switches in `startTransition`, use `useOptimistic` for writes (chat send, git, deploy), `useActionState` for forms (deploy/settings), `useEffectEvent` for resize/listeners, and Suspense fallbacks per vertical.
- **Beta UI technology**: design-token driven surfaces, depth via gradients/glows instead of flat backgrounds, meaningful motion (entrances, progress cues), and adaptive density controls for desktop vs mobile.
- **Performance**: code-split every vertical, keep Monaco/browser/agent panes isolated behind Suspense, prefer requestIdle callbacks for non-urgent work, and memoize derived lists.
- **Mobile**: bottom-nav + slide-over drawers, safe-area padding, touch hit-targets ≥44px, reduced motion, constrained iframe height, and sticky action bars.

## Component-by-Component Actions

- **App.tsx (shell)** – Desktop: gate view switches through `startTransition`, keep chat/viewport in separate Suspense trees, expose global reduced-motion flag. Mobile: unify bottom nav + slide-out menu, lock chat overlay height when browser split is active.
- **ActivityBar + MobileSidebar** – Desktop: add focus states/tooltips driven by tokens, aria-current for active view. Mobile: wire the Menu tab to the drawer, add safe-area padding and gesture close; preload icons with `Suspense` boundary for instant open.
- **Workspace** – Desktop: add “compact/dense” toggle, ensure Resizable clamps via CSS variables, split terminal/Problems into lazy chunks. Mobile: tabbed editor/terminal/files already present; add deferred loading for Monaco to protect memory.
- **Resizable** – Desktop: respect min/max from CSS vars and emit resize events for charts; Mobile: disable drag handles on touch and fall back to stacked layout.
- **BottomTicker / StatusBar** – Desktop: align with design tokens, hook into real system stats store; Mobile: collapse to pill or hide behind quick actions.

- **ChatInterface & AgentStatus** – Desktop: use `useOptimistic` for outgoing messages, render markdown with code copy buttons, add ARIA labels and skeletons; Mobile: sticky composer with 16px font, add scroll-to-bottom affordance (already present) with reduced-motion fallback.
- **NotificationCenter** – Desktop: queue handling with max length, focus-trap when opened; Mobile: slide-in from bottom, larger tap targets, respectful auto-dismiss on backgrounded state.
- **Spotlight** – Desktop: migrate key handling to `useEffectEvent`, add async file search via `use` when data APIs migrate; Mobile: full-screen sheet, larger rows.
- **BrowserView** – Desktop: use `startTransition` for navigation updates and optimistic page preview; add CSP + sandbox headers. Mobile: responsive iframe height, ghost cursor disabled, keep search bar as sticky bottom sheet when keyboard open.

- **Dashboard + WindowManager + NoteWidget + SystemInfo + VirtualFileSystem** – Desktop: snap-to-grid backed by CSS vars, `requestAnimationFrame` driven drag for icons/widgets, allow multi-select. Mobile: larger grid spacing, long-press context actions, minimize windows automatically to single-column stack; keep widgets keyboard-safe.

- **Workspace editing trio (MonacoEditor, TerminalView, FileExplorer)** – Desktop: Monaco 0.45 ESM loader with cached worker paths, editor accessibility (ARIA labels, font ligatures toggle), and “follow collaborator” camera; Terminal uses `useEffectEvent` for palette shortcuts and `useOptimistic` for command echo; FileExplorer to virtualize large trees and expose quick filters. Mobile: defer Monaco mount until tab active, add toolbar for common characters (already partially present), FileExplorer bottom sheet for context menus.

- **FlowEditor** – Desktop: canvas virtualization and pan/zoom gestures, node palette using `startTransition`, timeline ghost previews; Mobile: vertical stepper view with collapsible node editors, larger tap targets, and async save with `useActionState`.
- **TaskScheduler** – Desktop: add cron builder presets and optimistic task add/remove; Mobile: modal form with numeric keypad controls and safe-area aware buttons.
- **GitHubView** – Desktop: optimistic stage/commit with inline diff previews, use `useTransition` for refresh, align with GitHub REST v3 limits. Mobile: compress table layout, sticky commit bar, and offline warning banner.
- **DeployView** – Desktop: per-provider action state buttons using `useActionState`, log streaming via `use` once server data exists, toast linking to logs. Mobile: compact provider picker, sticky deploy CTA, auto-scroll logs with pause.
- **Marketplace** – Desktop: animate hero using motion tokens, filter pills as `role="tablist"`, support server-backed pagination. Mobile: card-first layout with lazy loading, “Install” buttons large and bottom-sticky.
- **ProjectView** – Desktop: Kanban-like grouping and presence badges tied to collaboration service, startTransition on open navigation. Mobile: segment control already present; add gesture to open team drawer.
- **SettingsView** – Desktop: `useActionState` for API key save, inline validation, wallpaper previews with reduced-motion fallback; Mobile: collapsible sections and safe-area aware inputs.
- **MediaPlayer** – Desktop: keyboard shortcuts, picture-in-picture for video, stream-level loading states. Mobile: constrain height, use native player controls, swipe-down to close.
- **System overlays (SystemInfo, BottomTicker)** – Desktop: auto-pull metrics from scheduler, add “live” indicator tied to WebSocket state. Mobile: reduce chroma, fold into StatusBar pill.

- **Apps (BotAppTemplate, BotDashboard, HyperliquidApp, SportsApps)** – Desktop: wrap API actions in `useActionState` and `useOptimistic` for trading/backtest updates, add risk warnings and keyboard shortcuts. Mobile: condensed cards, bottom sheet trade controls, disable non-mobile-friendly charts or swap to sparkline summaries.

## Cross-Cutting Tasks
- Create design tokens (color, radius, shadows, motion) and swap hard-coded values to variables; align Tailwind theme with tokens.
- Add `prefers-reduced-motion` + `prefers-contrast` support and ensure tap targets ≥44px.
- Audit accessibility: ARIA labels on nav/buttons, focus outlines, and semantic landmarks.
- Testing: add visual regression scenarios (desktop/tablet/phone breakpoints) and interaction tests for navigation, chat, terminal, deploy, and marketplace flows.
