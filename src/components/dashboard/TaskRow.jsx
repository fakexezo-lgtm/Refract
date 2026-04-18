import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { logActivity } from "@/lib/activity";
import { shortDate, parseISO, isPast } from "@/lib/format";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon, CircleIcon, Calendar03Icon, AlertCircleIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

export default function TaskRow({ task, client, emphasizeOverdue }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const overdue = task.due_date && isPast(parseISO(task.due_date)) && !task.completed && new Date(task.due_date).toDateString() !== new Date().toDateString();

  const toggle = async (e) => {
    e.stopPropagation();
    // optimistic
    qc.setQueryData(["tasks"], (old = []) =>
      old.map(t => t.id === task.id ? { ...t, completed: true, completed_at: new Date().toISOString() } : t)
    );
    await base44.entities.Task.update(task.id, { completed: true, completed_at: new Date().toISOString() });
    if (client) await logActivity({ client_id: client.id, type: "task_completed", content: `Completed: ${task.title}` });
    qc.invalidateQueries({ queryKey: ["tasks"] });
    qc.invalidateQueries({ queryKey: ["activities"] });
    qc.invalidateQueries({ queryKey: ["clients"] });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.25 }}
      onClick={() => client && navigate(`/app/clients/${client.id}`)}
      className={cn(
        "group flex items-center gap-3 py-3 px-4 rounded-xl cursor-pointer transition border border-transparent",
        "hover:bg-white hover:border-hair",
        emphasizeOverdue && overdue && "bg-[#f0e4e2]/40 hover:bg-[#f0e4e2]/70"
      )}
    >
      <button
        onClick={toggle}
        className={cn(
          "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition",
          task.completed ? "bg-ink border-ink" : "border-border hover:border-ink hover:bg-cream"
        )}
      >
        {task.completed && <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-3 h-3 text-white" strokeWidth={3} />}
      </button>
      <div className="flex-1 min-w-0">
        <div className={cn("text-sm truncate", task.completed && "line-through text-soft")}>{task.title}</div>
        {client && <div className="text-xs text-soft truncate">{client.name}</div>}
      </div>
      {task.due_date && (
        <div className={cn("text-xs shrink-0", overdue ? "text-danger font-medium" : "text-soft")}>
          {overdue ? "Overdue · " : ""}{shortDate(task.due_date)}
        </div>
      )}
    </motion.div>
  );
}