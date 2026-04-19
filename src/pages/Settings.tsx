// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  LogoutIcon, 
  UserIcon, 
  Notification01Icon, 
  PaintBrushIcon, 
  ShieldIcon, 
  CheckmarkSquareIcon, 
  DatabaseIcon, 
  ArrowRight01Icon, 
  ViewIcon, 
  ZapIcon, 
  Download01Icon, 
  Delete02Icon,
  CircleIcon,
  InformationCircleIcon,
  Cancel01Icon
} from "@hugeicons/core-free-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "preferences", label: "Preferences", icon: ZapIcon },
  { id: "notifications", label: "Notifications", icon: Notification01Icon },
  { id: "appearance", label: "Appearance", icon: PaintBrushIcon },
  { id: "workflow", label: "Workflow", icon: CheckmarkSquareIcon },
  { id: "security", label: "Account & Security", icon: ShieldIcon },
  { id: "data", label: "Data & Privacy", icon: DatabaseIcon },
];

export default function Settings() {
  const { user, logout, checkUserAuth } = useAuth() as any;
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  
  // Settings State
  const [settings, setSettings] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    dark_mode: document.documentElement.classList.contains("dark"),
    compact_mode: localStorage.getItem("compact_mode") === "true",
    weekly_digest: true,
    notify_email: true,
    notify_reminders: true,
    notify_due_dates: true,
    notify_activity: false,
    default_due_date: "none",
    auto_complete: true,
    show_completed: false,
    default_view: "today",
    font_size: "medium",
  });

  const [initialSettings, setInitialSettings] = useState({ ...settings });
  const isDirty = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // API call placeholder for new settings
      if (settings.full_name !== initialSettings.full_name) {
        await base44.auth.updateMe({ full_name: settings.full_name });
      }
      
      // Handle dark mode side effect
      document.documentElement.classList.toggle("dark", settings.dark_mode);
      localStorage.setItem("compact_mode", settings.compact_mode.toString());
      
      if (checkUserAuth) await checkUserAuth();
      
      setInitialSettings({ ...settings });
      toast({
        title: "Changes saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    setSettings({ ...initialSettings });
    toast({
      title: "Changes discarded",
      description: "Settings have been reset to their original values.",
    });
  };

  const [showSaveBar, setShowSaveBar] = useState(true);

  // Auto-show save bar when dirty
  useEffect(() => {
    if (isDirty) setShowSaveBar(true);
  }, [isDirty]);

  const renderToggle = (id: string, label: string, description: string, key: string) => (
    <div className="flex items-center justify-between py-4 group">
      <div className="space-y-0.5">
        <label htmlFor={id} className="text-sm font-medium text-ink flex items-center gap-1.5 cursor-pointer">
          {label}
        </label>
        <p className="text-xs text-soft leading-relaxed max-w-sm">
          {description}
        </p>
      </div>
      <Switch 
        id={id}
        checked={settings[key]} 
        onCheckedChange={(val) => updateSetting(key, val)} 
      />
    </div>
  );

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="mb-10">
        <div className="text-[11px] uppercase tracking-[0.15em] text-soft mb-2">Control Center</div>
        <h1 className="font-serif text-4xl md:text-5xl text-ink">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px,1fr] gap-12 items-start">
        {/* Navigation - Sidebar */}
        <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-4 lg:pb-0 sticky top-24 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === cat.id 
                  ? "bg-charcoal text-white shadow-lg shadow-charcoal/10" 
                  : "text-soft hover:text-ink hover:bg-cream"
              }`}
            >
              <HugeiconsIcon icon={cat.icon} size={18} strokeWidth={cat.id === activeTab ? 2 : 1.75} />
              {cat.label}
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <div className="bg-white rounded-3xl border border-hair p-8 md:p-10 shadow-sm min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "profile" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-serif text-3xl text-ink mb-2">Profile</h2>
                    <p className="text-sm text-soft">How you appear to others and system identity.</p>
                  </div>
                  <div className="space-y-6 max-w-md">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-soft ml-1">Full name</label>
                      <Input 
                        value={settings.full_name} 
                        onChange={(e: any) => updateSetting("full_name", e.target.value)} 
                        placeholder="Your name"
                        className="h-11 rounded-xl border-hair bg-cream/10 focus:bg-white transition-all shadow-none" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-soft ml-1">Email address</label>
                      <div className="relative">
                        <Input 
                          value={settings.email} 
                          disabled 
                          className="h-11 rounded-xl border-hair bg-whisper text-soft cursor-not-allowed pr-10" 
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 group">
                          <HugeiconsIcon icon={InformationCircleIcon} size={16} className="text-soft/40" />
                        </div>
                      </div>
                      <p className="text-[10px] text-soft/70 ml-1 italic">Contact support to change your account email.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "preferences" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-serif text-3xl text-ink mb-2">Preferences</h2>
                    <p className="text-sm text-soft">Configure your workspace defaults.</p>
                  </div>
                  <div className="divide-y divide-hair">
                    {renderToggle(
                      "weekly-digest", 
                      "Weekly digest", 
                      "Get a summary of your tasks and client activity every Monday morning.",
                      "weekly_digest"
                    )}
                    {renderToggle(
                      "auto-complete", 
                      "Auto-complete actions", 
                      "Automatically complete related sub-tasks when a parent task is closed.",
                      "auto_complete"
                    )}
                    {renderToggle(
                      "show-history", 
                      "Show completed tasks", 
                      "Keep completed tasks visible in your main views for immediate context.",
                      "show_completed"
                    )}
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-serif text-3xl text-ink mb-2">Notifications</h2>
                    <p className="text-sm text-soft">Choose when and how you want to be notified.</p>
                  </div>
                  <div className="divide-y divide-hair">
                    {renderToggle(
                      "notif-email", 
                      "Email Notifications", 
                      "Allow Refract to send important updates and reports to your email.",
                      "notify_email"
                    )}
                    {renderToggle(
                      "notif-reminders", 
                      "Task Reminders", 
                      "Get notified when a task is starting or a reminder is triggered.",
                      "notify_reminders"
                    )}
                    {renderToggle(
                      "notif-due", 
                      "Due Date Alerts", 
                      "Early warnings for approaching deadlines and overdue items.",
                      "notify_due_dates"
                    )}
                    {renderToggle(
                      "notif-activity", 
                      "Client Activity", 
                      "Updates when clients interact with shared assets or sync data.",
                      "notify_activity"
                    )}
                  </div>
                </div>
              )}

              {activeTab === "appearance" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-serif text-3xl text-ink mb-2">Appearance</h2>
                    <p className="text-sm text-soft">Visual settings to make Refract more comfortable.</p>
                  </div>
                  <div className="space-y-6">
                    <div className="p-1.5 bg-cream/30 rounded-2xl flex gap-2 w-fit">
                      <button 
                        onClick={() => updateSetting("dark_mode", false)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${!settings.dark_mode ? "bg-white text-ink shadow-sm" : "text-soft hover:text-ink"}`}
                      >
                        Light
                      </button>
                      <button 
                        onClick={() => updateSetting("dark_mode", true)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${settings.dark_mode ? "bg-charcoal text-white shadow-sm" : "text-soft hover:text-ink"}`}
                      >
                        Dark
                      </button>
                    </div>

                    <div className="divide-y divide-hair">
                      {renderToggle(
                        "compact-mode", 
                        "Compact mode", 
                        "Reduce whitespace and padding to show more information at once.",
                        "compact_mode"
                      )}
                    </div>
                    
                    <div className="space-y-3 pt-4 border-t border-hair">
                      <label className="text-sm font-medium text-ink">Text size</label>
                      <div className="flex gap-4">
                        {["small", "medium", "large"].map(size => (
                          <button
                            key={size}
                            onClick={() => updateSetting("font_size", size)}
                            className={`flex-1 py-3 rounded-xl border text-xs font-medium capitalize transition-all ${
                              settings.font_size === size 
                                ? "border-charcoal bg-cream/20 text-charcoal" 
                                : "border-hair bg-white text-soft hover:border-soft"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "workflow" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-serif text-3xl text-ink mb-2">Workflow</h2>
                    <p className="text-sm text-soft">Optimize how tasks and pipelines behave throughout the app.</p>
                  </div>
                  <div className="space-y-6 max-w-md">
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-ink">Default task due date</label>
                      <Select value={settings.default_due_date} onValueChange={(v) => updateSetting("default_due_date", v)}>
                        <SelectTrigger className="h-11 rounded-xl border-hair bg-white shadow-none">
                          <SelectValue placeholder="Select default" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-hair shadow-xl">
                          <SelectItem value="none">None (Open ended)</SelectItem>
                          <SelectItem value="today">End of today</SelectItem>
                          <SelectItem value="tomorrow">Tomorrow evening</SelectItem>
                          <SelectItem value="next-week">Next Monday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium text-ink">Default dashboard view</label>
                      <div className="flex gap-2">
                        {["today", "upcoming", "pipeline"].map(view => (
                          <button
                            key={view}
                            onClick={() => updateSetting("default_view", view)}
                            className={`px-4 py-2 rounded-full border text-[10px] uppercase font-bold tracking-widest transition-all ${
                              settings.default_view === view 
                                ? "bg-charcoal text-white border-charcoal" 
                                : "bg-white text-soft border-hair hover:border-soft"
                            }`}
                          >
                            {view}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-serif text-3xl text-ink mb-2">Security</h2>
                    <p className="text-sm text-soft">Manage your credentials and active sessions.</p>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full sm:w-auto h-11 rounded-xl border-hair bg-white hover:bg-cream text-sm">
                        Change account password
                      </Button>
                      <Button 
                        onClick={() => setLogoutConfirm(true)}
                        variant="outline" 
                        className="w-full sm:w-auto h-11 rounded-xl border-hair bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 text-sm"
                      >
                        Sign out of all devices
                      </Button>
                    </div>

                    <div className="pt-8 mt-4 border-t border-hair">
                      <div className="p-6 rounded-2xl border border-rose-100 bg-rose-50/30">
                        <h3 className="text-rose-600 font-bold text-sm mb-1">Danger Zone</h3>
                        <p className="text-xs text-rose-500/80 mb-4 leading-relaxed">
                          Once confirmed, your account and all associated data will be permanently deleted. This action cannot be reversed.
                        </p>
                        <Button 
                          onClick={() => setDeleteConfirm(true)}
                          className="rounded-xl h-11 bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-200 border-none px-6"
                        >
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "data" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-serif text-3xl text-ink mb-2">Data & Privacy</h2>
                    <p className="text-sm text-soft">Export, backup, or clean your workspace records.</p>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button className="p-6 rounded-2xl border border-hair hover:bg-cream transition-all text-left flex flex-col gap-3 group">
                        <HugeiconsIcon icon={Download01Icon} size={24} className="text-soft group-hover:text-ink" />
                        <div>
                          <div className="text-sm font-bold text-ink">Export Workspace</div>
                          <div className="text-xs text-soft leading-relaxed">Download a full CSV of all clients, tasks, and notes.</div>
                        </div>
                      </button>
                      <button className="p-6 rounded-2xl border border-hair hover:bg-rose-50/50 hover:border-rose-100 transition-all text-left flex flex-col gap-3 group">
                        <HugeiconsIcon icon={Delete02Icon} size={24} className="text-soft group-hover:text-rose-500" />
                        <div>
                          <div className="text-sm font-bold text-ink">Purge Task History</div>
                          <div className="text-xs text-soft leading-relaxed">Permanently clear all task history older than 3 months.</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Save Bar */}
      <AnimatePresence>
        {isDirty && showSaveBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-3xl"
          >
            <div className="bg-charcoal text-white rounded-2xl p-4 flex items-center justify-between shadow-2xl border border-white/10 backdrop-blur-xl relative">
              <button 
                onClick={() => setShowSaveBar(false)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-charcoal border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all shadow-xl"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </button>
              
              <div className="flex items-center gap-3 ml-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-sm font-medium">You have unsaved changes</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  disabled={loading}
                  onClick={handleDiscard}
                  variant="ghost" 
                  className="h-10 px-4 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all font-medium"
                >
                  Discard
                </Button>
                <Button 
                  disabled={loading}
                  onClick={handleSave}
                  className="h-10 px-6 rounded-xl bg-white text-ink hover:bg-cream transition-all font-bold shadow-lg shadow-black/20"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
                  ) : "Save Changes"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialogs */}
      <Dialog open={logoutConfirm} onOpenChange={setLogoutConfirm}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl !bg-white border-hair shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-ink mb-2">Sign out?</DialogTitle>
            <DialogDescription className="text-soft text-base">
              Are you sure you want to sign out of your account? You'll land back at the home page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-3">
            <Button variant="ghost" onClick={() => setLogoutConfirm(false)} className="flex-1 rounded-full h-12 text-soft">Cancel</Button>
            <Button onClick={() => logout(true)} className="flex-1 rounded-full h-12 bg-rose-500 hover:bg-rose-600 text-white">Sign out</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl !bg-white border-hair shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-rose-600 mb-2">Delete Account?</DialogTitle>
            <DialogDescription className="text-soft text-base">
              This action is permanent and cannot be undone. All your clients, tasks, and history will be wiped forever.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-3">
            <Button variant="ghost" onClick={() => setDeleteConfirm(false)} className="flex-1 rounded-full h-12 text-soft">Go back</Button>
            <Button className="flex-1 rounded-full h-12 bg-rose-600 hover:bg-rose-700 text-white">Delete forever</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}