import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Note02Icon, CheckmarkSquareIcon, TrendingUp, UserAdd01Icon, CircleIcon } from "@hugeicons/core-free-icons";

import { timeAgo } from "@/lib/format";
import Avatar from "@/components/shared/Avatar";

const ICONS = {
  note: Note02Icon,
  task_created: CheckmarkSquareIcon,
  task_completed: CheckmarkSquareIcon,
  deal_created: TrendingUp,
  deal_stage_changed: TrendingUp,
  client_created: UserAdd01Icon,
};

export default function ActivityFeed({ activities = [], clients = [], limit = 8 }) {
  const navigate = useNavigate();
  const items = activities.slice(0, limit);

  return (
    <div className="space-y-1">
      {items.map((a, i) => {
        const icon = ICONS[a.type] || CircleIcon;
        const client = clients.find(c => c.id === a.client_id);
        return (
          <motion.button
            key={a.id}
            initial={{ opacity: 0, y: 8 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
            onClick={() => client && navigate(`/app/clients/${client.id}`)}
            className="w-full flex items-start gap-4 py-3.5 px-4 rounded-2xl hover:bg-white hover:border-hair border border-transparent transition-all duration-300 text-left active:scale-[0.99]"
          >
            <div className="w-9 h-9 rounded-full bg-white border border-hair flex items-center justify-center shrink-0 mt-0.5 shadow-sm group-hover:border-charcoal/10">
              <HugeiconsIcon icon={icon} className="w-4 h-4 text-charcoal/80" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-ink leading-snug line-clamp-1">{a.content}</div>
              <div className="text-[11px] text-soft mt-1 flex items-center gap-2 font-medium opacity-80">
                {client && (
                  <div className="flex items-center gap-1.5 bg-hair/30 px-1.5 py-0.5 rounded-md">
                    <Avatar name={client.name} color={client.avatar_color} size="xs" />
                    <span className="truncate max-w-[80px]">{client.name}</span>
                  </div>
                )}
                <span className="opacity-40">·</span>
                <span className="whitespace-nowrap">{timeAgo(a.created_at)}</span>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}