import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Note02Icon, CheckmarkCircle02Icon, DashboardSquareIcon, UserIcon, CircleIcon, CheckmarkSquareIcon } from "@hugeicons/core-free-icons";
import { timeAgo, timelineGroup } from "@/lib/format";
import EmptyState from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";

const ICONS = {
  note: Note02Icon,
  task_created: CheckmarkSquareIcon,
  task_completed: CheckmarkCircle02Icon,
  deal_created: DashboardSquareIcon,
  deal_stage_changed: DashboardSquareIcon,
  client_created: UserIcon,
  client_updated: UserIcon,
  default: CircleIcon,
};

const COLORS = {
  note: "bg-blue-50/70 text-blue-600/80 border-blue-100/60",
  task_created: "bg-orange-50/70 text-orange-600/80 border-orange-100/60",
  task_completed: "bg-green-50/70 text-green-600/80 border-green-100/60",
  deal_created: "bg-purple-50/70 text-purple-600/80 border-purple-100/60",
  deal_stage_changed: "bg-indigo-50/70 text-indigo-600/80 border-indigo-100/60",
  client_created: "bg-ink/90 text-white border-ink/80",
  default: "bg-whisper text-soft border-hair/60",
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
      <div className="rounded-2xl bg-cream border border-hair p-8 text-center">
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
      // Grouping consecutive stage changes for same deal
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
  const visibleActivities = isExpanded ? processedActivities : processedActivities.slice(0, 5);

  const groups = {};
  visibleActivities.forEach(a => {
    const g = timelineGroup(a.created_at);
    if (!groups[g]) groups[g] = [];
    groups[g].push(a);
  });
  const order = ["Today", "Yesterday", "This week", "Earlier"];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-serif text-2xl text-ink tracking-tight">Recent Activity</h3>
        {processedActivities.length > 5 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-medium text-soft hover:text-charcoal px-3 py-1 rounded-full border border-hair/60 bg-white/80 transition-all"
          >
            {isExpanded ? "Show less" : `View full history (${processedActivities.length})`}
          </button>
        )}
      </div>

      <div className="relative">
        {/* Timeline main vertical axis */}
        <div className="absolute left-[19px] top-4 bottom-4 w-px bg-hair/20" />

        <div className="space-y-10">
          {order.filter(g => groups[g]).map(group => (
            <div key={group} className="relative">
              <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-soft/40 mb-8 pl-12">{group}</div>
              <div className="space-y-10">
                <AnimatePresence initial={false}>
                  {groups[group].map((a, i) => {
                    const IconComponent = ICONS[a.type] || CircleIcon;
                    const colorClass = COLORS[a.type] || COLORS.default;
                    return (
                      <motion.div
                        key={a.id}
                        layout
                        initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
                        className="relative pl-12 group"
                      >
                        {/* The logic for the marker bubble */}
                        <div className={cn(
                          "absolute left-0 top-0 w-9 h-9 rounded-2xl border flex items-center justify-center z-10 transition-transform group-hover:scale-105",
                          colorClass
                        )}>
                          <HugeiconsIcon icon={IconComponent} className="w-4 h-4" strokeWidth={1.75} />
                        </div>

                        <div className="flex flex-col gap-1.5 pt-0.5">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-soft/50">
                              {LABELS[a.type] || "Activity"}
                            </span>
                            <span className="text-[10px] font-medium text-soft/30 tabular-nums">
                              {timeAgo(a.created_at)}
                            </span>
                          </div>
                          <div className={cn(
                            "text-[15px] font-medium leading-relaxed tracking-tight break-words",
                            a.type === "deal_stage_changed" ? "text-ink font-semibold" : "text-ink"
                          )}>
                            {a.content}
                          </div>
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
    </div>
  );
}