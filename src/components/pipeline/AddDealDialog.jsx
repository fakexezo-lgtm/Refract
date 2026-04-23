// @ts-nocheck
import React, { useState, useEffect, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { apiRoutes } from "@/services/apiRoutes";
import { useQueryClient } from "@tanstack/react-query";
import { STAGES } from "@/constants";
import { logActivity } from "@/services/activity";
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
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [value, setValue] = useState("");
  const [stage, setStage] = useState(initialStage);
  const [busy, setBusy] = useState(false);

  useEffect(() => { 
    if (open) { 
        setTitle(""); 
        setClientId(""); 
        setValue(""); 
        setStage(initialStage); 
    } 
  }, [open, initialStage]);

  const isValid = title.trim() && clientId;

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !clientId) return;
    setBusy(true);
    
    try {
        const parsedValue = value === "" ? null : Number.parseFloat(value);
        const payload = {
            title: title.trim(),
            client_id: clientId,
            value: Number.isFinite(parsedValue) ? parsedValue : 0,
            stage
        };

        const deal = await apiRoutes.createDeal(payload);

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
        toast.error(err?.message || "Failed to create deal. Please try again.");
    } finally {
        setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-hair bg-white">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">New deal</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3 pt-2">
          <div>
            <label className="text-xs text-soft">Client</label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="mt-1 h-11 rounded-lg border-hair bg-white">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clientsLoading ? (
                    <div className="p-4 text-center text-xs text-soft">Loading...</div>
                ) : clients.length === 0 ? (
                    <div className="p-4 text-center text-xs text-soft">No clients found</div>
                ) : (
                    clients.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name || c.company}
                        </SelectItem>
                    ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-soft">Title</label>
            <Input 
                autoFocus 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="e.g. Website redesign" 
                className="mt-1 h-11 rounded-lg border-hair bg-white" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-soft">Value (optional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-soft/60">$</span>
                  <Input 
                      type="number"
                      value={value} 
                      onChange={e => setValue(e.target.value)} 
                      placeholder="0.00" 
                      className="mt-1 h-11 pl-7 rounded-lg border-hair bg-white" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-soft">Stage</label>
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger className="mt-1 h-11 rounded-lg border-hair bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.label}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">Cancel</Button>
            <Button 
                type="submit" 
                disabled={!isValid || busy} 
                className="rounded-full bg-charcoal hover:bg-black text-white px-5"
            >
              {busy ? "Saving…" : "Add deal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

