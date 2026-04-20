# <img src="public/logo.png" width="40" height="40" align="center" style="border-radius: 8px;"> Refract CRM

Refract is a modern, intelligence-driven CRM designed to transform static client data into an active sales engine. Built with a focus on **Clarity**, **Momentum**, and **Visual Excellence**, Refract provides an elegant interface for managing relationships, tracking deal pipelines, and automating sales workflows.

![Refract Dashboard Mockup](https://raw.githubusercontent.com/fakexezo-lgtm/refractv2/main/screenshot.png) *(Note: Placeholder for actual screenshot)*

## ✨ Features

- **Momentum Dashboard**: A high-level view of your business health, featuring real-time activity feeds, task priorities, and a snapshot of your sales pipeline.
- **Dynamic Pipeline**: A drag-and-drop Kanban board for tracking deals through customizable stages (Lead, Contacted, Proposal, Won, Lost).
- **Intelligent Task Management**: Never miss a follow-up with smart task categorization (Overdue, Today, Upcoming) and a comprehensive task history.
- **Client Relationship Management**: Detailed client profiles including contact information, interaction history (Timeline), and linked deals/tasks.
- **Premium UI/UX**: A state-of-the-art interface utilizing glassmorphism, smooth Framer Motion animations, and the Hugeicons Pro library for a professional aesthetic.
- **Dark Mode Support**: Fully integrated dark mode using a curated "Obsidian" color palette for focused work.

## 🚀 Tech Stack

- **Framework**: [React](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Hugeicons](https://hugeicons.com/)
- **Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) / React Context
- **Navigation**: [React Router v6](https://reactrouter.com/)
- **Forms & Validation**: [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)
- **Authentication + Backend & Database**: [Supabase](https://supabase.com/)

## 🔐 Authentication & User Flow

Refract follows a **state-driven authentication flow** to ensure clarity and a smooth user experience.

### Core Flow

```text
New User:
Sign Up → Email Verification → Onboarding → Dashboard

Existing User:
Login → Dashboard
Routing Logic

After login or session restore:

IF not authenticated → Login

IF authenticated:
    IF not verified → Verification screen

    ELSE IF onboarding not completed:
        → Onboarding

    ELSE:
        → Dashboard



Key Rules
Onboarding is shown only once (for new users)
Existing users are always redirected directly to the Dashboard
Users must verify email before accessing the app
Session persists for returning users (auto-login)
Protected routes are only accessible to authenticated users
Edge Cases Handled
Unverified users cannot access the dashboard
Incomplete onboarding redirects back to onboarding
Session expiration redirects to login
Invalid login credentials show clear error messages
Expired verification links allow resend
🗄 Backend (Supabase)

Supabase is used for:

Client, Task, Deal, and Activity data
Persistent user-related states (e.g., onboarding status)
API and data layer
## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/fakexezo-lgtm/refractv2.git
   cd refractv2
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your Supabase configuration:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Launch the development server:**
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```text
src/
├── api/          # API client configuration
├── components/   # Reusable UI components (ui/, shared/, client/, etc.)
├── context/      # React Context providers (Auth, Header, Leads)
├── hooks/        # Custom React hooks
├── lib/          # Utilities, constants, and formatters
└── pages/        # Main application views (Dashboard, Pipeline, etc.)
```

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request or open an Issue if you find a bug or have a feature suggestion.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Refract · Built for focused relationship work.*
