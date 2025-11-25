# Aussie OS - Quick Start Guide 🚀

## 5-Minute Setup

### Step 1: Launch Aussie OS
```bash
npm install    # Install dependencies
npm run dev    # Start development server
```
Open http://localhost:3001

### Step 2: Navigate to Code Editor
Click **"Start Coding"** on Dashboard OR Click the **Code icon** in the left sidebar

### Step 3: Use the New Tools

#### 🔸 Agent Execution (Monitor Tasks)
**Shortcut**: `Ctrl+Shift+Alt`
- Watch Jules Agent execute tasks in real-time
- See workflow progress through pipeline
- Review execution history

#### 🔸 Code Snippets (Save & Insert)
**Shortcut**: `Ctrl+Shift+K`
1. Click **"New"** to create
2. Paste your code
3. Click **"Insert Snippet"** to add to editor

#### 🔸 Collaboration (See Team)
**Shortcut**: `Ctrl+Alt+T`
- See who's online
- View what file they're editing
- See their cursor position

#### 🔸 Analytics (Track Progress)
**Shortcut**: `Ctrl+Alt+L`
- View productivity metrics
- Check code statistics
- Monitor performance scores

#### 🔸 Activity Stream (Live Events)
**Shortcut**: `Ctrl+Alt+A`
- See all system events
- Filter by type (Code, Git, Deploy, etc.)
- Real-time updates

---

## Keyboard Shortcuts Cheat Sheet

| Shortcut | Tool | Effect |
|----------|------|--------|
| `Ctrl+Shift+Alt` | Agent | Toggle execution panel |
| `Ctrl+Shift+K` | Snippets | Toggle snippets manager |
| `Ctrl+Alt+T` | Collaboration | Toggle team panel |
| `Ctrl+Alt+L` | Analytics | Toggle metrics dashboard |
| `Ctrl+Alt+A` | Activity | Toggle event stream |
| `Esc` | Any | Close panel |

---

## Common Workflows

### Workflow #1: Save a Code Snippet
```
1. Open Snippets (Ctrl+Shift+K)
2. Click "New"
3. Fill: Title, Code, Language, Tags
4. Click "Save"
✓ Done! Use anytime with "Insert Snippet"
```

### Workflow #2: Monitor Agent Task
```
1. Send task to Jules Agent (Chat panel)
2. Open Agent Panel (Ctrl+Shift+Alt)
3. Watch workflow progress
4. Check execution history
✓ Review what agent did!
```

### Workflow #3: Track Team Activity
```
1. Open Collaboration (Ctrl+Alt+T)
2. See who's online
3. Click person to view details
4. Click "Message" to send note
✓ Real-time team visibility!
```

---

## Panel Overview

### 📍 Location
All panels appear on the **right side** of the code editor when active

### 🎨 Visual Design
- Dark theme with mint-green accents
- Card-based layouts
- Smooth animations
- Mobile responsive

### ⚙️ How to Use Panels
1. **Open**: Click button in toolbar OR use keyboard shortcut
2. **Switch**: Click different tab button at top
3. **Close**: Click X button OR press Esc
4. **Scroll**: Scroll wheel inside panel content

---

## Tips for Productivity 💡

### Pro Tips
- 🎯 Keep Snippets panel open while coding
- 🎯 Use keyboard shortcuts instead of clicking
- 🎯 Tag snippets for easy search
- 🎯 Monitor Activity Stream for deployment events
- 🎯 Check Analytics for productivity insights

### Best Practices
✅ Create snippets for reusable code
✅ Use descriptive titles and tags
✅ Review agent execution history
✅ Check team activity regularly
✅ Track metrics for improvement

---

## Common Questions

**Q: Where do my snippets save?**
A: Browser localStorage - they persist between sessions

**Q: Can I access panels on mobile?**
A: Yes! All panels are mobile-responsive

**Q: What if a shortcut doesn't work?**
A: Click the button directly instead, or check you're in Code Editor

**Q: How do I insert a snippet into my file?**
A: Open Snippets panel, select snippet, click "Insert Snippet"

**Q: Is collaboration real-time with other users?**
A: Currently shows sample data. Full real-time collab coming soon!

---

## Keyboard Shortcut Quick Reference

```
PANEL SHORTCUTS (In Code Editor Only)
├─ Ctrl+Shift+Alt  → Agent Execution Panel
├─ Ctrl+Shift+K    → Code Snippets Manager
├─ Ctrl+Alt+T      → Collaboration Panel
├─ Ctrl+Alt+L      → Analytics Dashboard
├─ Ctrl+Alt+A      → Activity Stream
└─ Esc             → Close any panel

EDITOR SHORTCUTS (Standard)
├─ Ctrl+S          → Save file
├─ Ctrl+Z          → Undo
├─ Ctrl+Shift+Z    → Redo
├─ Ctrl+F          → Find
├─ Ctrl+H          → Find & Replace
└─ Ctrl+/          → Comment line
```

---

## Next Steps

1. **Explore Dashboard**: See all available apps and features
2. **Try Each Panel**: Spend 2 minutes with each tool
3. **Practice Shortcuts**: Use keyboard instead of clicking
4. **Create Snippets**: Start building your library
5. **Read Full Guide**: Check DEVELOPMENT_GUIDE.md for details

---

## Performance

- ⚡ **Fast**: Panels load instantly
- 📱 **Mobile**: Optimized for all devices
- 🔄 **Real-time**: Live updates where applicable
- 💾 **Persistent**: Data saved locally

---

## Troubleshooting Quick Fixes

| Issue | Fix |
|-------|-----|
| Shortcut not working | Make sure you're in Code Editor view |
| Snippets gone after refresh | Enable browser localStorage |
| Panel won't close | Click X button or press Esc |
| Mobile layout broken | Try refreshing page |
| Agent panel empty | Send a task to Jules first |

---

## Support & Resources

- 📖 **Full Guide**: See `DEVELOPMENT_GUIDE.md`
- 🐛 **Report Bug**: GitHub Issues
- 💡 **Suggest Feature**: GitHub Discussions
- 🔗 **Source Code**: `src/components/`

---

## Visual Layout

```
┌──────────────────────────────────────────────┐
│  Aussie OS - Code Editor                    │
├─────┬───────────────────────────┬───────────┤
│     │                           │ 📊 Right  │
│ Editor Tabs                     │ Panel     │
│                                 │ (Active)  │
│   [File 1]  [File 2]           │ ────────  │
├─────┴───────────────────────────┼───────────┤
│                                 │           │
│        CODE EDITOR              │  Panel    │
│                                 │ Content   │
│      (Monaco Editor)            │           │
│                                 │           │
├─────────────────────────────────┼───────────┤
│                                 │           │
│  Terminal / Output Panel        │  Snippets │
│                                 │  Collab   │
│                                 │  Analytics│
│                                 │  Activity │
└─────────────────────────────────┴───────────┘

Panel Toolbar:
┌─ Agent ─┬─ Snippets ─┬─ Collab ─┬─ Analytics ─┬─ Activity ─┬─ X ─┐
│  (Ctrl+Shift+Alt)                                           │Close│
└─────────────────────────────────────────────────────────────┴─────┘
```

---

**Ready to code? Open Code Editor and try the new tools! 🎉**

For detailed documentation, see **DEVELOPMENT_GUIDE.md**

Questions? Check the troubleshooting section above!
