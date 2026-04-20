// @ts-nocheck
import React, { useState, useRef, useEffect } from "react";
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

export default function TaskRow({ task, client = null, emphasizeOverdue = false, taskIndex = 0, onEdit = null }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // LOCAL STATE is the authoritative source for the checkbox.
  // Initialized once from task.completed, NEVER re-synced from props.
  // This makes completions immune to background refetches/cache invalidations.
  const [localCompleted, setLocalCompleted] = useState(!!task.completed);

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

    // 1. Lock the UI immediately (local state — immune to cache changes)
    setLocalCompleted(true);

    // 2. Update the cache so the task moves to the Completed bucket in the UI
    //    Only send `completed: true` — do NOT send completed_at because
    //    that column may not exist in the database and would cause an API error.
    patchCaches({ completed: true });

    // 3. Persist to the server — fire and forget pattern:
    //    We do NOT revert on error because the user's intent was clear.
    //    If it fails, they'll see an error toast but the task stays marked done
    //    (they can refresh if needed). This prevents the frustrating flicker-revert.
    apiRoutes.updateTask(task.id, { completed: true })
      .then(() => {
        toast.success(`"${task.title}" completed`, { duration: 3000 });
        if (task.client_id) {
          logActivity({
            client_id: task.client_id,
            type: "task_completed",
            content: `Completed: ${task.title}`,
            metadata: {},
          }).catch(() => {});
        }
        qc.invalidateQueries({ queryKey: ["activities"] });
      })
      .catch((err) => {
        // Log for debugging — but do NOT revert the UI (prevents the flicker)
        console.error("[TaskRow] updateTask failed:", err?.message, err);
        toast.error(`Save failed: ${err?.message || "Unknown error"}. Refresh to sync.`);
        // Note: we intentionally do NOT revert localCompleted or patchCaches here.
        // The user marked it done; we trust their intent over a transient API error.
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
      animate={{ opacity: localCompleted ? 0.6 : 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      data-task-index={taskIndex}
      onClick={() => client && navigate(`/app/clients/${client.id}`)}
      whileHover={{ y: -2 }}
      className={cn(
        "group flex items-center gap-3 py-3 px-4 rounded-xl cursor-pointer transition-all duration-200 bg-white border border-hair",
        "hover:bg-white hover:shadow-sm",
        emphasizeOverdue && overdue && "bg-[#f0e4e2]/40 hover:bg-[#f0e4e2]/70",
        localCompleted && "opacity-60"
      )}
    >
      {/* Plain controlled button — no Radix/third-party state machine */}
      <div
        className="shrink-0 flex items-center justify-center p-1 -m-1"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={toggle}
          disabled={localCompleted}
          aria-label={localCompleted ? "Completed" : "Mark complete"}
          className={cn(
            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 shrink-0 focus:outline-none",
            localCompleted
              ? "bg-charcoal border-charcoal cursor-default"
              : "border-hair hover:border-charcoal bg-white cursor-pointer"
          )}
        >
          {localCompleted && (
            <HugeiconsIcon icon={Tick01Icon} className="w-3 h-3 text-white" strokeWidth={3} />
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
        <div className="relative" ref={menuRef}>
          <motion.button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-hair transition-all"
            title="More actions"
          >
            <HugeiconsIcon icon={MoreVerticalIcon} className="w-4 h-4 text-soft" />
          </motion.button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-hair bg-white shadow-lg z-10 overflow-hidden"
              >
                {onEdit && (
                  <button
                    onClick={handleEdit}
                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-cream transition-colors"
                  >
                    <HugeiconsIcon icon={Edit01Icon} className="w-4 h-4 text-soft" />
                    Edit
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-red-50 text-danger transition-colors"
                >
                  <HugeiconsIcon icon={Delete03Icon} className="w-4 h-4" />
                  Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}