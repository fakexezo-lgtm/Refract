// @ts-nocheck
import React, { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "@/lib/apiRoutes";
import { logActivity } from "@/lib/activity";
import { DatePicker } from "@/components/ui/date-picker";
import { parseDate, getLocalTimeZone, today } from "@internationalized/date";

export default function AddTaskDialog({ open, onOpenChange, client: preselectedClient }) {
  const qc = useQueryClient();
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: apiRoutes.getClients });

  const [title, setTitle] = useState("");
  const [due, setDue] = useState(null);
  const [clientId, setClientId] = useState("");
  const [busy, setBusy] = useState(false);

  const clientList = useMemo(
    () => clients.filter((c) => c.name).sort((a, b) => a.name.localeCompare(b.name)),
    [clients]
  );

  useEffect(() => {
    if (open) {
      setTitle("");
      setClientId(preselectedClient?.id || "");
      setDue(today(getLocalTimeZone()).add({ days: 1 }));
    }
  }, [open, preselectedClient]);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !clientId) return;
    setBusy(true);

    try {
      await apiRoutes.createTask({
        client_id: clientId,
        title: title.trim(),
        due_date: due ? due.toString() : undefined,
        completed: false,
      });

      const selectedClient = clientList.find((c) => c.id === clientId);
      if (selectedClient) {
        await logActivity({
          client_id: clientId,
          type: "task_created",
          content: `Task added: ${title.trim()}`,
          metadata: {},
        });
      }

      // Brief pause so any in-flight completion writes settle before the refetch
      await new Promise((r) => setTimeout(r, 300));
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["activities"] });
      if (selectedClient) {
        qc.invalidateQueries({ queryKey: ["clientFull", clientId] });
      }

      onOpenChange(false);
      toast.success("Task added");
    } catch (error) {
      toast.error(error?.message || "Unable to add task.");
    } finally {
      setBusy(false);
    }
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
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Send revised proposal"
              className="mt-1 h-11 rounded-lg border-hair bg-white"
            />
          </div>

          {!preselectedClient && (
            <div>
              <label className="text-xs text-soft">Client</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="mt-1 h-11 w-full rounded-lg border border-hair bg-white px-3 text-sm"
                required
              >
                <option value="">Select a client...</option>
                {clientList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <DatePicker 
              label="Due date"
              value={due}
              onChange={setDue}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || (!clientId && !preselectedClient) || busy}
              className="rounded-full bg-charcoal hover:bg-black text-white px-5"
            >
              {busy ? "Saving…" : "Add task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}