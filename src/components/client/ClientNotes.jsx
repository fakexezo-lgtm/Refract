// @ts-nocheck
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Note02Icon, Add01Icon, Edit01Icon, Delete03Icon, UserIcon, CheckmarkSquareIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { apiRoutes } from "@/lib/apiRoutes";
import { useQueryClient } from "@tanstack/react-query";
import { timeAgo } from "@/lib/format";
import EmptyState from "@/components/shared/EmptyState";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons";

export default function ClientNotes({ notes = [], client, onAdd, onEdit }) {
  const qc = useQueryClient();

  const handleDelete = async (noteId) => {
    if (!window.confirm("Are you sure? This note will be gone forever.")) return;
    try {
      await apiRoutes.deleteNote(noteId);
      qc.invalidateQueries({ queryKey: ["clientFull", client.id] });
      toast.success("Note deleted");
    } catch (err) {
      toast.error("Failed to delete note");
    }
  };

  if (notes.length === 0) {
    return (
      <div className="rounded-2xl bg-cream border border-hair">
        <EmptyState 
          icon={Note02Icon} 
          title="No notes yet." 
          description="Capture thoughts, list requirements, or save useful links." 
          actionLabel="Add first note" 
          onAction={onAdd} 
          compact 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
        <h3 className="font-serif text-2xl text-ink tracking-tight">Client Notes</h3>
        <Button 
          onClick={onAdd} 
          variant="outline" 
          size="sm" 
          className="rounded-full h-9 bg-white border-hair/60 hover:bg-cream transition-all gap-1.5"
        >
          <HugeiconsIcon icon={Add01Icon} className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold text-ink">New note</span>
        </Button>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {notes.map(note => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 2 }}
              transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
              className="group relative p-6 rounded-3xl bg-white border border-hair/60 hover:border-ink/20 transition-all"
            >
              <div className="flex justify-between items-start gap-4 mb-3">
                <div className="text-[10px] font-medium uppercase tracking-wide text-soft/40">
                  {timeAgo(note.created_at)}
                </div>
                <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 rounded-lg hover:bg-cream text-soft hover:text-ink transition-colors focus:outline-none">
                        <HugeiconsIcon icon={MoreHorizontalIcon} className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32 bg-white border-hair rounded-xl">
                      <DropdownMenuItem 
                        onClick={() => onEdit(note)}
                        className="cursor-pointer hover:bg-cream transition-colors"
                      >
                        <HugeiconsIcon icon={Edit01Icon} className="w-4 h-4 mr-2 text-soft" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(note.id)}
                        className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 transition-colors"
                      >
                        <HugeiconsIcon icon={Delete03Icon} className="w-4 h-4 mr-2" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="text-ink text-sm leading-relaxed whitespace-pre-wrap">
                {note.content}
              </div>

              {/* Decorative hints for Rich content if detected */}
              {(note.content.includes("http") || note.content.includes("- ")) && (
                <div className="mt-4 pt-4 border-t border-hair/50 flex gap-3">
                  {note.content.includes("http") && (
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-soft bg-whisper/80 px-2 py-1 rounded-full">
                      <HugeiconsIcon icon={UserIcon} className="w-3 h-3" />
                      Contains links
                    </div>
                  )}
                  {note.content.includes("- ") && (
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-soft bg-whisper/80 px-2 py-1 rounded-full">
                      <HugeiconsIcon icon={CheckmarkSquareIcon} className="w-3 h-3" />
                      Contains list
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
