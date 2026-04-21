# Refract Design System

## 1. Product Overview

Refract is a client relationship management tool for focused professionals. It centers workflows around clients, allowing users to track clients, tasks, deals, and activities in one cohesive interface. The product emphasizes clarity, efficiency, and calm operation without visual noise.

## 2. Current App Architecture

```
React 18 + Vite + Tailwind CSS + TanStack Query
├── shadcn/ui components (Animate UI)
├── Framer Motion (animations)
├── @hello-pangea/dnd (drag-and-drop)
├── canvas-confetti (celebration effects)
├── date-fns (date utilities)
└── Hugeicons (icons)
```



## 3. Screen Inventory

| Screen | Route | Purpose |
|--------|-------|---------|
| Landing | `/` | Public homepage, shows login/signup |
| Onboarding | `/onboarding` | Initial user setup |
| Dashboard | `/app` | Today's tasks, pipeline snapshot, activity feed |
| Clients | `/app/clients` | Client list with search and filters |
| Client Detail | `/app/clients/:id` | Client timeline, tasks, deals |
| Pipeline | `/app/pipeline` | Kanban board of all deals |
| Tasks | `/app/tasks` | All tasks organized by due date |
| Settings | `/app/settings` | Profile, preferences, logout |

## 4. Navigation Model

**Desktop:**
- Fixed left sidebar, 256px width, charcoal (#1f1f1f) background
- Logo + brand name at top
- Search/trigger button (⌘K)
- "New client" primary action
- Nav links: Dashboard, Clients, Pipeline, Tasks, Settings
- Active indicator: white background, ink text, dot indicator
- User avatar + name at bottom

**Mobile:**
- Sticky top header with logo and menu button
- Slide-in drawer from right, 288px width
- Same nav structure as desktop

**Global:**
- Command palette (Cmd+K) for quick search and navigation
- Quick-add client dialog accessible from multiple screens

## 5. Core Workflows

1. **Client Creation:** User adds client → appears in list → can add tasks/deals/notes
2. **Task Management:** Tasks always belong to a client, due dates drive dashboard organization
3. **Deal Pipeline:** Drag deals between stages (Lead → Contacted → Proposal → Won/Lost)
4. **Activity Tracking:** Actions auto-log to client timelines (notes, tasks, deals, stage changes)
5. **Dashboard Focus:** Today's tasks + overdue + pipeline overview

## 6. Design Principles

- **Premium Minimal:** No decorative elements; every pixel earns its place
- **High Contrast:** Ink on whisper, charcoal sidebar, clear hierarchy
- **Calm Operation:** Subtle animations, no jarring transitions
- **Efficient:** Small interactions, keyboard shortcuts, dense information without clutter
- **Client-Centered:** Every task, deal, and note connects to a client track their progress

## 7. Color System

### Semantic Tokens (CSS Variables)

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--background` | #f4f4f4 | #121212 | Page backgrounds |
| `--foreground` | #111111 | #f4f4f4 | Primary text |
| `--card` | #ffffff | #1f1f1f | Card backgrounds |
| `--card-foreground` | #111111 | #f4f4f4 | Card text |
| `--primary` | #1f1f1f | #f4f4f4 | Primary buttons, active states |
| `--primary-foreground` | #f4f4f4 | #1f1f1f | Text on primary |
| `--secondary` | #f6f7ed | #262626 | Secondary elements |
| `--muted` | #f0f0f0 | #262626 | Muted backgrounds |
| `--muted-foreground` | #666666 | #999999 | Secondary text |
| `--accent` | #f6f7ed | #262626 | Accent backgrounds |
| `--destructive` | hsl(8 64% 52%) | hsl(8 64% 52%) | Error states |
| `--border` | rgba(0,0,0,0.08) | rgba(255,255,255,0.08) | Dividers |
| `--input` | rgba(0,0,0,0.08) | rgba(255,255,255,0.08) | Input borders |
| `--ring` | #1f1f1f | #cccccc | Focus rings |

### Brand Colors (Hardcoded)

| Token | Value | Usage |
|-------|-------|-------|
| `ink` | #111111 | Headings, primary text |
| `charcoal` | #1f1f1f | |
| `cream` | #f6f7ed |
| `whisper` | #f4f4f4 | Page backgrounds |
| `soft` | #666666 | Secondary text, metadata |
| `success` | hsl(140 25% 40%) | Success states |
| `warning` | hsl(28 65% 50%) | Warning states |
| `danger` | hsl(8 64% 52%) | Error/danger states |

### Pipeline Stage Colors

| Stage | Background | Text |
|-------|-------------|------|
| Lead | #f4f4f4 | ink |
| Contacted | #f6f7ed | ink |
| Proposal | #efeadf | ink |
| Won | #e4ecdf | ink |
| Lost | #f0e4e2 | ink |

### Utility Classes Used

```
bg-charcoal    → background-color: #1f1f1f
bg-cream       → background-color: #f6f7ed
bg-whisper     → background-color: #f4f4f4
text-ink       → color: #111111
text-soft      → color: #666666
border-hair    → border-color: rgba(0,0,0,0.08)
border-hair-dark → border-color: rgba(255,255,255,0.08)
```

## 8. Typography System

### Font Stack

| Font Family | Token | Weights | Usage |
|------------|-------|---------|-------|
| DM Sans | `--font-sans` | 400, 500, 600, 700 | Body text, UI |
| Outfit | `--font-serif` | 300, 400, 500, 600, 700 | Headings, display |

### Type Scale

| Element | Class | Size | Weight | Line Height |
|---------|-------|------|--------|------------|
| Page title | `font-serif text-4xl md:text-5xl` | 2.25-3rem | 400 | tight |
| Section title | `font-serif text-2xl` | 1.5rem | 400 | tight |
| Nav item | `text-sm` | 0.875rem | 400 | normal |
| Body | `text-sm` | 0.875rem | 400 | normal |
| Small/meta | `text-xs` | 0.75rem | 400 | normal |
| Overline | `text-[11px] uppercase tracking-[0.15em]` | 0.6875rem | 500 | normal |
| Button | `text-sm` | 0.875rem | 500-600 | normal |

### Letter Spacing

- Overline: `tracking-[0.15em]` (0.15em = 15% of font size)
- Headings (serif): `letter-spacing: -0.02em` via CSS class `.font-serif`

## 9. Spacing System

Uses Tailwind spacing scale (0-96, plus variants).

### Common Spacing Patterns

| Context | Padding | Gap |
|---------|---------|-----|
| Page container | `px-5 md:px-10 py-8 md:py-12` | - |
| Section | - | `space-y-8` to `space-y-12` |
| Card/List item | `p-2` to `p-3` | `gap-2` |
| Form field | `p-3` to `p-4` | `gap-4` |
| Sidebar | `px-5 py-6` | `space-y-0.5` to `space-y-2` |

### Spacing Token Mapping (for reference)

```
4  = 1rem    (16px)
5  = 1.25rem (20px)
6  = 1.5rem  (24px)
8  = 2rem    (32px)
10 = 2.5rem  (40px)
12 = 3rem    (48px)
```

## 10. Radius, Shadow, Border, and Elevation System

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | 0.75rem (12px) | Cards, dialogs, panels |
| `rounded-lg` | calc(var(--radius) - 2px) = 10px | Buttons, inputs |
| `rounded-md` | calc(var(--radius) - 4px) = 8px | Small elements |
| `rounded-full` | 9999px | Pills, avatars |

### Border Widths

- Default: `border` → 1px with `--border` color
- Hair: `border-hair` → rgba(0,0,0,0.08)
- Card borders: Typically use `border-hair` or `border` depending on background contrast

### Shadows

- Default card: No shadow (use border instead)
- Hover: `hover:border-ink/30` for subtle lift
- Drag: `shadow-xl rotate-1 border-ink/40` during drag operations
- Dialogs: Use Radix UI sheet/dialog with backdrop blur

### Elevation Levels

| Level | Method |
|-------|--------|
| Sidebar | Fixed position, separate z-index |
| Mobile drawer | z-50, slide animation |
| Command palette | z-50, modal backdrop |
| Dialogs/sheets | Radix default |
| Toast | Sonner default |

## 11. Component Inventory

### Shared UI Components (shadcn/ui)

| Component | File | Usage |
|----------|------|-------|
| Button | `button.jsx` | Primary actions, form submits |
| Input | `input.jsx` | Text fields, search |
| Dialog | `dialog.jsx` | Add client, add task, add deal |
| Sheet | `sheet.jsx` | Mobile navigation, side panels |
| Select | `select.jsx` | Dropdowns |
| Switch | `switch.jsx` | Toggle settings |
| Tabs | `tabs.jsx` | Client detail sections |
| Avatar | `avatar.jsx` | User/client avatars |
| Badge | `badge.jsx` | Status/stage indicators |
| Card | `card.jsx` | Content containers |
| Label | `label.jsx` | Form labels |
| Textarea | `textarea.jsx` | Multi-line input |
| Checkbox | `checkbox.jsx` | Task completion |
| Popover | `popover.jsx` | Dropdown menus |
| ScrollArea | `scroll-area.jsx` | Scrollable containers |
| Separator | `separator.jsx` | Section dividers |
| Skeleton | `skeleton.jsx` | Loading states |
| Calendar | `calendar.jsx` | Date picking |
| Command | `command.jsx` | Search palette |
| Toast/Toaster | `toast.jsx`, `toaster.jsx` | Notifications |


## 12. Component Rules and Usage Patterns

### Button Usage

```jsx
// Primary action (charcoal background)
<Button className="rounded-full bg-charcoal hover:bg-black text-white">
  Action
</Button>

// Secondary action (outline)
<Button variant="outline" className="rounded-full border-hair bg-white">
  Secondary
</Button>
```

### Card Patterns

```jsx
// Standard card
<div className="rounded-2xl bg-white border border-hair p-3">
  Content
</div>

// Empty/filled card
<div className="rounded-2xl bg-cream border border-hair">
  <EmptyState ... />
</div>
```

### List Item Patterns

```jsx
// Task/activity row
<div className="flex items-center gap-3 p-3 rounded-xl hover:bg-whisper transition">
  {content}
</div>

// Client row
<div className="flex items-center justify-between p-4 rounded-xl bg-white border border-hair">
  {content}
</div>
```

### Form Field Patterns

```jsx
<Input 
  className="h-12 pl-11 rounded-full bg-white border-hair" 
  // icon typically positioned absolute left
/>
```

### Badge Patterns

```jsx
// Stage badge
<Badge className={stage.tone}>{stage.label}</Badge>

// Status badge
<StatusBadge status={client.status} />
```

### Empty State Patterns

```jsx
<EmptyState
  icon={Icon}
  title="No items yet."
  description="Add your first {item} to get started."
  actionLabel="Add {item}"
  onAction={() => ...}
/>

// Compact variant
<EmptyState icon={Icon} title="No matches." description="Try different search." compact />
```

## 13. Motion and Interaction Rules

### Animation库

- **Framer Motion:** Primary animation library
- **CSS animations:** Used for simple effects (fade-in, shimmer)

### Keyframe Definitions

```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### Animation Classes

```
animate-fade-in  → fade-in 0.3s ease-out
animate-shimmer  → shimmer 2s linear infinite
```

### Interaction Patterns

| Interaction | Method | Example |
|------------|-------|--------|
| List item hover | `hover:bg-whisper transition` | TaskRow, ClientRow |
| Button hover | `hover:bg-black` | Primary buttons |
| Card hover | `hover:border-ink/30` | Pipeline cards |
| Nav hover | `hover:text-white hover:bg-white/5` | Sidebar nav |
| Focus ring | `outline-none ring-2 ring-ring/50` | Inputs, buttons |
| Drag lift | `shadow-xl rotate-1 border-ink/40` | Pipeline cards |

### Transition Timing

- Default: `transition` → 150ms ease
- Spring: `transition={{ type: "spring", damping: 28, stiffness: 280 }}`
- Filter pill: `transition={{ type: "spring", stiffness: 400, damping: 30 }}`

### Page Transitions

- No page-level transitions (instant route changes)
- List animations via `<AnimatePresence>` for adding/removing items

### Celebration Effects

- Confetti on deal stage change to "won": `canvas-confetti` with colors `["#1f1f1f", "#f6f7ed", "#efa36a"]`

## 14. Responsive Behavior

### Breakpoints

- Mobile: < 640px (default)
- Tablet: 640px - 1024px (`md:` prefix)
- Desktop: > 1024px (`lg:` prefix)

### Layout Shifts

| Breakpoint | Sidebar | Main Content | Grid |
|-----------|--------|------------|------|
| Mobile | Hidden (drawer) | Full width, smaller padding | Single column |
| Tablet | Hidden (drawer) | Full width | Adjustable |
| Desktop | Fixed 256px | `pl-64` | Multi-column |

### Mobile Patterns

- Top header with hamburger/menu
- Pill filters become scrollable horizontal
- Full-width buttons
- Touch-friendly tap targets (min 44px)
- Drawer navigation slides from right

### Desktop Patterns

- Fixed sidebar always visible
- Multi-column layouts for pipeline (5 columns)
- Cmd+K keyboard shortcut active

## 15. Empty States

### Standard Empty State

```jsx
<EmptyState
  icon={Icon}
  title="No {items} yet."
  description="{Action description}."
  actionLabel="Add {item}"
  onAction={() => handleAdd()}
/>
```

### Compact Empty State

```jsx
<EmptyState icon={Icon} title="No matches." description="Try a different search." compact />
```

### When to Show Empty States

| Screen | Empty Condition |
|--------|---------------|
| Dashboard Today's Tasks | `todayTasks.length === 0` |
| Dashboard Pipeline | Always shows snapshot (even if empty) |
| Dashboard Activity | `activities.length === 0` |
| Clients | `clients.length === 0` (first time), `filtered.length === 0` (filtered) |
| Pipeline column | `deals.length === 0` |
| Tasks | `tasks.length === 0` |
| Client Timeline | `activities.length === 0` |
| Client Tasks | `tasks.length === 0` |
| Client Deals | `deals.length === 0` |

## 16. Loading States

### Skeleton Loading

```jsx
<div className="space-y-2">
  {[...Array(4)].map((_, i) => (
    <div key={i} className="h-20 rounded-2xl bg-white border border-hair animate-pulse" />
  ))}
</div>
```

### Spinner (used sparingly)

```jsx
<div className="fixed inset-0 flex items-center justify-center bg-whisper">
  <div className="w-6 h-6 border-2 border-border border-t-ink rounded-full animate-spin" />
</div>
```

### Loading Patterns

- Dashboard: No loading skeleton (data loads fast)
- Clients: Skeleton list during load
- Client Detail: Skeleton card during load
- Form submissions: Button disabled with "Saving..." text

## 17. Form States

### Input States

| State | Class | Visual |
|-------|-------|--------|
| Default | `border-hair bg-white` | Subtle border |
| Focus | `ring-2 ring-ring/50` | Focus ring |
| Disabled | `bg-whisper disabled:cursor-not-allowed` | Muted background |
| Error | `border-destructive` | Red border |

### Button States

| State | Class | Visual |
|-------|-------|--------|
| Default | `bg-charcoal` | Charcoal |
| Hover | `hover:bg-black` | Darker |
| Active | `active:bg-ink` | Ink |
| Disabled | `disabled:opacity50 disabled:cursor-not-allowed` | Muted |
| Loading | `disabled` | Shows loading text |

### Form Validation

- Client-side: Immediate feedback on blur
- Server-side: Toast error on failure

## 18. Status and Feedback States

### Toast Notifications

- Using `sonner` for toast notifications
- Success: Auto-dismiss after timeout
- Error: Shows error message, requires dismiss

### Status Badges

```jsx
// Client status
<StatusBadge status={client.status} />

// Pipeline stage
<StageBadge stage={deal.stage} />
```

### Visual Feedback

- Task completion: Checkbox animation, strike-through
- Deal stage change: Logged to activity, confetti on "won"
- Client status change: Toast + activity log

## 19. Accessibility Rules

### Focus Management

- All interactive elements: Focus visible
- Modal/dialog: Focus trap enabled
- Command palette: Focus on open, restore on close

### Keyboard Navigation

- Tab: Forward navigation
- Cmd+K: Open command palette
- Escape: Close dialogs/drawers
- Enter: Activate buttons

### Screen Reader

- Semantic HTML (nav, main, section, article)
- ARIA labels on icon-only buttons
- Form labels associated with inputs

### Color and Contrast

- Text contrast: Minimum 4.5:1 (INK/charcoal on backgrounds)
- No information conveyed by color alone
- Status indicators have text labels

## 20. Content Style Rules

### Capitalization

- Headings: Sentence case or title case (consistent with section)
- Nav labels: Title case (Dashboard, Clients, Pipeline, Tasks, Settings)
- Buttons: Title case
- Status/stage: Title case
- Overline: ALL CAPS with letter-spacing

### Date/Time Formatting

- Dashboard header: `EEEE, MMMM d` (e.g., "Monday, April 19")
- Relative dates: "Today", "Yesterday", "2 days ago"
- Due dates: Use `date-fns` formatting

### Numbers

- Currency: `$1,234` (USD default)
- Counts: `{n} total · {n} active`

### Placeholder Text

- Search: "Search by name, company, or email"
- Input empty: Context-specific hint

## 21. Do Not Change List

### Layout

- Do NOT change sidebar position or width (256px, fixed left)
- Do NOT change main content padding
- Do NOT alter screen routes or order

### Navigation

- Do NOT add new nav items
- Do NOT change nav labels (Dashboard, Clients, Pipeline, Tasks, Settings)
- Do NOT change command palette trigger (Cmd+K)

### Design Tokens

- Do NOT change primary brand color (charcoal #1f1f1f)
- Do NOT change accent color (cream #f6f7ed)
- Do NOT change font families (DM Sans, Outfit)
- Do NOT change border radius base (0.75rem)

### Product Structure

- Do NOT change pipeline stages (Lead, Contacted, Proposal, Won, Lost)
- Do NOT change client statuses (Lead, Active, Inactive)
- Do NOT separate tasks from clients
- Do NOT remove timeline from client detail

### Interactions

- Do NOT remove drag-and-drop from pipeline
- Do NOT remove activities from timelines
- Do NOT change greeting logic (morning/afternoon/evening)

## 22. Implementation Notes

### Font Loading

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
```

### Theme Setup

Colors are defined as HSL CSS variables in `index.css`:

```css
:root {
  --background: 0 0% 96%;
  --foreground: 0 0% 7%;
  /* ... */
}
```

### Component Structure

- UI components in `src/components/ui/` (shadcn)
- Custom components in `src/components/`
- Pages in `src/pages/`

### Data Flow

- TanStack Query for server state
- Context API for auth state
- Local state for UI (dialogs, drawers, forms)

## 23. Token Map

### Semantic Tokens → CSS Variables

```
background      → --background
foreground     → --foreground  
card           → --card
popover        → --popover
primary        → --primary
secondary      → --secondary
muted          → --muted
accent         → --accent
destructive    → --destructive
border         → --border
input          → --input
ring           → --ring
```

### Brand Tokens → Hardcoded Values

```
ink            → #111111
charcoal       → #1f1f1f
cream          → #f6f7ed
whisper        → #f4f4f4
soft           → #666666
success        → hsl(140 25% 40%)
warning        → hsl(28 65% 50%)
danger         → hsl(8 64% 52%)
```

### Component Tokens → Tailwind Classes

```
radius-lg      → rounded-2xl (12px)
radius-md      → rounded-xl (10px)
radius-sm     → rounded-lg (8px)
radius-pill   → rounded-full
font-heading  → font-serif
font-body     → font-sans
spacing-card  → p-2 to p-4
gap-list     → gap-2
```

## 24. Theme Structure

### Theme File Locations

| File | Purpose |
|------|---------|
| `src/index.css` | CSS variables, base styles |
| `tailwind.config.js` | Tailwind extension, colors, animations |

### Theme Toggle

Dark mode toggles via class on `<html>`:

```jsx
document.documentElement.classList.toggle("dark", isDark);
```

Dark mode values defined in `.dark` selector within `:root` block.

### Custom Utilities

```css
.bg-cream       → background-color: #f6f7ed
.bg-charcoal    → background-color: #1f1f1f
.bg-whisper    → background-color: #f4f4f4
.text-ink      → color: #111111
.text-soft     → color: #666666
.border-hair   → border-color: rgba(0,0,0,0.08)
.noise-bg      → Subtle noise texture
.scrollbar-minimal → Custom scrollbar styling
```