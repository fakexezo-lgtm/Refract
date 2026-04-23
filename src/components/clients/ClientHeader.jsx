// @ts-nocheck
import React from "react";
import StatusBadge from "@/components/shared/StatusBadge";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, MoreHorizontalIcon, Mail01Icon, CallIcon, Edit01Icon, Delete03Icon } from "@hugeicons/core-free-icons";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { base44 } from "@/services/base44Client";

export default function ClientHeader({ client, onStatusChange, onEdit, tabs }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  
  const handleDelete = async () => {
    await base44.entities.Client.delete(client.id);
    qc.invalidateQueries({ queryKey: ["clients"] });
    navigate("/app/clients");
  };

  return (
    <div className="pb-8">
      {/* Back Navigation */}
      <button 
        onClick={() => navigate("/app/clients")} 
        className="flex items-center gap-1 text-sm text-soft hover:text-ink transition-colors mb-8 group"
      >
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-cream group-hover:bg-charcoal group-hover:text-white transition-all">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
        </div>
        <span className="ml-1 font-bold tracking-tight">All clients</span>
      </button>

      {/* ─── Client Identity Card ─── */}
      <div className="bg-white rounded-2xl border border-hair p-8 md:p-10 shadow-sm relative overflow-hidden">
        {/* Momentum Background Hint */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cream/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        
        {/* Top Row: Name + Status + Actions */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 relative z-10">
          {/* Left: Name & Company */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 flex-wrap mb-3">
              <h1 className="font-serif text-4xl md:text-5xl text-ink tracking-tight leading-[1.1]">
                {client.name}
              </h1>
              <Select value={client.status} onValueChange={onStatusChange}>
                <SelectTrigger className="w-auto h-auto p-0 bg-transparent border-0 shadow-none hover:opacity-70 focus:ring-0">
                  <StatusBadge status={client.status} className="text-[11px] px-3 py-1.5 shadow-sm" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-hair bg-white">
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {client.company && (
              <p className="text-lg md:text-xl text-soft font-medium tracking-tight opacity-80">{client.company}</p>
            )}
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 self-start">
            <Button
              onClick={onEdit}
              variant="outline"
              size="sm"
              className="rounded-full h-11 px-6 bg-white border-hair hover:bg-cream transition-all gap-2.5 text-ink font-bold shadow-sm"
            >
              <HugeiconsIcon icon={Edit01Icon} size={16} />
              <span className="text-sm">Edit</span>
            </Button>
            <Button
              onClick={() => setDeleteOpen(true)}
              variant="outline"
              size="sm"
              className="rounded-full h-11 px-6 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all gap-2.5 font-bold shadow-sm"
            >
              <HugeiconsIcon icon={Delete03Icon} size={16} />
              <span className="text-sm">Delete</span>
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-hair/60 mb-8" />

        {/* Contact Info Row */}
        <div className="flex flex-wrap items-center gap-x-10 gap-y-4 relative z-10">
          {client.email && (
            <a 
              href={`mailto:${client.email}`} 
              className="inline-flex items-center gap-3 text-sm text-soft hover:text-ink transition-colors group/email"
            >
              <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center group-hover/email:bg-charcoal group-hover/email:text-white transition-all shadow-sm border border-hair/40">
                <HugeiconsIcon icon={Mail01Icon} size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-black text-soft/60 leading-none mb-1">Email</span>
                <span className="font-bold tracking-tight">{client.email}</span>
              </div>
            </a>
          )}
          {client.phone && (
            <a 
              href={`tel:${client.phone}`} 
              className="inline-flex items-center gap-3 text-sm text-soft hover:text-ink transition-colors group/phone"
            >
              <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center group-phone/phone:bg-charcoal group-hover/phone:text-white transition-all shadow-sm border border-hair/40">
                <HugeiconsIcon icon={CallIcon} size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-black text-soft/60 leading-none mb-1">Phone</span>
                <span className="font-bold tracking-tight">{client.phone}</span>
              </div>
            </a>
          )}
          {!client.email && !client.phone && (
            <div className="flex items-center gap-3 py-2 px-4 rounded-xl bg-whisper/40 border border-hair border-dashed">
              <span className="text-xs text-soft font-medium italic">No contact information added yet.</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Tab Strip ─── */}
      <div className="mt-8">
        {tabs}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-2xl border-hair bg-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl">Delete client?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {client.name} and all associated deals, tasks, and history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-full bg-danger hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

