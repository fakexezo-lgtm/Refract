import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { HugeiconsIcon } from "@hugeicons/react";
import { LogoutIcon, UserIcon, Notification01Icon, PaintBrushIcon, ShieldIcon } from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";

function Card({ icon: Icon, title, subtitle, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-white border border-hair"
    >
      <div className="flex items-center gap-2 mb-1">
        <HugeiconsIcon icon={Icon} className="w-4 h-4 text-ink" strokeWidth={1.75} />
        <h3 className="font-serif text-xl text-ink">{title}</h3>
      </div>
      {subtitle && <p className="text-sm text-soft mb-4">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </motion.div>
  );
}

export default function Settings() {
  const { user, logout, checkUserAuth } = useAuth();
  const [name, setName] = useState(user?.full_name || "");
  const [saving, setSaving] = useState(false);
  const [dark, setDark] = useState(document.documentElement.classList.contains("dark"));
  const [emailDigest, setEmailDigest] = useState(true);

  const saveName = async () => {
    setSaving(true);
    await base44.auth.updateMe({ full_name: name });
    if (checkUserAuth) await checkUserAuth();
    setSaving(false);
  };

  const toggleDark = (on) => {
    setDark(on);
    document.documentElement.classList.toggle("dark", on);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <div className="text-[11px] uppercase tracking-[0.15em] text-soft mb-2">Your account</div>
        <h1 className="font-serif text-4xl md:text-5xl text-ink">Settings</h1>
      </div>

      <Card icon={UserIcon} title="Profile" subtitle="How you appear in Refract.">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-soft">Full name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-11 rounded-lg border-hair bg-white" />
          </div>
          <div>
            <label className="text-xs text-soft">Email</label>
            <Input value={user?.email || ""} disabled className="mt-1 h-11 rounded-lg border-hair bg-whisper" />
          </div>
          <Button onClick={saveName} disabled={saving} className="rounded-full bg-charcoal hover:bg-black text-white h-10 px-5">
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </Card>

      <Card icon={PaintBrushIcon} title="Preferences" subtitle="Small details that make Refract yours.">
        <div className="space-y-1 divide-y divide-hair">
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-sm text-ink">Dark mode</div>
              <div className="text-xs text-soft">Use the charcoal palette everywhere.</div>
            </div>
            <Switch checked={dark} onCheckedChange={toggleDark} />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-sm text-ink">Weekly digest</div>
              <div className="text-xs text-soft">A quiet Monday email with what's next.</div>
            </div>
            <Switch checked={emailDigest} onCheckedChange={setEmailDigest} />
          </div>
        </div>
      </Card>

      <Card icon={ShieldIcon} title="Account" subtitle="Session and security.">
        <Button onClick={() => logout(true)} variant="outline" className="rounded-full border-hair bg-white hover:bg-cream">
          <HugeiconsIcon icon={LogoutIcon} className="w-4 h-4 mr-1.5" /> Sign out
        </Button>
      </Card>

      <p className="text-xs text-soft text-center pt-4">Refract · built for focused relationship work.</p>
    </div>
  );
}