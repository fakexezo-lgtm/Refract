import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { useAuth } from "@/lib/AuthContext";

const WORK_TYPES = ["Design studio", "Freelance developer", "Consultant", "Agency", "Creator", "Other"];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, checkUserAuth } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [workType, setWorkType] = useState("");
  const [busy, setBusy] = useState(false);

  const finish = async () => {
    setBusy(true);
    await base44.entities.Workspace.create({ name: name || (user?.full_name || "My workspace"), work_type: workType, onboarded: true });

    // Update local user state
    const stored = localStorage.getItem('refract_user');
    if (stored) {
      const u = JSON.parse(stored);
      u.onboarded = true;
      localStorage.setItem('refract_user', JSON.stringify(u));
    }

    if (checkUserAuth) await checkUserAuth();
    navigate("/app");
  };

  const next = () => setStep(s => s + 1);

  return (
    <div className="min-h-screen bg-whisper flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-charcoal flex items-center justify-center">
            <span className="font-serif text-cream leading-none">R</span>
          </div>
          <span className="font-serif text-xl">Refract</span>
        </div>

        <div className="flex gap-1.5 mb-10">
          {[0,1,2].map(i => (
            <div key={i} className={i <= step ? "h-1 flex-1 rounded-full transition bg-ink" : "h-1 flex-1 rounded-full transition bg-border"} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h1 className="font-serif text-4xl md:text-5xl mb-3">Welcome{user?.full_name ? ", " + user.full_name.split(" ")[0] : ""}.</h1>
              <p className="text-soft mb-10 leading-relaxed">Let's set up your workspace in two quick steps. You can change everything later.</p>
              <Button onClick={next} className="bg-charcoal text-white hover:bg-black rounded-full px-6 h-11">
                Get started <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="text-[11px] uppercase tracking-[0.15em] text-soft mb-2">Step 1 of 2</div>
              <h2 className="font-serif text-3xl md:text-4xl mb-2">Name your workspace</h2>
              <p className="text-soft mb-8">A private space for your clients and deals.</p>
              <Input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Studio Nomade"
                className="h-12 rounded-xl bg-white border-hair text-base mb-6"
              />
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep(0)} className="rounded-full">Back</Button>
                <Button onClick={next} disabled={!name.trim()} className="bg-charcoal text-white hover:bg-black rounded-full px-6 h-11 ml-auto">
                  Continue <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="text-[11px] uppercase tracking-[0.15em] text-soft mb-2">Step 2 of 2</div>
              <h2 className="font-serif text-3xl md:text-4xl mb-2">What do you do?</h2>
              <p className="text-soft mb-8">Helps us tailor the experience. Pick one.</p>
              <div className="grid grid-cols-2 gap-2 mb-8">
                {WORK_TYPES.map(w => (
                  <button
                    key={w}
                    onClick={() => setWorkType(w)}
                    className={workType === w ? "p-4 text-sm text-left rounded-xl border transition bg-charcoal text-white border-charcoal" : "p-4 text-sm text-left rounded-xl border transition bg-white border-hair hover:bg-cream"}
                  >
                    <div className="flex items-center justify-between">
                      <span>{w}</span>
                      {workType === w && <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4" />}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep(1)} className="rounded-full">Back</Button>
                <Button onClick={finish} disabled={!workType || busy} className="bg-charcoal text-white hover:bg-black rounded-full px-6 h-11 ml-auto">
                  {busy ? "Setting up..." : "Enter Refract"} <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
