The complete user story — from zero to daily use
Stage 1 — Discovery
Landing page
A freelancer finds Refract. They land on your homepage. In 10 seconds they need to understand: what is this, who is it for, why should I sign up. Right now your landing page does this well. Keep it.
They click "Get started" → goes to Sign Up page
Stage 2 — Sign up
/login or /signup
They enter email + password. Supabase sends them a verification email. They click the link. They are now a real user with a real account. This entire flow needs to actually work — right now it's fake.
After email verified → goes to Onboarding
Stage 3 — Onboarding
/onboarding
This should be very fast. Only 2 questions: what's your name, and what do you do. Then send them straight into the app. The workspace name question adds no value — remove it. The goal of onboarding is to get them to their first "aha moment" as fast as possible.
The aha moment for Refract is: adding their first real client and seeing that client's page with a timeline. Everything before that is friction.
After answering 2 questions → goes to Dashboard (empty state)
Stage 4 — First session (empty state)
/app → Dashboard
They arrive at the Dashboard with zero data. This is the most critical moment in your entire app. The screen must guide them to add their first client. One single big action: "Add your first client." Don't show them 4 empty sections — show them one prompt.
They add a client → goes to Client Detail page for that client
Client Detail is now their home for that relationship
Stage 5 — Daily use loop
Dashboard → Clients → Tasks → Pipeline
Once they have 5+ clients, this is how they use the app every day:
1
Morning — open Dashboard
See overdue tasks (red), today's tasks, and a pipeline snapshot. Act on the most urgent things first.
2
After a call or meeting — open Client page
Add a note ("discussed pricing, they want to proceed"), mark the task done, add the next task ("send contract by Friday"). The timeline records everything.
3
Weekly — check Pipeline
See which deals are stale (5+ days no update). Drag deals between stages. Check win rate. Know your revenue situation at a glance.
4
Ad hoc — Tasks page
When they want to see everything across all clients. Good for Monday planning. Less used than the Client page during daily work.


For Screen : 

Every screen — what it is, what it does, what fields it needs
Landing page
/
Keep as-is
Purpose: convince someone in 10 seconds to sign up. Your current landing is good — clean hero, honest description, preview mockup. Don't change it. Just make sure the "Get started" button leads to real signup.
Login / Sign up
/login
Needs real auth
Two modes: login (existing user) and signup (new user). Both on the same page, toggled by a tab. Simple form — email field, password field, submit button. After signup: show "Check your email" screen. After login: go to /app.
Email
Required. Their email address. This is their username.
required
Password
Required. Min 8 characters. Supabase validates this.
required
Full name
Only on signup. So you can greet them by name on the dashboard.
signup only
Onboarding
/onboarding
Simplify to 1 step Remove workspace name
Only show this once, the first time after signup. Make it 1 step only: "What do you do?" (Design studio / Freelance dev / Consultant / Agency / Other). That's it. Skip to /app immediately after. The work type can personalise empty state copy later — but even if it doesn't, the question takes 5 seconds and feels personal.
Why remove workspace name? You never show it anywhere in the app. Asking for something you don't use destroys trust immediately.
Dashboard
/app
Keep structure Fix empty state
This is the daily driver. Shows 4 things in this exact order:
1
Overdue tasks (red section)
Only shown if overdue tasks exist. Red background, prominent. This demands attention first.
2
Today's tasks
Tasks due today. If empty, show a calm "You're clear today" message. Good. Keep it.
3
Pipeline snapshot
5 columns showing count per stage. Clicking opens Pipeline board. Keep it.
4
Recent activity feed
Last 10 things that happened across all clients. Good for context.
Empty state fix: When user has zero clients, hide sections 2/3/4 and show one big prompt: "Add your first client to get started." One action. Don't show 4 empty sections.
Clients list
/app/clients
Mostly good Add: sort by name
Shows all clients as rows. Search and filter (All / Lead / Active / Inactive) work well. Each row shows: avatar, name, company, last contacted, next task, status badge. Clicking a row goes to Client Detail. Keep this exactly as-is, just add a name sort option.
Add client form fields: Name (required), Email (optional), Company (optional), Status (Lead/Active/Inactive — default Lead). That's all. Phone, notes, website — add those later from the client's own page.
Client Detail — the most important screen
/app/clients/:id
Core of the product
This is where 80% of the real work happens. It has 3 tabs: Timeline, Tasks, Deals. This is the right structure. Don't change it.
H
Header (sticky at top)
Client name, status badge (Lead/Active/Inactive), company. The "Next Action" box shows the soonest open task — editable inline. "Last contacted" shows how long since any activity. Add Note / Add Task / Add Deal buttons. Delete client in the … menu.
T
Timeline tab (default)
Chronological list of everything: notes added, tasks created/completed, deals created/moved. This is the "memory" of the relationship. Grouped by Today / Yesterday / This week / Earlier. Show 5 items, "View all" to expand.
T
Tasks tab
All tasks for this client only. Open tasks first, then completed (collapsed). Each task shows title, due date, checkbox to complete. Can edit or delete a task.
D
Deals tab
All deals linked to this client. Each deal shows title, value, current stage. Can add a new deal from here.
Add note fields: Just a text area. Nothing else. Notes are free text. Add task fields: Title (required), Due date (optional, defaults to tomorrow), that's it — client is already known. Add deal fields: Title (required), Value in $ (optional), Stage (Lead/Contacted/Proposal/Won/Lost — default Lead).
Pipeline board
/app/pipeline
Keep Fix filter
Kanban board with 5 columns: Lead → Contacted → Proposal → Won → Lost. Drag cards between columns. Cards show: client name, deal title, value, days since last update. Stale cards (5+ days) get a visual warning. Clicking a card opens a side panel with deal details.
3 KPI cards at top: Pipeline value, Average deal size, Win rate. These are genuinely useful at a glance. Keep them.
Fix the filter: Current filter only has price range. Add: "Show stale only" toggle, and filter by client. Remove the price range filter — nobody uses min/max price filters on their own pipeline.
Tasks
/app/tasks
Keep structure Fix quick-add bug Remove keyboard nav hints
Shows all tasks across all clients, grouped into: Overdue (red), Today, Upcoming, Completed (collapsed). Filter by client dropdown in top right. This is a good screen — mostly keep it.
Critical fix: The quick-add text input silently assigns tasks to the first client. Either remove this input and only use the "Add task" button/dialog, or make it open the dialog pre-filled with the typed text. Keyboard shortcuts are a power feature — keep them but show the hint persistently (not a timeout) as a small footer bar.
Settings
/app/settings
Major cleanup needed Remove 5 fake sections
Right now has 7 sections, most of which do nothing. Reduce to only 3 sections that actually work:
1
Profile
Name (editable + saved to Supabase), Email (read-only). That's it.
2
Account
Change password button (calls Supabase), Sign out button (works), Delete account (works with confirmation).
3
Data
Export all data as CSV (actually works). One button. Freelancers care about data portability.
Remove entirely: Notifications, Appearance (dark mode), Workflow defaults, Preferences. These are aspirational features for a future version. Right now they do nothing and make the app feel dishonest. Add them back when they actually work.
Leads page
/app/leads
Delete entirely
This page is broken (missing context providers), imports components that don't exist, uses a completely different design language, and duplicates what the Clients list already does with "Lead" status filter. Delete the file. Remove it from nav. A "lead" in Refract is just a client with status = "Lead". There is no separate concept needed.


