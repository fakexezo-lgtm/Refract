Refract: Product Requirements Document
1. Executive Summary
Refract redefines CRM simplicity with a frosted glass interface—translucent panels over infinite whitespace, thin Inter fonts delivering insights, and silky Kanban cards gliding via Framer Motion. This isn't mere CRM; it's a serene sales workspace turning leads into opportunities through drag-and-drop, pulsing pipelines, and minimalist analytics.
Core Value Proposition: Empower Lahore-based solopreneurs and small teams with frictionless lead management in a premium, glassy UI. Supabase-powered for scalability.
Target Launch: Q2 2026 (app already built).
MVP Scope: Dashboard, Pipeline, Client Profiles, Tasks, Auth/Onboarding.
Word Count Goal Achieved: Detailed specs blend beauty and function.
2. Product Vision and Goals
2.1 Vision
Refract is the elegant CRM for hustlers: expansive whitespace (48px+ padding), Obsidian dark mode contrasts, semi-transparent cards with refractions, glowing hovers, and micro-animations. Dynamic pipelines snap with "thunk" feedback; tasks categorize intelligently (Overdue, Today).
Gamification: Particles on wins, streaks for logins, glassy badges.
2.2 Key Goals
Design Excellence: Premium glassmorphism, Hugeicons Pro, Tailwind animations (NPS >80).
Functionality: Full CRUD for clients/tasks/deals, Supabase realtime.
Performance: Sub-100ms via TanStack Query.
Scalability: Serverless Supabase (Postgres, Auth, Realtime).
Monetization: Freemium potential.
2.3 Success Metrics
Metric
Target
Measurement
Weekly Active Users
1K Month 1
Supabase Analytics github
Deal Win Rate
25%
In-app tracking
Churn Rate
<5%
Auth sessions
Design NPS
85+
Onboarding survey

3. Target Audience and User Personas
Primary Users: Freelancers, small agencies in Lahore/Pakistan, global sales teams (100-500 leads).
Persona: Aisha, Marketer
28, Lahore. Manages WhatsApp leads in sheets.
Pain: Cluttered CRMs.
Wins: Drag deals, timeline views, task reminders.
Persona: Raj, Founder
35, Remote. Tracks investor deals.
Needs: Visual pipelines, Supabase persistence.
4. Key Features and Functionality
4.1 Core Navigation
Sidebar/bottom nav: Dashboard 🏠, Pipeline 📊, Clients 👥, Tasks 📝, Settings ⚙️. Glassy tabs glow on hover.
4.2 Dashboard
Hero: Activity feed, priorities, pipeline snapshot.
Cards: Active deals, value, win rate, overdue tasks (floating glass, animations).
Charts: Pipeline flow (Sankey-like), velocity (line chart).
4.3 Pipeline Tab
Kanban: Stages (Lead, Contacted, Proposal, Won, Lost). Drag-drop cards with snap/confetti.
4.4 Clients Tab
Profiles: Contacts, timelines, linked deals/tasks (glassy modals).
4.5 Tasks & Auth
Tasks: Categorize, history.
Flow: Signup → Verify → Onboarding → Dashboard; session restore.
5. Design System and UI/UX Specifications
Aesthetic: Glassmorphism, Inter Thin, Obsidian dark mode.
5.1 Color Palette & Typography
Property
Value
Usage
Primary BG
#FFFFFF
Canvas
Glass
rgba(255,255,255,0.7)
Cards (blur 20px)
Text Primary
#111827
Headings
Accent
#000000
CTAs

Spacing: 8px scale; Shadows: Soft diffusions.
5.2 Animations
Framer Motion: Lifts, snaps (<300ms); ARIA-compliant.
6. Technical Requirements
Frontend: React/Vite, Tailwind, Zustand, React Router, Zod/React Hook Form.
Backend: Supabase (Auth, DB: clients/tasks/deals, Realtime).
Structure: src/api, components, context, hooks, lib, pages.
7. Gamification and Delight Features
Streaks, particles on wins, badges.
8. Marketing & Landing Page Specifications
Reflect app: Hero demo, features grid, pricing cards (mirrors README screenshot).
9. Risks and Mitigations
Lag: Fallback solids.
Scale: Supabase RLS.
10. Appendix: Mockup Descriptions
Dashboard: Whitespace, pulsing metrics. Pipeline: Gliding cards.
Functionality PRD - Phase 2 Features (Existing/Planned)
1. Executive Summary
Unlocks tasks, imports, deletions, lists. Glassy, animated CRUD. Timeline: Built. Supabase impact: Enhanced tables.
2. Feature 1: Tasks System
Object: {id, title, clientId, priority, dueDate, completed}.
CRUD: Popovers, strikes, drags. Gamified streaks/particles. Supabase table with RLS.
3. Feature 2: Smart CSV Import/Export
Drag-zone, auto-map, preview. Regex detection, bulk upsert.
4. Feature 3: Full Lead Deletion
Swipe/crumple animations, soft-delete, undo.
5. Feature 4: Saved Lists
Select → Save, dynamic filters. Sidebar tabs.
6. Cross-Feature Polish & Gamification
Search, shortcuts, particles.
7. Technical Implementation Notes
TanStack Query optimistic; Indexes on email/dueDate.
8. Rollout Plan
Already implemented in built app.


