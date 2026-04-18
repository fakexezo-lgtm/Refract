import React, { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, KanbanSquare, CheckSquare, Settings, Search, Plus, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import CommandPalette from "@/components/command/CommandPalette";
import QuickAddClientDialog from "@/components/clients/QuickAddClientDialog";
import { useHotkeys } from "@/hooks/useHotkeys";

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/clients", label: "Clients", icon: Users },
  { to: "/app/pipeline", label: "Pipeline", icon: KanbanSquare },
  { to: "/app/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

function SidebarContent({ user, onCommand, onAdd, onNavigate }) {
  return (
    <div className="h-full flex flex-col bg-charcoal text-white px-5 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center">
          <span className="font-serif text-ink text-lg leading-none">R</span>
        </div>
        <span className="font-serif text-xl tracking-tight">Refract</span>
      </div>

      <button
        onClick={onCommand}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm mb-2 transition"
      >
        <Search className="w-4 h-4" strokeWidth={1.75} />
        <span className="flex-1 text-left">Search or jump to…</span>
        <kbd className="hidden md:inline text-[10px] px-1.5 py-0.5 rounded bg-white/10 border border-white/10">⌘K</kbd>
      </button>

      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cream text-ink hover:bg-white transition text-sm font-medium mb-6"
      >
        <Plus className="w-4 h-4" strokeWidth={2} /> New client
      </button>

      <nav className="flex-1 space-y-0.5">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition relative ${
                isActive ? "bg-white text-ink" : "text-white/70 hover:text-white hover:bg-white/5"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-4 h-4" strokeWidth={1.75} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.span layoutId="navdot" className="ml-auto w-1.5 h-1.5 rounded-full bg-ink" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 mt-4 border-t border-white/10 flex items-center gap-3 px-2">
        <div className="w-8 h-8 rounded-full bg-cream text-ink flex items-center justify-center text-xs font-medium">
          {(user?.full_name || user?.email || "?")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm truncate">{user?.full_name || "You"}</div>
          <div className="text-[11px] text-white/50 truncate">{user?.email}</div>
        </div>
      </div>
    </div>
  );
}

export default function Layout() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const location = useLocation();

  useHotkeys("mod+k", (e) => { e.preventDefault(); setCmdOpen(true); });

  React.useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-screen bg-whisper">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 z-30">
        <SidebarContent user={user} onCommand={() => setCmdOpen(true)} onAdd={() => setAddOpen(true)} />
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 bg-charcoal text-white flex items-center justify-between px-4 h-14 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-cream flex items-center justify-center">
            <span className="font-serif text-ink leading-none">R</span>
          </div>
          <span className="font-serif text-lg">Refract</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setCmdOpen(true)} className="p-2 rounded-lg hover:bg-white/10">
            <Search className="w-5 h-5" />
          </button>
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-white/10">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="lg:hidden fixed right-0 top-0 h-screen w-72 z-50"
            >
              <div className="relative h-full">
                <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 z-10 text-white/70 p-1">
                  <X className="w-5 h-5" />
                </button>
                <SidebarContent
                  user={user}
                  onCommand={() => { setMobileOpen(false); setCmdOpen(true); }}
                  onAdd={() => { setMobileOpen(false); setAddOpen(true); }}
                  onNavigate={() => setMobileOpen(false)}
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="lg:pl-64 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-8 md:py-12">
          <Outlet />
        </div>
      </main>

      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} onQuickAddClient={() => setAddOpen(true)} />
      <QuickAddClientDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}