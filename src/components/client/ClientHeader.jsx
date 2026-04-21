// @ts-nocheck
import React from "react";
import StatusBadge from "@/components/shared/StatusBadge";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, MoreHorizontalIcon, Mail01Icon, CallIcon, Edit01Icon, Delete03Icon } from "@hugeicons/core-free-icons";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";
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
import { base44 } from "@/api/base44Client";

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
    <div className="pt-6 md:pt-10 pb-2">
      {/* Back Navigation */}
      <button 
        onClick={() => navigate("/app/clients")} 
        className="inline-flex items-center gap-1.5 text-sm text-soft hover:text-ink transition group mb-8"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>All clients</span>
      </button>

      {/* ─── Client Identity Card ─── */}
      <div className="bg-white rounded-[1.5rem] border border-hair/60 p-8 md:p-10 shadow-sm">
        
        {/* Top Row: Name + Status + Actions */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
          {/* Left: Name & Company */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="font-serif text-3xl md:text-4xl text-ink tracking-tight leading-none">
                {client.name}
              </h1>
              <Select value={client.status} onValueChange={onStatusChange}>
                <SelectTrigger className="w-auto h-auto p-0 bg-transparent border-0 shadow-none hover:opacity-70 focus:ring-0">
                  <StatusBadge status={client.status} className="text-[11px] px-3 py-1.5" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-hair bg-white">
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {client.company && (
              <p className="text-base text-soft tracking-tight">{client.company}</p>
            )}
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-3 shrink-0 self-start">
            <Button
              onClick={onEdit}
              variant="outline"
              size="sm"
              className="rounded-full h-10 px-5 bg-white border-hair hover:bg-cream transition-all gap-2 text-ink"
            >
              <HugeiconsIcon icon={Edit01Icon} className="w-3.5 h-3.5" />
              <span className="text-sm font-medium">Edit Client</span>
            </Button>
            <Button
              onClick={() => setDeleteOpen(true)}
              variant="outline"
              size="sm"
              className="rounded-full h-10 px-5 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all gap-2"
            >
              <HugeiconsIcon icon={Delete03Icon} className="w-3.5 h-3.5" />
              <span className="text-sm font-medium">Delete Client</span>
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-hair/60 my-6" />

        {/* Contact Info Row */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          {client.email && (
            <a 
              href={`mailto:${client.email}`} 
              className="inline-flex items-center gap-2.5 text-sm text-soft hover:text-ink transition-colors group/email"
            >
              <div className="w-8 h-8 rounded-full bg-whisper flex items-center justify-center group-hover/email:bg-cream transition-colors">
                <HugeiconsIcon icon={Mail01Icon} className="w-4 h-4 text-soft" />
              </div>
              <span className="font-medium">{client.email}</span>
            </a>
          )}
          {client.phone && (
            <a 
              href={`tel:${client.phone}`} 
              className="inline-flex items-center gap-2.5 text-sm text-soft hover:text-ink transition-colors group/phone"
            >
              <div className="w-8 h-8 rounded-full bg-whisper flex items-center justify-center group-hover/phone:bg-cream transition-colors">
                <HugeiconsIcon icon={CallIcon} className="w-4 h-4 text-soft" />
              </div>
              <span className="font-medium">{client.phone}</span>
            </a>
          )}
          {!client.email && !client.phone && (
            <p className="text-sm text-soft/60 italic">No contact information added yet.</p>
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