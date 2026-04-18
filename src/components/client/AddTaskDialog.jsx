import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { logActivity } from "@/lib/activity";

export default function AddTaskDialog({ open, onOpenChange, client }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle("");
      const t = new Date(); t.setDate(t.getDate() + 1);
      setDue(t.toISOString().slice(0, 10));
    }
  }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    await base44.entities.Task.create({ client_id: client.id, title: title.trim(), due_date: due || undefined, completed: false });
    await logActivity({ client_id: client.id, type: "task_created", content: `Task added: ${title.trim()}` });
    qc.invalidateQueries({ queryKey: ["tasks"] });
    qc.invalidateQueries({ queryKey: ["activities"] });
    qc.invalidateQueries({ queryKey: ["client", client.id] });
    setBusy(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-hair bg-white">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Add task</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3 pt-2">
          <div>
            <label className="text-xs text-soft">Task</label>
            <Input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="Send revised proposal" className="mt-1 h-11 rounded-lg border-hair bg-white" />
          </div>
          <div>
            <label className="text-xs text-soft">Due date</label>
            <Input type="date" value={due} onChange={e => setDue(e.target.value)} className="mt-1 h-11 rounded-lg border-hair bg-white" />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">Cancel</Button>
            <Button type="submit" disabled={!title.trim() || busy} className="rounded-full bg-charcoal hover:bg-black text-white px-5">
              {busy ? "Saving…" : "Add task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}