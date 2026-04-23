// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { logActivity } from "@/services/activity";
import { apiRoutes } from "@/services/apiRoutes";

export default function EditClientDialog({ open, onOpenChange, client }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("lead");
  const [busy, setBusy] = useState(false);

  useEffect(() => { 
    if (open && client) { 
      setName(client.name || ""); 
      setCompany(client.company || ""); 
      setEmail(client.email || ""); 
      setPhone(client.phone || ""); 
      setStatus(client.status || "lead"); 
    } 
  }, [open, client]);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    
    try {
      await apiRoutes.updateClient(client.id, {
        name: name.trim(), 
        company: company.trim(), 
        email: email.trim(), 
        phone: phone.trim(),
        status,
      });
      
      await logActivity({ 
        client_id: client.id, 
        type: "client_updated", 
        content: `Updated details for ${name}`, 
        metadata: { name, company, email, status } 
      });
      
      qc.invalidateQueries({ queryKey: ["clientFull", client.id] });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Failed to update client. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-hair bg-white">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Edit client</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3 pt-2">
          <div>
            <label className="text-xs text-soft">Name</label>
            <Input autoFocus value={name} onChange={e => setName(e.target.value)} className="mt-1 h-11 rounded-lg border-hair bg-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-soft">Company</label>
              <Input value={company} onChange={e => setCompany(e.target.value)} className="mt-1 h-11 rounded-lg border-hair bg-white" />
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
            <label className="text-xs text-soft">Email</label>
            <Input value={email} onChange={e => setEmail(e.target.value)} className="mt-1 h-11 rounded-lg border-hair bg-white" />
          </div>
          <div>
            <label className="text-xs text-soft">Phone</label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 h-11 rounded-lg border-hair bg-white" />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">Cancel</Button>
            <Button type="submit" disabled={!name.trim() || busy} className="rounded-full bg-charcoal hover:bg-black text-white px-5">
              {busy ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

