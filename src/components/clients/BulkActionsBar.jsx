// @ts-nocheck
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, FolderTransferIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "@/lib/apiRoutes";
import { logActivity } from "@/lib/activity";

const STAGES = [
  { id: "lead", label: "Lead" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
];

export default function BulkActionsBar({ selectedIds, onClear }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} clients? This action cannot be undone.`)) return;
    setBusy(true);
    try {
      await apiRoutes.deleteClients(selectedIds);
      await logActivity({
        type: "bulk_delete",
        content: `Deleted ${selectedIds.length} clients`,
        metadata: { count: selectedIds.length }
      });
      qc.invalidateQueries({ queryKey: ["clients"] });
      onClear();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const handleMove = async (status) => {
    setBusy(true);
    try {
      await apiRoutes.updateClientsStatus(selectedIds, status);
      await logActivity({
        type: "bulk_move",
        content: `Moved ${selectedIds.length} clients to ${status}`,
        metadata: { count: selectedIds.length, status }
      });
      qc.invalidateQueries({ queryKey: ["clients"] });
      onClear();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 w-full z-50 bg-charcoal text-white border-t border-white/10 px-6 py-4 flex items-center gap-6"
    >
      <div className="flex items-center gap-3 pr-6 border-r border-white/10">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm">
          {selectedIds.length}
        </div>
        <div className="text-sm font-medium text-white/70">Selected</div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              disabled={busy}
              className="bg-white/5 hover:bg-white/10 text-white border-white/10 h-10 rounded-xl px-4 flex items-center gap-2"
            >
              <HugeiconsIcon icon={FolderTransferIcon} className="w-4 h-4" />
              Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-charcoal border-white/10 text-white w-40">
            {STAGES.map(stage => (
              <DropdownMenuItem 
                key={stage.id}
                onClick={() => handleMove(stage.id)}
                className="focus:bg-white/10 focus:text-white cursor-pointer"
              >
                {stage.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="destructive"
          onClick={handleDelete}
          disabled={busy}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 h-10 rounded-xl px-4 flex items-center gap-2"
        >
          <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4" />
          Delete
        </Button>
      </div>

      <div className="flex-1" />

      <button 
        onClick={onClear}
        className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition"
      >
        <HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5" />
      </button>
    </div>
  );
}
