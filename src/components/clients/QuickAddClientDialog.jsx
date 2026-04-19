import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { pickAvatarColor } from "@/lib/constants";
import { logActivity } from "@/lib/activity";

export default function QuickAddClientDialog({ open, onOpenChange }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("lead");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (open) { setName(""); setCompany(""); setEmail(""); setPhone(""); setStatus("lead"); } }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    const client = await base44.entities.Client.create({
      name: name.trim(), 
      company: company.trim(), 
      email: email.trim(), 
      phone: phone.trim(),
      status,
      avatar_color: pickAvatarColor(name),
      last_contacted_at: new Date().toISOString(),
    });
    await logActivity({ client_id: client.id, type: "client_created", content: `Added ${client.name}` });
    qc.invalidateQueries({ queryKey: ["clients"] });
    qc.invalidateQueries({ queryKey: ["activities"] });
    setBusy(false);
    onOpenChange(false);
    navigate(`/app/clients/${client.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-hair bg-white">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">New client</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3 pt-2">
          <div>
            <label className="text-xs text-soft">Name</label>
            <Input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Marianne Lavoie" className="mt-1 h-11 rounded-lg border-hair bg-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-soft">Company (optional)</label>
              <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="Atelier Nomade" className="mt-1 h-11 rounded-lg border-hair bg-white" />
            </div>
            <div>
              <label className="text-xs text-soft">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1 h-11 rounded-lg border-hair bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-xs text-soft">Email (optional)</label>
            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="hi@example.com" className="mt-1 h-11 rounded-lg border-hair bg-white" />
          </div>
          <div>
            <label className="text-xs text-soft">Phone (optional)</label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="mt-1 h-11 rounded-lg border-hair bg-white" />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">Cancel</Button>
            <Button type="submit" disabled={!name.trim() || busy} className="rounded-full bg-charcoal hover:bg-black text-white px-5">
              {busy ? "Saving…" : "Add client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}