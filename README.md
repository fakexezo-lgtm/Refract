# Refract CRM

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
   Create a `.env.local` file in the root directory and add your configuration (e.g., API endpoints, Auth keys):
   ```env
   VITE_API_URL=your_api_url
   VITE_AUTH_KEY=your_auth_key
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
