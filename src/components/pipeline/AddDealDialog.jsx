// @ts-nocheck
import React, { useState, useEffect, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { apiRoutes } from "@/lib/apiRoutes";
import { useQueryClient } from "@tanstack/react-query";
import { STAGES } from "@/lib/constants";
import { logActivity } from "@/lib/activity";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserIcon, 
  CheckmarkSquareIcon, 
  CircleIcon, 
  DashboardSquareIcon,
  Add01Icon
} from "@hugeicons/core-free-icons";

/**
 * Enhanced AddDealDialog with premium aesthetics, optimistic updates, and smooth animations.
 */
export default function AddDealDialog({ open, onOpenChange, initialStage = "lead", clients = [], clientsLoading = false }) {
  const qc = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [value, setValue] = useState("");
  const [stage, setStage] = useState(initialStage);
  const [busy, setBusy] = useState(false);
  const [focused, setFocused] = useState(null);

  useEffect(() => { 
    if (open) { 
        setTitle(""); 
        setClientId(""); 
        setValue(""); 
        setStage(initialStage); 
    } 
  }, [open, initialStage]);

  const isValid = title.trim() && clientId;

  const handleClientChange = (val) => {
    startTransition(() => setClientId(val));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !clientId) {
      toast.error("Please select a client and name the opportunity.");
      return;
    }
    setBusy(true);
    
    try {
        const parsedValue = value === "" ? null : Number.parseFloat(value);
        const payload = {
            title: title.trim(),
            client_id: clientId,
            value: Number.isFinite(parsedValue) ? parsedValue : 0,
            stage
        };

        // Optimistic update - immediately add to cache
        const tempId = `temp-${Date.now()}`;
        const optimisticDeal = { ...payload, id: tempId, created_at: new Date().toISOString() };
        
        qc.setQueryData(["deals"], (old) => [...(old || []), optimisticDeal]);

        const deal = await apiRoutes.createDeal(payload);

        // Replace optimistic deal with real one
        qc.setQueryData(["deals"], (old) => 
          (old || []).map(d => d.id === tempId ? deal : d)
        );

        await logActivity({ 
            client_id: clientId, 
            type: "deal_created", 
            content: `Initiated deal: ${title.trim()}`,
            metadata: { deal_id: deal.id, value: payload.value }
        });

        qc.invalidateQueries({ queryKey: ["deals"] });
        qc.invalidateQueries({ queryKey: ["activities"] });
        
        toast.success(`Success! "${title.trim()}" is now in your pipeline.`);
        onOpenChange(false);
    } catch (err) {
        // Rollback on error
        qc.invalidateQueries({ queryKey: ["deals"] });
        toast.error(err?.message || "Failed to create deal. Please try again.");
    } finally {
        setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-[2.5rem] border-none bg-white p-10 shadow-2xl overflow-hidden ring-1 ring-hair/50">
        <DialogHeader className="mb-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-4"
          >
             <div className="w-10 h-10 rounded-2xl bg-[#efa36a]/10 flex items-center justify-center border border-[#efa36a]/20">
                <HugeiconsIcon icon={Add01Icon} size={20} className="text-[#efa36a]" strokeWidth={3} />
             </div>
             <span className="text-[0.625rem] font-bold uppercase tracking-[0.25em] text-soft">New Opportunity</span>
          </motion.div>
          <DialogTitle className="font-serif text-4xl text-ink tracking-tight mb-2">Create Deal</DialogTitle>
          <DialogDescription className="text-soft text-base leading-relaxed max-w-[34ch]">
            Fill in the details to start tracking this potential business.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-8">
          {/* Client Selection */}
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={UserIcon} size={14} className="text-soft" />
              <Label className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-soft">Identify Client</Label>
            </div>
            <Select value={clientId} onValueChange={handleClientChange}>
              <SelectTrigger className={cn(
                "h-14 rounded-2xl border-hair bg-whisper/20 transition-all px-5 font-bold text-ink focus:ring-4 focus:ring-charcoal/5",
                focused === 'client' && "ring-4 ring-[#efa36a]/20 border-[#efa36a]"
              )}>
                <SelectValue placeholder="Which client represents this deal?" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-hair shadow-2xl p-2 max-h-[300px] overflow-y-auto">
                {clientsLoading ? (
                    <div className="p-6 text-center text-xs text-soft font-medium animate-pulse">Loading clients...</div>
                ) : clients.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-xs text-soft mb-3">No clients yet.</p>
                    </div>
                ) : (
                    clients.map(c => (
                        <SelectItem key={c.id} value={c.id} className="rounded-xl py-3 focus:bg-cream cursor-pointer">
                          <span className="font-semibold text-sm">{c.name || c.company}</span>
                        </SelectItem>
                    ))
                )}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Deal Title */}
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={CheckmarkSquareIcon} size={14} className="text-soft" />
              <Label className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-soft">Deal Reference</Label>
            </div>
            <Input 
                autoFocus 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                onFocus={() => setFocused('title')}
                onBlur={() => setFocused(null)}
                placeholder="e.g. Q4 Website Development" 
                className={cn(
                  "h-14 rounded-2xl border-hair bg-white px-5 font-semibold text-ink focus:ring-4 focus:ring-charcoal/5 transition-all text-base",
                  focused === 'title' && "ring-4 ring-[#efa36a]/20 border-[#efa36a]"
                )} 
            />
          </motion.div>

          <div className="grid grid-cols-2 gap-6">
              {/* Financial Value */}
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={CircleIcon} size={14} className="text-soft" />
                  <Label className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-soft">Expected Value</Label>
                </div>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg font-serif text-soft/40 group-focus-within:text-charcoal pr-1 transition-colors">$</span>
                  <Input 
                      type="number"
                      value={value} 
                      onChange={e => setValue(e.target.value)} 
                      onFocus={() => setFocused('value')}
                      onBlur={() => setFocused(null)}
                      placeholder="0.00" 
                      className={cn(
                        "h-14 rounded-2xl border-hair bg-whisper/10 px-10 font-semibold tabular-nums text-ink text-lg focus:bg-white transition-all focus:ring-4 focus:ring-charcoal/5",
                        focused === 'value' && "ring-4 ring-[#efa36a]/20 border-[#efa36a]"
                      )} 
                  />
                </div>
              </motion.div>

              {/* Phase Selection */}
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={DashboardSquareIcon} size={14} className="text-soft" />
                  <Label className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-soft">Initial Phase</Label>
                </div>
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger className="h-14 rounded-2xl border-hair bg-whisper/20 font-semibold text-ink px-5 focus:ring-4 focus:ring-charcoal/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-hair p-2 shadow-2xl">
                    {STAGES.map(s => (
                        <SelectItem key={s.id} value={s.id} className="rounded-xl py-3 focus:bg-cream cursor-pointer">
                          <span className="font-semibold text-sm tracking-tight">{s.label}</span>
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
          </div>

          <motion.div 
            className="flex items-center gap-4 pt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button 
                type="button" 
                variant="ghost" 
                onClick={() => onOpenChange(false)} 
                className="flex-1 h-14 rounded-2xl text-[0.625rem] font-bold uppercase tracking-[0.25em] text-soft hover:bg-red-50 hover:text-red-500 transition-all"
            >
              Cancel
            </Button>
            <Button 
                type="submit" 
                disabled={!isValid || busy} 
                className="flex-[1.5] h-14 rounded-2xl bg-charcoal hover:bg-black text-white font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-charcoal/10 transition-all active:scale-[0.98] disabled:opacity-30 disabled:active:scale-100"
            >
              <AnimatePresence mode="wait">
                {busy ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Creating...
                  </motion.span>
                ) : (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Launch Deal
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
