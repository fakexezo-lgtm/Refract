// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { DashboardSquareIcon, UserIcon, CheckmarkSquareIcon, SettingsIcon, Search01Icon, Add01Icon, Menu01Icon, Cancel01Icon, FolderKanbanIcon, Logout01Icon, ZapIcon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CommandPalette from "@/components/command/CommandPalette";
import QuickAddClientDialog from "@/components/clients/QuickAddClientDialog";
import { useHotkeys } from "@/hooks/useHotkeys";

const NAV = [
  { to: "/app", label: "Dashboard", icon: DashboardSquareIcon, end: true },
  { to: "/app/clients", label: "Clients", icon: UserIcon },
  { to: "/app/pipeline", label: "Pipeline", icon: FolderKanbanIcon },
  { to: "/app/tasks", label: "Tasks", icon: CheckmarkSquareIcon },
];

function SidebarContent({ onCommand, onAdd, onNavigate, user, logout, showLogo = true }) {
  return (
    <div className={`flex flex-col bg-charcoal text-white px-5 ${showLogo ? 'py-6 h-full' : 'pb-10 pt-2'}`}>
      {showLogo && (
        <div className="flex items-center gap-2.5 px-2 mb-8">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
            <img src="/logo.png" className="w-full h-full object-contain" alt="Refract Logo" />
          </div>
          <span className="font-serif text-xl tracking-tight font-semibold">Refract</span>
        </div>
      )}

      <button
        onClick={onCommand}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm mb-2 transition w-full overflow-hidden"
      >
        <HugeiconsIcon icon={Search01Icon} className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left truncate whitespace-nowrap">Search or jump to…</span>
        <kbd className="hidden md:inline text-[10px] px-1.5 py-0.5 rounded bg-white/10 border border-white/10 shrink-0">⌘K</kbd>
      </button>

      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cream text-ink hover:bg-white transition text-sm font-medium mb-6"
      >
        <HugeiconsIcon icon={Add01Icon} className="w-4 h-4" /> New client
      </button>

      <nav className="flex-1 space-y-0.5">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            style={{ touchAction: 'manipulation' }}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all active:scale-95 relative ${
                isActive ? "bg-white text-ink shadow-sm" : "text-white/70 hover:text-white hover:bg-white/5"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <HugeiconsIcon icon={item.icon} className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.span layoutId="navdot" className="ml-auto w-1.5 h-1.5 rounded-full bg-ink" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 mt-4 border-t border-white/10 px-2 lg:relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-white/5 transition text-left focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-cream/10 flex items-center justify-center text-[10px] font-bold text-cream border border-cream/20 shrink-0">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{user?.full_name || user?.email?.split('@')[0]}</div>
                <div className="text-[10px] text-white/40 truncate">{user?.email}</div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            side={showLogo ? "right" : "top"} 
            align={showLogo ? "end" : "center"} 
            className="w-56 mb-4 lg:mb-0 lg:ml-2 bg-charcoal border-white/10 text-white z-[1001]"
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.full_name || "User"}</p>
                <p className="text-xs leading-none text-white/40">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" onClick={() => onNavigate && onNavigate()}>
              <NavLink to="/app/settings" className="flex items-center gap-2 w-full">
                <HugeiconsIcon icon={UserIcon} className="w-4 h-4" />
                <span>Profile</span>
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" onClick={() => onNavigate && onNavigate()}>
              <NavLink to="/app/settings" className="flex items-center gap-2 w-full">
                <HugeiconsIcon icon={SettingsIcon} className="w-4 h-4" />
                <span>Settings</span>
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem 
              className="focus:bg-red-500/20 focus:text-red-400 cursor-pointer text-red-400"
              onClick={() => logout()}
            >
              <HugeiconsIcon icon={Logout01Icon} className="w-4 h-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isRootAppPath = ['/app', '/app/', '/app/clients', '/app/pipeline', '/app/tasks', '/app/settings', '/app/leads'].includes(location.pathname);

  useHotkeys("mod+k", (e) => { e.preventDefault(); setCmdOpen(true); });

  const toggleCommandPalette = () => setCmdOpen(prev => !prev);

  // Auto-close mobile menu on navigation and handle body scroll lock
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => document.body.classList.remove('menu-open');
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-background font-sans text-ink selection:bg-charcoal selection:text-cream overflow-x-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 z-30 border-r border-hair">
        <SidebarContent 
          onCommand={() => setCmdOpen(true)} 
          onAdd={() => setAddOpen(true)} 
          user={user} 
          logout={logout} 
        />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md border-b border-hair z-[100] px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isRootAppPath ? (
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 -ml-2 rounded-full hover:bg-whisper transition-all active:scale-95"
                style={{ touchAction: 'manipulation' }}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="w-5 h-5 text-ink" />
              </button>
            ) : (
              <button 
                onClick={() => setMobileOpen(true)} 
                className="p-2 -ml-2 rounded-full hover:bg-whisper transition-all active:scale-95"
                style={{ touchAction: 'manipulation' }}
              >
                <HugeiconsIcon icon={Menu01Icon} className="w-5 h-5 text-ink" />
              </button>
            )}
            
            {/* Mobile Header Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/app')}>
              <img src="/logo.png" alt="Refract" className="w-6 h-6 object-contain" />
              <span className="font-serif text-lg font-bold tracking-tight text-ink">Refract</span>
            </div>
          </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => navigate("/app/pipeline")} 
            style={{ touchAction: 'manipulation' }}
            className="w-10 h-10 flex items-center justify-center rounded-full text-soft hover:text-ink active:bg-cream active:scale-90 transition-all"
          >
            <HugeiconsIcon icon={DashboardSquareIcon} size={22} />
          </button>
          <button 
            onClick={toggleCommandPalette} 
            style={{ touchAction: 'manipulation' }}
            className="w-10 h-10 flex items-center justify-center rounded-full text-soft hover:text-ink active:bg-cream active:scale-90 transition-all"
          >
            <HugeiconsIcon icon={Search01Icon} size={22} />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-[600]">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-[280px] bg-charcoal shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-6 pt-6 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                    <img src="/logo.png" className="w-full h-full object-contain" alt="Refract Logo" />
                  </div>
                  <span className="font-serif text-xl font-semibold tracking-tight text-white">Refract</span>
                </div>
                <button 
                  onClick={() => setMobileOpen(false)} 
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all"
                  style={{ touchAction: 'manipulation' }}
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <SidebarContent
                    showLogo={false}
                    onCommand={() => { setMobileOpen(false); setCmdOpen(true); }}
                    onAdd={() => { setMobileOpen(false); setAddOpen(true); }}
                    onNavigate={() => setMobileOpen(false)}
                    user={user}
                    logout={logout}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="lg:pl-64 pt-14 lg:pt-0 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-8 md:py-12">
          <Outlet />
        </div>
      </main>

      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} onQuickAddClient={() => setAddOpen(true)} />
      <QuickAddClientDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}