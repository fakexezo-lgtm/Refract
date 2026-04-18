import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { StickyNote, CheckSquare, TrendingUp, UserPlus, Circle } from "lucide-react";
import { timeAgo } from "@/lib/format";
import Avatar from "@/components/shared/Avatar";

const ICONS = {
  note: StickyNote,
  task_created: CheckSquare,
  task_completed: CheckSquare,
  deal_created: TrendingUp,
  deal_stage_changed: TrendingUp,
  client_created: UserPlus,
};

export default function ActivityFeed({ activities = [], clients = [], limit = 8 }) {
  const navigate = useNavigate();
  const items = activities.slice(0, limit);

  return (
    <div className="space-y-1">
      {items.map((a, i) => {
        const Icon = ICONS[a.type] || Circle;
        const client = clients.find(c => c.id === a.client_id);
        return (
          <motion.button
            key={a.id}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => client && navigate(`/app/clients/${client.id}`)}
            className="w-full flex items-start gap-3 py-3 px-4 rounded-xl hover:bg-white hover:border-hair border border-transparent transition text-left"
          >
            <div className="w-8 h-8 rounded-full bg-cream border border-hair flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="w-3.5 h-3.5 text-ink" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-ink truncate">{a.content}</div>
              <div className="text-xs text-soft mt-0.5 flex items-center gap-1.5">
                {client && <Avatar name={client.name} color={client.avatar_color} size="xs" />}
                {client && <span>{client.name}</span>}
                <span>·</span>
                <span>{timeAgo(a.created_date)}</span>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}