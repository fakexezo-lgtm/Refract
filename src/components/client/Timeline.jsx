import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Note02Icon, CheckmarkCircle02Icon, TrendingUp, UserAdd01Icon, RecordIcon, CheckmarkSquareIcon } from "@hugeicons/core-free-icons";
import { timeAgo, timelineGroup } from "@/lib/format";
import EmptyState from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";

const ICONS = {
  note: Note02Icon,
  task_created: CheckmarkSquareIcon,
  task_completed: CheckmarkCircle02Icon,
  deal_created: TrendingUp,
  deal_stage_changed: TrendingUp,
  client_created: UserAdd01Icon,
  default: RecordIcon,
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
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (activities.length === 0) {
    return (
      <div className="rounded-2xl bg-cream border border-hair">
        <EmptyState
          icon={Note02Icon}
          title="Nothing here yet."
          description="The timeline is the relationship's story. Start with a note."
          actionLabel="Add first note"
          onAction={onAddNote}
          compact
        />
      </div>
    );
  }

  const processActivities = (list) => {
    const result = [];
    let currentDealGroup = null;

    list.forEach((a, i) => {
      if (a.type === "deal_stage_changed") {
        const dealId = a.metadata?.deal_id;
        const dealTitle = a.content.split(":")[0];
        
        if (!currentDealGroup || currentDealGroup.metadata?.deal_id !== dealId) {
          currentDealGroup = { 
            ...a, 
            originalFrom: a.metadata?.from_label || a.metadata?.from || "Start",
            dealTitle: dealTitle
          };
          result.push(currentDealGroup);
        }
        
        const latestTo = a.metadata?.to_label || a.metadata?.to || "Current";
        currentDealGroup.content = `${currentDealGroup.dealTitle}: ${currentDealGroup.originalFrom} → ${latestTo}`;
      } else {
        currentDealGroup = null;
        result.push(a);
      }
    });
    return result;
  };

  const processedActivities = processActivities(activities);
  const visibleActivities = isExpanded ? processedActivities : processedActivities.slice(0, 3);

  const groups = {};
  visibleActivities.forEach(a => {
    const g = timelineGroup(a.created_at);
    if (!groups[g]) groups[g] = [];
    groups[g].push(a);
  });
  const order = ["Today", "Yesterday", "This week", "Earlier"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-ink">Recent History</h3>
        {processedActivities.length > 3 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-bold text-soft hover:text-charcoal flex items-center gap-1 transition-colors"
          >
            {isExpanded ? "Show less" : `View all history (${processedActivities.length})`}
          </button>
        )}
      </div>

      <div className="space-y-8">
        {order.filter(g => groups[g]).map(group => (
          <div key={group} className="relative">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-soft/30 mb-4 px-1">{group}</div>
            <div className="relative pl-7">
              <div className="absolute left-[11.5px] top-2 bottom-0 w-px bg-hair/50" />
              <AnimatePresence initial={false}>
                {groups[group].map((a, i) => {
                  const IconComponent = ICONS[a.type] || RecordIcon;
                  return (
                    <motion.div
                      key={a.id}
                      layout
                      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                      className="relative pb-8 last:pb-2"
                    >
                      <div className={cn(
                        "absolute -left-[27.5px] top-0 w-6 h-6 rounded-full bg-white border flex items-center justify-center z-10 shadow-sm",
                        a.type === "deal_stage_changed" ? "border-charcoal/20 bg-whisper" : "border-hair"
                      )}>
                        <HugeiconsIcon icon={IconComponent} className="w-3 h-3 text-ink" strokeWidth={2.5} />
                      </div>
                      <div className="flex items-baseline justify-between gap-4">
                        <div className="flex-1">
                          <div className="text-[10px] font-black uppercase tracking-widest text-soft/40 mb-1">{LABELS[a.type] || "Activity"}</div>
                          <div className={cn(
                            "text-sm leading-relaxed",
                            a.type === "deal_stage_changed" ? "text-ink font-bold" : "text-ink"
                          )}>
                            {a.content}
                          </div>
                        </div>
                        <div className="text-[10px] font-bold text-soft/40 shrink-0 tabular-nums">{timeAgo(a.created_at)}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}