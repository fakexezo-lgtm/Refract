import React, { useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon, Add01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { shortDate, parseISO, isPast } from "@/lib/format";
import { logActivity } from "@/lib/activity";
import EmptyState from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";

const Section = ({ title, tasks, client, onComplete, color }) => {
    if (tasks.length === 0) return null;
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
                <div className={cn("w-1 h-3 rounded-full", color)} />
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">{title} · {tasks.length}</div>
            </div>
            <div className="rounded-2xl bg-white border border-hair p-2">
                <AnimatePresence>
                    {tasks.map(t => (
                        <div key={t.id} className="group flex items-center gap-4 py-3 px-3 hover:bg-whisper/50 rounded-xl transition-all">
                             <button
                                onClick={() => !t.completed && onComplete(t)}
                                className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                                    t.completed ? "bg-ink border-ink" : "border-hair group-hover:border-ink")}
                            >
                                {t.completed && <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-3 h-3 text-white" strokeWidth={3} />}
                            </button>
                            <div className="flex-1 min-w-0">
                                <div className={cn("text-sm font-medium", t.completed ? "line-through text-soft" : "text-ink")}>{t.title}</div>
                                {t.due_date && (
                                    <div className={cn("text-[10px] font-bold mt-0.5", color === "bg-red-500" ? "text-red-500" : "text-soft")}>
                                        {shortDate(t.due_date)}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default function ClientTasks({ tasks = [], client, onAdd }) {
  const qc = useQueryClient();
  
  const categories = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    
    return {
        overdue: tasks.filter(t => !t.completed && t.due_date && isPast(parseISO(t.due_date)) && new Date(t.due_date).toDateString() !== todayStr),
        today: tasks.filter(t => !t.completed && t.due_date && new Date(t.due_date).toDateString() === todayStr),
        upcoming: tasks.filter(t => !t.completed && (!t.due_date || (!isPast(parseISO(t.due_date)) && new Date(t.due_date).toDateString() !== todayStr))),
        completed: tasks.filter(t => t.completed).slice(0, 5)
    };
  }, [tasks]);

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

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-sm font-bold text-ink">Action Items</h3>
        <Button onClick={onAdd} variant="outline" size="sm" className="rounded-full h-9 bg-white border-hair shadow-sm hover:bg-whisper transition-all gap-1.5">
          <HugeiconsIcon icon={Add01Icon} className="w-3.5 h-3.5" /> 
          <span className="text-xs font-bold text-ink">New task</span>
        </Button>
      </div>

      <div className="space-y-8">
          <Section title="Overdue" tasks={categories.overdue} client={client} onComplete={complete} color="bg-red-500" />
          <Section title="Due Today" tasks={categories.today} client={client} onComplete={complete} color="bg-ink" />
          <Section title="Upcoming" tasks={categories.upcoming} client={client} onComplete={complete} color="bg-hair" />
          
          {categories.completed.length > 0 && (
              <div className="opacity-60 pt-4 grayscale">
                  <Section title="Recently Completed" tasks={categories.completed} client={client} onComplete={complete} color="bg-soft" />
              </div>
          )}
      </div>

      {tasks.filter(t => !t.completed).length === 0 && (
          <div className="text-center py-10 bg-whisper/30 rounded-3xl border border-dashed border-hair">
              <p className="text-xs font-bold text-soft italic">“All action items are clear for now.”</p>
          </div>
      )}
    </div>
  );
}