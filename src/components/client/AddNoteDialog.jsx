import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { useQueryClient } from "@tanstack/react-query";
import { logActivity } from "@/lib/activity";

export default function AddNoteDialog({ open, onOpenChange, client }) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (open) setText(""); }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    await logActivity({ client_id: client.id, type: "note", content: text.trim() });
    qc.invalidateQueries({ queryKey: ["activities"] });
    qc.invalidateQueries({ queryKey: ["clients"] });
    qc.invalidateQueries({ queryKey: ["client", client.id] });
    setBusy(false);
    onOpenChange(false);
  };

  const onKey = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-hair bg-white">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Add note</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="pt-2">
          <Textarea
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={onKey}
            placeholder="What happened? What did they say?"
            className="min-h-[140px] rounded-lg border-hair bg-white resize-none"
          />
          <div className="flex items-center justify-between mt-4">
            <div className="text-xs text-soft">⌘+Enter to save</div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">Cancel</Button>
              <Button type="submit" disabled={!text.trim() || busy} className="rounded-full bg-charcoal hover:bg-black text-white px-5">
                {busy ? "Saving…" : "Save note"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}