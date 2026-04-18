import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon, Add01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { shortDate, parseISO, isPast } from "@/lib/format";
import { logActivity } from "@/lib/activity";
import EmptyState from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";

export default function ClientTasks({ tasks = [], client, onAdd }) {
  const qc = useQueryClient();
  const open = tasks.filter(t => !t.completed);
  const done = tasks.filter(t => t.completed);

  const complete = async (task) => {
    qc.setQueryData(["tasks"], (old = []) => old.map(t => t.id === task.id ? { ...t, completed: true, completed_at: new Date().toISOString() } : t));
    await base44.entities.Task.update(task.id, { completed: true, completed_at: new Date().toISOString() });
    await logActivity({ client_id: client.id, type: "task_completed", content: `Completed: ${task.title}` });
    qc.invalidateQueries({ queryKey: ["tasks"] });
    qc.invalidateQueries({ queryKey: ["activities"] });
  };

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl bg-cream border border-hair">
        <EmptyState icon={CheckmarkCircle02Icon} title="No tasks yet." description="What's the next step with this client?" actionLabel="Add first task" onAction={onAdd} compact />
      </div>
    );
  }

  const Row = ({ task }) => {
    const overdue = !task.completed && task.due_date && isPast(parseISO(task.due_date)) && new Date(task.due_date).toDateString() !== new Date().toDateString();
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -8 }}
        className={cn("flex items-center gap-3 py-3 px-4 rounded-xl border border-transparent hover:bg-white hover:border-hair transition",
          overdue && "bg-[#f0e4e2]/40"
        )}
      >
        <button
          onClick={() => !task.completed && complete(task)}
          className={cn("w-5 h-5 rounded-md border flex items-center justify-center shrink-0",
            task.completed ? "bg-ink border-ink" : "border-border hover:border-ink")}
        >
          {task.completed && <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-3 h-3 text-white" strokeWidth={3} />}
        </button>
        <div className="flex-1 min-w-0 text-sm">
          <div className={cn(task.completed && "line-through text-soft")}>{task.title}</div>
        </div>
        {task.due_date && (
          <div className={cn("text-xs", overdue ? "text-danger font-medium" : "text-soft")}>
            {shortDate(task.due_date)}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-[11px] uppercase tracking-[0.15em] text-soft">Open · {open.length}</div>
        <Button onClick={onAdd} variant="outline" size="sm" className="rounded-full h-8 bg-white border-hair">
          <HugeiconsIcon icon={Add01Icon} className="w-3 h-3 mr-1" /> New task
        </Button>
      </div>
      <div className="rounded-2xl bg-white border border-hair p-2">
        <AnimatePresence><>{open.map(t => <Row key={t.id} task={t} />)}</></AnimatePresence>
        {open.length === 0 && <div className="text-sm text-soft text-center py-6">All caught up.</div>}
      </div>
      {done.length > 0 && (
        <>
          <div className="text-[11px] uppercase tracking-[0.15em] text-soft mt-6">Completed · {done.length}</div>
          <div className="rounded-2xl bg-whisper border border-hair p-2 opacity-70">
            {done.slice(0, 10).map(t => <Row key={t.id} task={t} />)}
          </div>
        </>
      )}
    </div>
  );
}