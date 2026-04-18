import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StickyNote, CheckSquare, TrendingUp, UserPlus, Circle } from "lucide-react";
import { timeAgo, timelineGroup } from "@/lib/format";
import EmptyState from "@/components/shared/EmptyState";

const ICONS = {
  note: StickyNote,
  task_created: CheckSquare,
  task_completed: CheckSquare,
  deal_created: TrendingUp,
  deal_stage_changed: TrendingUp,
  client_created: UserPlus,
};

const LABELS = {
  note: "Note",
  task_created: "Task added",
  task_completed: "Task completed",
  deal_created: "Deal added",
  deal_stage_changed: "Stage changed",
  client_created: "Client added",
};

export default function Timeline({ activities = [], onAddNote }) {
  if (activities.length === 0) {
    return (
      <div className="rounded-2xl bg-cream border border-hair">
        <EmptyState
          icon={StickyNote}
          title="Nothing here yet."
          description="The timeline is the relationship's story. Start with a note."
          actionLabel="Add first note"
          onAction={onAddNote}
          compact
        />
      </div>
    );
  }

  // Group by time period
  const groups = {};
  activities.forEach(a => {
    const g = timelineGroup(a.created_date);
    if (!groups[g]) groups[g] = [];
    groups[g].push(a);
  });
  const order = ["Today", "Yesterday", "This week", "Earlier"];

  return (
    <div className="space-y-8">
      {order.filter(g => groups[g]).map(group => (
        <div key={group}>
          <div className="text-[11px] uppercase tracking-[0.15em] text-soft mb-3">{group}</div>
          <div className="relative pl-6">
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
            <AnimatePresence initial={false}>
              {groups[group].map((a, i) => {
                const Icon = ICONS[a.type] || Circle;
                return (
                  <motion.div
                    key={a.id}
                    layout
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.03 }}
                    className="relative pb-4"
                  >
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border border-hair flex items-center justify-center">
                      <Icon className="w-2.5 h-2.5 text-ink" strokeWidth={2} />
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-[11px] uppercase tracking-wider text-soft">{LABELS[a.type] || "Activity"}</div>
                        <div className="text-sm text-ink mt-0.5 whitespace-pre-wrap break-words">{a.content}</div>
                      </div>
                      <div className="text-xs text-soft shrink-0">{timeAgo(a.created_date)}</div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
}