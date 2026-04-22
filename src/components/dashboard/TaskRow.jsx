// @ts-nocheck
import React, { useState, useRef, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "@/lib/apiRoutes";
import { logActivity } from "@/lib/activity";
import { shortDate, parseISO, isPast } from "@/lib/format";
import { HugeiconsIcon } from "@hugeicons/react";
import { MoreVerticalIcon, Edit01Icon, Delete03Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default memo(function TaskRow({ task, client = null, emphasizeOverdue = false, taskIndex = 0, onEdit = null, onComplete = null }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // LOCAL STATE is the authoritative source for the checkbox.
  // Initialized from task.completed, and we keep it in sync with props to handle bucket moves
  const [localCompleted, setLocalCompleted] = useState(!!task.completed);
  
  useEffect(() => {
    if (task.completed) setLocalCompleted(true);
  }, [task.completed]);

  const overdue =
    task.due_date &&
    isPast(parseISO(task.due_date)) &&
    !localCompleted &&
    new Date(task.due_date).toDateString() !== new Date().toDateString();

  useEffect(() => {
    const handle = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handle);
      return () => document.removeEventListener("mousedown", handle);
    }
  }, [menuOpen]);

  // Update the React Query cache for ALL task-related keys
  const patchCaches = (patch) => {
    const apply = (old = []) => {
      if (!Array.isArray(old)) return old;
      return old.map((t) => (t.id === task.id ? { ...t, ...patch } : t));
    };
    qc.setQueryData(["tasks"], apply);
    if (task.client_id) qc.setQueryData(["tasks", task.client_id], apply);
  };

  const toggle = async () => {
    // Guard: already done, never allow reversal
    if (localCompleted) return;

    // 1. Lock the UI immediately
    setLocalCompleted(true);

    // 2. If parent provided a robust handler, use it
    if (onComplete) {
      onComplete(task.id, task.title, task.client_id);
      return;
    }

    // fallback for other views
    patchCaches({ completed: true });
    apiRoutes.updateTask(task.id, { completed: true })
      .then(() => {
        toast.success(`"${task.title}" completed`);
        if (task.client_id) {
          logActivity({ client_id: task.client_id, type: "task_completed", content: `Completed: ${task.title}`, metadata: {} }).catch(() => {});
        }
        qc.invalidateQueries({ queryKey: ["activities"] });
      })
      .catch(() => {
        // Only revert here if we DON'T have an onComplete handler
        // toast.error("Failed to sync completion");
      });
  };

  // --- Delete ---
  const deletedRef = useRef(false);
  const handleDelete = async (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    if (deletedRef.current) return;
    deletedRef.current = true;

    const snap = { ...task };
    const removeFromCache = (old = []) =>
      Array.isArray(old) ? old.filter((t) => t.id !== task.id) : old;
    qc.setQueryData(["tasks"], removeFromCache);
    if (task.client_id) qc.setQueryData(["tasks", task.client_id], removeFromCache);

    toast.success(`"${task.title}" deleted`, {
      duration: 5000,
      action: {
        label: "Undo",
        onClick: () => {
          deletedRef.current = false;
          const restore = (old = []) => (Array.isArray(old) ? [...old, snap] : old);
          qc.setQueryData(["tasks"], restore);
          if (task.client_id) qc.setQueryData(["tasks", task.client_id], restore);
        },
      },
    });

    setTimeout(async () => {
      if (!deletedRef.current) return;
      try {
        await apiRoutes.deleteTask(task.id);
        if (task.client_id) {
          logActivity({ client_id: task.client_id, type: "task_deleted", content: `Deleted: ${task.title}`, metadata: {} }).catch(() => {});
        }
        qc.invalidateQueries({ queryKey: ["tasks"] });
        qc.invalidateQueries({ queryKey: ["activities"] });
      } catch (err) {
        deletedRef.current = false;
        const restore = (old = []) => (Array.isArray(old) ? [...old, snap] : old);
        qc.setQueryData(["tasks"], restore);
        if (task.client_id) qc.setQueryData(["tasks", task.client_id], restore);
        toast.error(err?.message || "Unable to delete task.");
      }
    }, 5000);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (onEdit) onEdit(task);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      data-task-index={taskIndex}
      onClick={() => client && navigate(`/app/clients/${client.id}`)}
      style={{ touchAction: "manipulation" }}
      className={cn(
        "group flex items-center gap-4 py-3.5 px-5 rounded-2xl cursor-pointer transition-all duration-300 bg-white border border-hair hover:border-charcoal/10 hover:shadow-sm active:scale-[0.99]",
        emphasizeOverdue && overdue && "bg-danger/[0.03] border-danger/10",
        localCompleted && "opacity-60 bg-whisper/50"
      )}
    >
      {/* Plain controlled button — no Radix/third-party state machine */}
      <div
        className="shrink-0 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={toggle}
          disabled={localCompleted}
          aria-label={localCompleted ? "Completed" : "Mark complete"}
          className={cn(
            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 shrink-0 focus:outline-none active:scale-75",
            localCompleted
              ? "bg-charcoal border-charcoal cursor-default shadow-inner"
              : "border-hair hover:border-charcoal bg-white cursor-pointer hover:shadow-sm"
          )}
        >
          {localCompleted && (
            <HugeiconsIcon icon={Tick01Icon} className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          )}
        </button>
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <div className={cn("text-sm truncate", localCompleted && "line-through text-soft")}>
          {task.title}
        </div>
        {client && <div className="text-xs text-soft truncate">{client.name}</div>}
      </div>

      {/* Due date */}
      {task.due_date && (
        <div className={cn("text-xs shrink-0", overdue ? "text-danger font-medium" : "text-soft")}>
          {overdue ? "Overdue · " : ""}
          {shortDate(task.due_date)}
        </div>
      )}

      {/* Actions menu — hidden for completed tasks */}
      {!localCompleted && (
        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded-md opacity-100 lg:opacity-0 group-hover:opacity-100 hover:bg-hair transition-all"
                title="More actions"
              >
                <HugeiconsIcon icon={MoreVerticalIcon} className="w-4 h-4 text-soft" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 bg-white border-hair rounded-xl">
              {onEdit && (
                <DropdownMenuItem
                  onClick={handleEdit}
                  className="cursor-pointer hover:bg-cream transition-colors"
                >
                  <HugeiconsIcon icon={Edit01Icon} className="w-4 h-4 mr-2 text-soft" />
                  <span>Edit</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleDelete}
                className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 transition-colors"
              >
                <HugeiconsIcon icon={Delete03Icon} className="w-4 h-4 mr-2" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </motion.div>
  );
});