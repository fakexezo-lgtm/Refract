import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { apiRoutes } from "@/services/apiRoutes";
import { useQueryClient } from "@tanstack/react-query";
import { STAGES } from "@/constants";
import { logActivity } from "@/services/activity";
import { toast } from "sonner";

export default function AddDealDialog({ open, onOpenChange, client }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [stage, setStage] = useState("lead");
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (open) { setTitle(""); setStage("lead"); setValue(""); } }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await apiRoutes.createDeal({
        client_id: client.id,
        title: title.trim(),
        stage,
        value: value ? Number(value) : undefined
      });
      await logActivity({ client_id: client.id, type: "deal_created", content: `Deal added: ${title.trim()}` });
      qc.invalidateQueries({ queryKey: ["clientFull", client.id] });
      toast.success("Deal saved");
      onOpenChange(false);
    } catch (error) {
      toast.error(error?.message || "Unable to save deal. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-hair bg-white">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Add deal</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3 pt-2">
          <div>
            <label className="text-xs text-soft">Title</label>
            <Input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="Website redesign" className="mt-1 h-11 rounded-lg border-hair bg-white" />
          </div>
          <div>
            <label className="text-xs text-soft">Stage</label>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger className="mt-1 h-11 rounded-lg border-hair bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STAGES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-soft">Value (optional)</label>
            <Input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="5000" className="mt-1 h-11 rounded-lg border-hair bg-white" />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">Cancel</Button>
            <Button type="submit" disabled={!title.trim() || busy} className="rounded-full bg-charcoal hover:bg-black text-white px-5">
              {busy ? "Saving…" : "Add deal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
