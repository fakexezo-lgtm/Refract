// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { useQueryClient } from "@tanstack/react-query";
import { logActivity } from "@/services/activity";
import { apiRoutes } from "@/services/apiRoutes";
import { toast } from "sonner";

export default function AddNoteDialog({ open, onOpenChange, client, note = null }) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { 
    if (open) {
      setText(note ? note.content : ""); 
    }
  }, [open, note]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !client?.id) return;
    setBusy(true);
    
    try {
      if (note) {
        await apiRoutes.updateNote(note.id, { content: text.trim() });
        toast.success("Note updated");
      } else {
        const created = await apiRoutes.createNote({
          client_id: client.id,
          content: text.trim(),
        });
        await logActivity({ 
          client_id: client.id, 
          type: "note", 
          content: text.trim().substring(0, 100) + (text.length > 100 ? "..." : "") 
        }).catch(err => console.warn("Activity log failed:", err));
        toast.success("Note added");
      }
      
      qc.invalidateQueries({ queryKey: ["clientFull", client.id] });
      onOpenChange(false);
    } catch (err) {
      console.error("AddNoteDialog error:", err);
      toast.error(err?.message || "Failed to save note");
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-hair bg-white">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{note ? "Edit note" : "Add note"}</DialogTitle>
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
