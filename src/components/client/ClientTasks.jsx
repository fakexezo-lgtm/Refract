import React, { useMemo } from "react";
import TaskRow from "@/components/dashboard/TaskRow";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { parseISO, isPast } from "@/lib/format";
import { AnimatePresence } from "framer-motion";
import EmptyState from "@/components/shared/EmptyState";

const Section = ({ title, tasks, client, color }) => {
  if (tasks.length === 0) return null;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <div className={cn("w-1.5 h-4 rounded-full", color)} />
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">
          {title} · {tasks.length}
        </h4>
      </div>
      <div className="grid gap-2">
        <AnimatePresence>
          {tasks.map((t) => (
            <TaskRow 
              key={t.id} 
              task={t} 
              client={client} 
              emphasizeOverdue={title === "Overdue"}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function ClientTasks({ tasks = [], client, onAdd }) {
  const categories = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    return {
      overdue: tasks.filter(
        (t) =>
          !t.completed &&
          t.due_date &&
          isPast(parseISO(t.due_date)) &&
          new Date(t.due_date).toDateString() !== todayStr
      ),
      today: tasks.filter(
        (t) => !t.completed && t.due_date && new Date(t.due_date).toDateString() === todayStr
      ),
      upcoming: tasks.filter(
        (t) =>
          !t.completed &&
          (!t.due_date ||
            (!isPast(parseISO(t.due_date)) && new Date(t.due_date).toDateString() !== todayStr))
      ),
      completed: tasks.filter((t) => t.completed),
    };
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl bg-cream border border-hair p-8 text-center">
        <EmptyState
          icon={CheckmarkCircle02Icon}
          title="No tasks yet."
          description="What's the next step with this client?"
          actionLabel="Add first task"
          onAction={onAdd}
          compact
        />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-sm font-black uppercase tracking-[0.15em] text-ink">Action Items</h3>
        <Button
          onClick={onAdd}
          variant="outline"
          size="sm"
          className="rounded-full h-9 bg-white border-hair shadow-sm hover:bg-whisper transition-all gap-1.5"
        >
          <HugeiconsIcon icon={Add01Icon} className="w-3.5 h-3.5" />
          <span className="text-xs font-bold text-ink">New task</span>
        </Button>
      </div>

      <div className="space-y-12">
        <Section title="Overdue" tasks={categories.overdue} client={client} color="bg-red-500" />
        <Section title="Due Today" tasks={categories.today} client={client} color="bg-ink" />
        <Section title="Upcoming" tasks={categories.upcoming} client={client} color="bg-hair" />

        {categories.completed.length > 0 && (
          <div className="pt-4">
            <Section
              title="Completed"
              tasks={categories.completed}
              client={client}
              color="bg-soft/30"
            />
          </div>
        )}
      </div>

      {tasks.filter((t) => !t.completed).length === 0 && (
        <div className="text-center py-12 bg-cream/30 rounded-3xl border border-dashed border-hair/50">
          <p className="text-sm font-medium text-soft italic tracking-tight">"All action items are clear for now."</p>
        </div>
      )}
    </div>
  );
}