import React from "react";
import { motion } from "framer-motion";
import Avatar from "@/components/shared/Avatar";
import StatusBadge from "@/components/shared/StatusBadge";
import { timeAgo } from "@/lib/format";
import { useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";

export default function ClientRow({ client, nextTask }) {
  const navigate = useNavigate();
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      onClick={() => navigate(`/app/clients/${client.id}`)}
      className="group w-full flex items-center gap-4 p-4 md:p-5 rounded-2xl bg-white border border-hair hover:border-ink/30 hover:shadow-sm transition text-left"
    >
      <Avatar name={client.name} color={client.avatar_color} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="font-medium text-ink truncate">{client.name}</div>
          {client.company && <div className="text-sm text-soft truncate">· {client.company}</div>}
        </div>
        <div className="text-xs text-soft mt-1 truncate">
          {client.last_contacted_at ? `Last contacted ${timeAgo(client.last_contacted_at)}` : "No contact yet"}
          {nextTask && <> · <span className="text-ink">Next: {nextTask.title}</span></>}
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-3 shrink-0">
        <StatusBadge status={client.status} />
        <HugeiconsIcon icon={ArrowUpRight01Icon} className="w-4 h-4 text-soft group-hover:text-ink transition" />
      </div>
    </motion.button>
  );
}