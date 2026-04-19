import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { STAGES } from "@/lib/constants";
import { logActivity } from "@/lib/activity";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

/**
 * Simplified AddDealDialog for non-technical users.
 * Focuses on Client -> Deal -> Action mental model.
 */
export default function AddDealDialog({ open, onOpenChange, initialStage = "lead" }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [value, setValue] = useState("");
  const [stage, setStage] = useState(initialStage);
  const [busy, setBusy] = useState(false);

  const { data: clients = [] } = useQuery({ 
    queryKey: ["clients"], 
    queryFn: () => base44.entities.Client.list("-updated_date", 500) 
  });

  useEffect(() => { 
    if (open) { 
        setTitle(""); 
        setClientId(""); 
        setValue(""); 
        setStage(initialStage); 
    } 
  }, [open, initialStage]);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !clientId) return;
    setBusy(true);
    
    try {
        const deal = await base44.entities.Deal.create({
            title: title.trim(),
            client_id: clientId,
            value: parseFloat(value) || 0,
            stage,
            priority: "medium", // Default priority internally for now
            updated_date: new Date().toISOString()
        });
        
        await logActivity({ 
            client_id: clientId, 
            type: "deal_created", 
            content: `New deal: ${title}`,
            metadata: { deal_id: deal.id, value }
        });

        qc.invalidateQueries({ queryKey: ["deals"] });
        qc.invalidateQueries({ queryKey: ["activities"] });
        toast.success(`Deal "${title}" created successfully`);
        onOpenChange(false);
    } catch (err) {
        toast.error("Failed to create deal");
    } finally {
        setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border-hair bg-white p-8">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-ink">New Opportunity</DialogTitle>
          <DialogDescription className="text-soft">Where are my deals? Start by adding one here.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-6 pt-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-ink">Client</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="h-12 rounded-xl border-hair bg-white">
                <SelectValue placeholder="Which client is this for?" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-hair">
                {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
                {clients.length === 0 && (
                    <div className="p-4 text-center text-xs text-soft italic">No clients found. Add one in the Clients tab first.</div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-ink">Deal Title</Label>
            <Input 
                autoFocus 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="e.g. Website Overhaul Package" 
                className="h-12 rounded-xl border-hair bg-white" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-ink">Deal Value ($)</Label>
                <Input 
                    type="number"
                    value={value} 
                    onChange={e => setValue(e.target.value)} 
                    placeholder="e.g. 4500" 
                    className="h-12 rounded-xl border-hair bg-white" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-ink">Pipeline Stage</Label>
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger className="h-12 rounded-xl border-hair bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-hair">
                    {STAGES.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl flex-1 h-12">Cancel</Button>
            <Button 
                type="submit" 
                disabled={!title.trim() || !clientId || busy} 
                className="rounded-xl bg-charcoal hover:bg-black text-white px-8 h-12 flex-1 font-bold"
            >
              {busy ? "Creating…" : "Save Deal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
