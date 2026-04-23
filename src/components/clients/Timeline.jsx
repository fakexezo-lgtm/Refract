import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Note02Icon, CheckmarkCircle02Icon, DashboardSquareIcon, UserIcon, CircleIcon, CheckmarkSquareIcon, FilterIcon } from "@hugeicons/core-free-icons";
import { timeAgo, timelineGroup } from "@/utils/format";
import EmptyState from "@/components/shared/EmptyState";
import { cn } from "@/utils";

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
  note: "Note Added",
  task_created: "Task Created",
  task_completed: "Task Completed",
  deal_created: "Deal Created",
  deal_stage_changed: "Deal Stage Updated",
  client_created: "Client Added",
};

export default function Timeline({ activities = [], onAddNote }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [filter, setFilter] = React.useState("all");

  if (activities.length === 0) {
    return (
      <div className="text-center py-6">
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
  
  // Filter activities
  const filteredActivities = filter === "all" 
    ? processedActivities 
    : processedActivities.filter(a => a.type === filter);

  const visibleActivities = isExpanded ? filteredActivities : filteredActivities.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-2xl text-ink tracking-tight">Activity Feed</h3>
        <div className="flex items-center gap-2">
          {processedActivities.length > 5 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-medium text-soft hover:text-charcoal px-3 py-1.5 rounded-full border border-hair/60 bg-whisper/80 hover:bg-cream transition-all"
            >
              {isExpanded ? "Show less" : `View all (${processedActivities.length})`}
            </button>
          )}
          <button className="inline-flex items-center gap-1.5 text-xs font-medium text-soft hover:text-ink px-3 py-1.5 rounded-full border border-hair/60 bg-whisper/80 hover:bg-cream transition-all">
            <HugeiconsIcon icon={FilterIcon} className="w-3.5 h-3.5" />
            Filter
          </button>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="relative">
        {/* Timeline main vertical axis */}
        <div className="absolute left-[19px] top-4 bottom-4 w-px bg-hair/20" />

        <div className="space-y-8">
          <AnimatePresence initial={false}>
            {visibleActivities.map((a) => {
              const IconComponent = ICONS[a.type] || CircleIcon;
              const colorClass = COLORS[a.type] || COLORS.default;
              const label = LABELS[a.type] || "Activity";
              
              return (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
                  className="relative pl-14 group"
                >
                  {/* Icon Marker */}
                  <div className={cn(
                    "absolute left-0 top-0 w-10 h-10 rounded-2xl border flex items-center justify-center z-10 transition-transform group-hover:scale-105",
                    colorClass
                  )}>
                    <HugeiconsIcon icon={IconComponent} className="w-4 h-4" strokeWidth={1.75} />
                  </div>

                  <div className="flex flex-col gap-1.5 pt-0.5">
                    {/* Activity Label + Time */}
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold text-ink">
                        {label}
                      </span>
                      <span className="text-xs font-medium text-soft/50 tabular-nums whitespace-nowrap">
                        {timeAgo(a.created_at)}
                      </span>
                    </div>

                    {/* Content */}
                    {a.type === "note" ? (
                      <div className="mt-2 p-4 rounded-2xl bg-cream/60 border border-hair/40 text-sm text-ink leading-relaxed">
                        {a.content}
                      </div>
                    ) : a.type === "deal_stage_changed" ? (
                      <div className="text-sm text-soft leading-relaxed">
                        {(() => {
                          const parts = a.content.split(": ");
                          const dealName = parts[0];
                          const stages = parts[1]?.split(" → ") || [];
                          return (
                            <span>
                              '{dealName}' moved from{" "}
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-whisper border border-hair text-soft">{stages[0]}</span>
                              {" "}to{" "}
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-whisper border border-hair text-ink">{stages[1]}</span>
                            </span>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="text-sm text-soft leading-relaxed">
                        {a.content}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
