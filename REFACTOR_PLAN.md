# Aussie OS - Comprehensive Refactoring Plan
## React 19 Modernization, Bug Fixes & Agent Enhancement

**Status**: Ready for Implementation
**Target**: Production-ready, fully tested React 19 application with advanced agent capabilities

---

## Executive Summary

This plan addresses:
1. **React 19 Feature Adoption** - Leverage new hooks and patterns
2. **Persistence Issues** - Migrate from localStorage to IndexedDB
3. **Agent System Enhancement** - Build robust claude-flow multi-agent system
4. **Bug Fixes** - Address console errors, empty catches, and edge cases
5. **Code Quality** - Improve TypeScript strictness, error boundaries, testing

---

## Phase 1: React 19 Feature Integration

### 1.1 Implement Error Boundaries with Recovery
**Issue**: No error boundaries in the app currently
**Solution**: Create React 19 error boundaries with recovery mechanisms

**Files to Create/Modify**:
- `components/ErrorBoundary.tsx` (NEW)
- `App.tsx` (wrap components)

**Features**:
- Granular error boundaries for each major section
- Error recovery with retry mechanism
- Error reporting to user-friendly notifications
- Preserve app state across errors

### 1.2 Add useOptimistic for File Operations
**Issue**: File writes feel slow with no immediate feedback
**Solution**: Use React 19's `useOptimistic` hook

**Files to Modify**:
- `components/FileExplorer.tsx`
- `components/MonacoEditor.tsx`
- `services/fileSystem.ts`

**Benefits**:
- Instant UI updates before persistence completes
- Automatic rollback on errors
- Better perceived performance

### 1.3 Implement useActionState for Async Operations
**Issue**: Manual loading state management for all async operations
**Solution**: Use React 19's `useActionState` (formerly `useFormState`)

**Files to Modify**:
- `components/DeployView.tsx`
- `components/ChatInterface.tsx`
- `services/useAgent.ts`

**Benefits**:
- Standardized async action handling
- Built-in pending states
- Better error handling

### 1.4 Add use() Hook for Resource Loading
**Issue**: Manual promise handling in components
**Solution**: Leverage React 19's `use()` hook for cleaner async code

**Files to Modify**:
- `components/Dashboard.tsx`
- `components/ProjectView.tsx`

---

## Phase 2: Persistence & Storage Migration

### 2.1 Complete IndexedDB Migration
**Issue**: FileSystem still uses localStorage (5-10MB limit), IndexedDB service exists but isn't used
**Solution**: Refactor FileSystemService to use IndexedDB

**Files to Modify**:
- `services/fileSystem.ts` - Integrate with `indexedDB.ts`
- `services/indexedDB.ts` - Add directory support

**Implementation**:
```typescript
// Hybrid approach during migration
class FileSystemService {
  private async load() {
    // Try IndexedDB first
    let data = await indexedDBService.loadFileTree();
    if (!data) {
      // Migrate from localStorage
      data = this.loadFromStorage();
      if (data) await indexedDBService.migrateFromLocalStorage();
    }
    return data;
  }
}
```

**Benefits**:
- Unlimited storage (browser quota ~50% of available disk)
- Better performance for large projects
- Atomic transactions

### 2.2 Add Cross-Tab Synchronization
**Issue**: Changes in one tab don't reflect in others
**Solution**: Use BroadcastChannel API

**Files to Create/Modify**:
- `services/storageSync.ts` (NEW)
- `services/fileSystem.ts`
- `services/useAgent.ts`

**Implementation**:
```typescript
const channel = new BroadcastChannel('aussie-os-sync');
channel.onmessage = (e) => {
  if (e.data.type === 'file-change') {
    // Refresh local state
  }
};
```

### 2.3 Implement Auto-Save with Debouncing
**Issue**: No auto-save in Monaco editor
**Solution**: Add debounced auto-save

**Files to Modify**:
- `components/MonacoEditor.tsx`

**Implementation**:
```typescript
const debouncedSave = useDeferredValue(editorContent);
useEffect(() => {
  if (debouncedSave && path) {
    fs.writeFile(path, debouncedSave);
  }
}, [debouncedSave]);
```

### 2.4 Add Service Worker for Offline Support
**Issue**: App doesn't work offline
**Solution**: Implement service worker with cache-first strategy

**Files to Create**:
- `public/sw.js` (NEW)
- `src/registerSW.ts` (NEW)

---

## Phase 3: Agent System Enhancement (claude-flow)

### 3.1 Build Real Swarm Orchestrator
**Issue**: `services/swarm.ts` is just a placeholder stub
**Solution**: Implement multi-agent consensus system

**Files to Modify/Create**:
- `services/swarm.ts` - Full implementation
- `services/agentPool.ts` (NEW) - Agent lifecycle management
- `types.ts` - Add agent types

**Features**:
```typescript
interface SwarmAgent {
  id: string;
  role: 'leader' | 'worker' | 'validator';
  model: 'gemini-2.5-pro' | 'gemini-2.5-flash';
  status: 'idle' | 'working' | 'voting';
}

class SwarmOrchestrator {
  async executeWithConsensus(
    task: string,
    agentCount: number,
    threshold: number
  ): Promise<ConsensusResult>;

  async spawnSpecialized(
    roles: AgentRole[]
  ): Promise<SpecializedSwarm>;
}
```

**Agent Roles**:
- **Planner**: Breaks down complex tasks
- **Coder**: Implements solutions
- **Reviewer**: Validates code quality
- **Tester**: Generates and runs tests
- **Optimizer**: Refactors for performance

### 3.2 Enhance Flow Editor with Advanced Nodes
**Issue**: Limited node types in FlowEditor
**Solution**: Add 10+ specialized node types

**Files to Modify**:
- `components/FlowEditor.tsx`
- `services/julesOrchestrator.ts`
- `types.ts`

**New Node Types**:
- **Conditional**: If/else branching
- **Loop**: Iterate over data
- **Transform**: Data manipulation
- **API Call**: HTTP requests
- **Swarm**: Multi-agent consensus
- **Schedule**: Time-based triggers
- **Error Handler**: Catch and recover

### 3.3 Fix Model Version Bug
**Issue**: `julesOrchestrator.ts:22` uses 'gemini-3-pro-preview' (invalid)
**Solution**: Update to correct model name

**Files to Modify**:
- `services/julesOrchestrator.ts` line 22

```diff
- model: 'gemini-3-pro-preview',
+ model: 'gemini-2.5-pro',
```

### 3.4 Add Agent State Persistence
**Issue**: Agent sessions lost on page refresh
**Solution**: Persist to IndexedDB

**Files to Modify**:
- `services/jules.ts`
- `services/indexedDB.ts`

**Implementation**:
```typescript
class JulesAgent {
  async saveSession() {
    await indexedDBService.writeFile(
      '/.system/agent-session.json',
      JSON.stringify({
        messages: this.messageHistory,
        context: this.chatSession?.export(),
      })
    );
  }

  async restoreSession() {
    const data = await indexedDBService.readFile('/.system/agent-session.json');
    // Restore chat context
  }
}
```

### 3.5 Implement Agent Daemon for Background Tasks
**Issue**: No background agent execution
**Solution**: Create persistent agent daemon

**Files to Create**:
- `services/agentDaemon.ts` - Already exists, needs full implementation

**Features**:
- Run flows in background
- Scheduled agent tasks
- Resource monitoring
- Auto-restart on errors

---

## Phase 4: Bug Fixes & Code Quality

### 4.1 Remove Console Statements
**Issue**: 22 files with console.log/error/warn
**Solution**: Replace with proper logging service

**Files to Create/Modify**:
- `services/logger.ts` (NEW)
- All 22 files with console statements

**Implementation**:
```typescript
class Logger {
  debug(msg: string, meta?: any) {
    if (import.meta.env.DEV) console.log(msg, meta);
  }
  error(msg: string, error?: Error) {
    bus.emit('notification', { type: 'error', message: msg });
    // Send to error tracking service in production
  }
}
```

### 4.2 Fix Empty Catch Blocks
**Issue**: 4 files with empty catch blocks that swallow errors
**Solution**: Add proper error handling

**Files to Modify**:
- `components/StatusBar.tsx`
- Others identified by grep

**Pattern**:
```diff
  try {
    dangerousOperation();
  } catch (e) {
-   // Silent fail
+   logger.error('Operation failed', e);
+   bus.emit('notification', {
+     type: 'error',
+     message: 'Failed to complete operation'
+   });
  }
```

### 4.3 Replace Alert() with Toast Notifications
**Issue**: `FlowEditor.tsx` uses alert() for user feedback
**Solution**: Use notification system

**Files to Modify**:
- `components/FlowEditor.tsx`
- `services/notification.ts`

### 4.4 Add Input Validation
**Issue**: No validation on user inputs (file paths, commands, etc.)
**Solution**: Add Zod schemas for runtime validation

**Files to Create/Modify**:
- `schemas/validation.ts` (NEW)
- All components accepting user input

**Example**:
```typescript
import { z } from 'zod';

const FilePathSchema = z.string()
  .min(1)
  .regex(/^\/[\w\-\/\.]+$/, 'Invalid file path');

function writeFile(path: string, content: string) {
  const validPath = FilePathSchema.parse(path);
  // Safe to proceed
}
```

### 4.5 Improve Error Messages
**Issue**: Generic error messages throughout
**Solution**: Context-specific, actionable error messages

**Pattern**:
```diff
- throw new Error("Failed");
+ throw new Error(
+   `Failed to write file "${path}": ${reason}. ` +
+   `Ensure the directory exists and you have write permissions.`
+ );
```

---

## Phase 5: Performance Optimizations

### 5.1 Add React.memo to Heavy Components
**Issue**: Unnecessary re-renders
**Solution**: Memoize expensive components

**Files to Modify**:
- `components/MonacoEditor.tsx`
- `components/TerminalView.tsx`
- `components/FileExplorer.tsx`

### 5.2 Implement Virtual Scrolling for Large Lists
**Issue**: File explorer and terminal slow with many items
**Solution**: Use react-window or tanstack-virtual

**Files to Modify**:
- `components/FileExplorer.tsx`
- `components/TerminalView.tsx`

### 5.3 Optimize Bundle Size
**Current**: Already good with code splitting
**Improvement**: Further split Monaco editor chunks

**Files to Modify**:
- `vite.config.ts`

```typescript
manualChunks: {
  'monaco-core': ['@monaco-editor/react'],
  'monaco-languages': ['monaco-editor/esm/vs/language/...'],
}
```

### 5.4 Add Suspense Boundaries with Skeletons
**Issue**: Generic loading spinner
**Solution**: Content-aware skeleton screens

**Files to Create/Modify**:
- `components/Skeletons.tsx` (NEW)
- All lazy-loaded components

---

## Phase 6: Testing & Validation

### 6.1 Add Unit Tests
**Files to Create**:
- `__tests__/services/fileSystem.test.ts`
- `__tests__/services/jules.test.ts`
- `__tests__/services/swarm.test.ts`

**Coverage Target**: 70% for services, 50% for components

### 6.2 Add Integration Tests
**Files to Create**:
- `__tests__/integration/agent-flow.test.ts`
- `__tests__/integration/file-operations.test.ts`

### 6.3 Add E2E Tests with Playwright
**Files to Create**:
- `e2e/basic-workflow.spec.ts`
- `e2e/agent-interaction.spec.ts`

---

## Implementation Roadmap

### Week 1: Foundation
- [ ] Phase 1.1: Error boundaries
- [ ] Phase 2.1: IndexedDB migration
- [ ] Phase 4.1: Logging service
- [ ] Phase 4.2: Fix empty catches

### Week 2: React 19 Features
- [ ] Phase 1.2: useOptimistic
- [ ] Phase 1.3: useActionState
- [ ] Phase 1.4: use() hook
- [ ] Phase 2.3: Auto-save

### Week 3: Agent Enhancement
- [ ] Phase 3.1: Swarm orchestrator
- [ ] Phase 3.2: Enhanced flow nodes
- [ ] Phase 3.3: Fix model version
- [ ] Phase 3.4: Agent persistence

### Week 4: Polish & Performance
- [ ] Phase 2.2: Cross-tab sync
- [ ] Phase 2.4: Service worker
- [ ] Phase 3.5: Agent daemon
- [ ] Phase 5.1-5.4: Performance

### Week 5: Quality & Testing
- [ ] Phase 4.3-4.5: Bug fixes
- [ ] Phase 6.1-6.3: Testing
- [ ] Documentation updates
- [ ] Production deployment

---

## Risk Mitigation

### Breaking Changes
- **Risk**: IndexedDB migration could lose data
- **Mitigation**: Export/backup feature before migration

### Performance Regression
- **Risk**: New features slow down app
- **Mitigation**: Performance benchmarks, lighthouse tests

### Agent Reliability
- **Risk**: Swarm consensus takes too long
- **Mitigation**: Timeout fallbacks, single-agent mode

---

## Success Metrics

1. **Performance**
   - Lighthouse score: 95+ (currently ~85)
   - Time to Interactive: <2s (currently ~3s)
   - File operation latency: <50ms (currently ~200ms)

2. **Reliability**
   - Error rate: <0.1%
   - Agent success rate: >95%
   - Test coverage: >70%

3. **User Experience**
   - No data loss scenarios
   - Offline functionality
   - Cross-tab synchronization working

---

## Dependencies to Add

```json
{
  "dependencies": {
    "zod": "^3.23.0",
    "immer": "^10.0.0",
    "@tanstack/react-virtual": "^3.0.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0"
  }
}
```

---

## Questions for User

1. **Agent Swarm Priority**: Should we focus on speed (2-3 agents) or accuracy (5+ agents with consensus)?
2. **Offline Mode**: Is full offline support critical, or just data persistence?
3. **Testing**: What's the minimum acceptable test coverage?
4. **Breaking Changes**: OK to require fresh start for IndexedDB migration, or must preserve all existing data?

---

## Next Steps

1. **Review this plan** and provide feedback
2. **Answer the questions** above
3. **Approve** to begin implementation
4. We'll proceed phase by phase with testing at each step

---

**Generated**: 2025-11-25
**Estimated Effort**: 5 weeks (1 developer, full-time)
**Priority**: High - Addresses critical persistence and reliability issues
