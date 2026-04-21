import React from "react";
import { motion } from "framer-motion";
import Avatar from "@/components/shared/Avatar";
import StatusBadge from "@/components/shared/StatusBadge";
import { timeAgo } from "@/lib/format";
import { useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { differenceInDays, parseISO } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

export default function ClientRow({ client, nextTask, isSelectMode, isSelected, onSelectChange }) {
  const navigate = useNavigate();
  const isStale = client.last_contacted_at && differenceInDays(new Date(), parseISO(client.last_contacted_at)) >= 5;
  
  const handleMainClick = () => {
    if (isSelectMode) {
      onSelectChange(!isSelected);
    } else {
      navigate(`/app/clients/${client.id}`);
    }
  };

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      onClick={handleMainClick}
      className={cn(
        "group w-full flex items-center gap-4 p-4 md:p-5 rounded-2xl bg-white border transition text-left",
        isSelected ? "border-charcoal ring-1 ring-charcoal" : "border-hair hover:border-ink/30 hover:shadow-sm"
      )}
    >
      {isSelectMode && (
        <div className="shrink-0 mr-1" onClick={(e) => e.stopPropagation()}>
          <Checkbox 
            checked={isSelected} 
            onCheckedChange={onSelectChange}
            className="w-5 h-5 rounded-md"
          />
        </div>
      )}
      <Avatar name={client.name} color={client.avatar_color} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="font-medium text-ink truncate">{client.name}</div>
          {client.company && <div className="text-sm text-soft truncate">· {client.company}</div>}
        </div>
        <div className="text-[11px] mt-1 space-y-0.5 min-w-0">
          <div className={cn(
            "flex items-center gap-1.5",
            isStale ? "text-red-500 font-semibold" : "text-soft"
          )}>
            {client.last_contacted_at ? `Last contacted ${timeAgo(client.last_contacted_at)}` : "No contact yet"}
          </div>
          {nextTask && (
            <div className="flex items-center gap-1.5 text-ink truncate font-medium">
              <span className="text-[10px] uppercase tracking-wider text-soft font-black px-1 border border-hair rounded">Next</span>
              <span className="truncate">{nextTask.title}</span>
            </div>
          )}
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-3 shrink-0">
        <StatusBadge status={client.status} />
        {!isSelectMode && <HugeiconsIcon icon={ArrowUpRight01Icon} className="w-4 h-4 text-soft group-hover:text-ink transition" />}
      </div>
    </motion.button>
  );
}