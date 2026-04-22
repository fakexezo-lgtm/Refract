// @ts-nocheck
import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  UserIcon, 
  Shield01Icon as ShieldIcon, 
  Database01Icon as DatabaseIcon, 
  Download01Icon, 
  Delete02Icon,
  AlertCircleIcon as InformationCircleIcon,
  Logout01Icon as LogoutIcon
} from "@hugeicons/core-free-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { apiRoutes } from "@/lib/apiRoutes";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const CATEGORIES = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "account", label: "Account", icon: ShieldIcon },
  { id: "data", label: "Data", icon: DatabaseIcon },
];

export default function Settings() {
  const { user, logout, updateUserMetadata } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const [settings, setSettings] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await updateUserMetadata({ full_name: settings.full_name });
      if (!result.success) throw new Error(result.error);
      alert('Changes saved successfully');
    } catch (e) {
      alert('Failed to save changes: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout(false);
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    try {
      await apiRoutes.deleteAccount();
      await logout(false);
      navigate('/login');
    } catch (e) {
      alert('Failed to delete account. Please try again.');
    }
    setDeleteConfirm(false);
  };

  const handleExportData = async () => {
    try {
      const data = await apiRoutes.exportData();
      
      const clientsCSV = convertToCSV(data.clients || [], ['name', 'email', 'company', 'status', 'created_at']);
      const tasksCSV = convertToCSV(data.tasks || [], ['title', 'completed', 'due_date', 'client_id', 'created_at']);
      const dealsCSV = convertToCSV(data.deals || [], ['title', 'value', 'stage', 'client_id', 'created_at']);
      
      downloadCSV(clientsCSV, 'clients.csv');
      downloadCSV(tasksCSV, 'tasks.csv');
      downloadCSV(dealsCSV, 'deals.csv');
      
      alert('Data exported successfully!');
    } catch (e) {
      alert('Failed to export data. Please try again.');
    }
  };

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="mb-10">
        <div className="text-[11px] uppercase tracking-[0.15em] text-soft mb-2">Control Center</div>
        <h1 className="font-serif text-4xl md:text-5xl text-ink">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px,1fr] gap-12 items-start">
        {/* Navigation - Sidebar */}
        <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 lg:sticky lg:top-24 no-scrollbar -mx-5 px-5 lg:mx-0 lg:px-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              style={{ touchAction: 'manipulation' }}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap active:scale-95 ${
                activeTab === cat.id 
                  ? "bg-charcoal text-white shadow-md" 
                  : "text-soft hover:text-ink hover:bg-cream"
              }`}
            >
              <HugeiconsIcon icon={cat.icon} size={18} />
              {cat.label}
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <div className="bg-white rounded-3xl border border-hair p-6 md:p-10 min-h-[500px]">
          <div key={activeTab}>
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
                        onChange={(e) => setSettings(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder="Your name"
                        style={{ touchAction: 'manipulation' }}
                        className="h-11 rounded-xl border-hair bg-cream/10 focus:bg-white transition-all shadow-none" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-soft ml-1">Email address</label>
                      <div className="relative">
                        <Input 
                          value={user?.email || ''} 
                          disabled 
                          className="h-11 rounded-xl border-hair bg-whisper text-soft cursor-not-allowed pr-10" 
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 group">
                          <HugeiconsIcon icon={InformationCircleIcon} size={16} className="text-soft/40" />
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={handleSave} 
                      disabled={loading} 
                      style={{ touchAction: 'manipulation' }}
                      className="bg-charcoal text-white hover:bg-black rounded-xl px-8 h-12 active:scale-95 transition-all"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "account" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-serif text-3xl text-ink mb-2">Account</h2>
                    <p className="text-sm text-soft">Manage your credentials and account.</p>
                  </div>
                  <div className="space-y-6 max-w-md">
                    <Button 
                      variant="outline" 
                      style={{ touchAction: 'manipulation' }}
                      className="w-full h-11 rounded-xl border-hair bg-white hover:bg-cream text-sm justify-start active:scale-[0.98] transition-all"
                    >
                      Change password
                    </Button>
                    <Button 
                      onClick={() => setLogoutConfirm(true)}
                      variant="outline" 
                      style={{ touchAction: 'manipulation' }}
                      className="w-full h-11 rounded-xl border-hair bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 text-sm justify-start active:scale-[0.98] transition-all"
                    >
                      <HugeiconsIcon icon={LogoutIcon} className="w-4 h-4 mr-2" />
                      Sign out
                    </Button>

                    <div className="pt-8 mt-4 border-t border-hair">
                      <div className="p-6 rounded-2xl border border-rose-100 bg-rose-50/30">
                        <h3 className="text-rose-600 font-bold text-sm mb-1">Danger Zone</h3>
                        <p className="text-xs text-rose-500/80 mb-4 leading-relaxed">
                          Once confirmed, your account and all associated data will be permanently deleted. This action cannot be reversed.
                        </p>
                        <Button 
                          onClick={() => setDeleteConfirm(true)}
                          style={{ touchAction: 'manipulation' }}
                          className="rounded-xl h-11 bg-rose-500 hover:bg-rose-600 text-white border-none px-6 active:scale-95 transition-all"
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
                    <h2 className="font-serif text-3xl text-ink mb-2">Data</h2>
                    <p className="text-sm text-soft">Export your data.</p>
                  </div>
                  <div className="space-y-6 max-w-md">
                  <button 
                    onClick={handleExportData}
                    style={{ touchAction: 'manipulation' }}
                    className="w-full p-6 rounded-2xl border border-hair hover:bg-cream transition-all text-left flex flex-col gap-3 group active:scale-[0.98]"
                  >
                    <HugeiconsIcon icon={Download01Icon} size={24} className="text-soft group-hover:text-ink" />
                    <div>
                      <div className="text-sm font-bold text-ink">Export all data as CSV</div>
                      <div className="text-xs text-soft leading-relaxed">Download a full CSV of all clients, tasks, and deals.</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={logoutConfirm} onOpenChange={setLogoutConfirm}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl !bg-white border-hair">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-ink mb-2">Sign out?</DialogTitle>
            <DialogDescription className="text-soft text-base">
              Are you sure you want to sign out of your account? You'll land back at the home page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-3">
            <Button variant="ghost" onClick={() => setLogoutConfirm(false)} className="flex-1 rounded-full h-12 text-soft active:scale-95 transition-all">Cancel</Button>
            <Button onClick={handleLogout} className="flex-1 rounded-full h-12 bg-rose-500 hover:bg-rose-600 text-white active:scale-95 transition-all">Sign out</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl !bg-white border-hair">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-rose-600 mb-2">Delete Account?</DialogTitle>
            <DialogDescription className="text-soft text-base">
              This action is permanent and cannot be undone. All your clients, tasks, and history will be wiped forever.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-3">
            <Button variant="ghost" onClick={() => setDeleteConfirm(false)} className="flex-1 rounded-full h-12 text-soft active:scale-95 transition-all">Go back</Button>
            <Button onClick={handleDeleteAccount} className="flex-1 rounded-full h-12 bg-rose-600 hover:bg-rose-700 text-white active:scale-95 transition-all">Delete forever</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helpers
const convertToCSV = (data, fields) => {
  if (!data.length) return '';
  const header = fields.join(',');
  const rows = data.map(item => fields.map(field => {
    const value = item[field] || '';
    return `"${String(value).replace(/"/g, '""')}"`;
  }).join(','));
  return [header, ...rows].join('\n');
};

const downloadCSV = (csv, filename) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};