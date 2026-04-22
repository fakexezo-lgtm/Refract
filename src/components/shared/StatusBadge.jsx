import React from "react";
import { cn } from "@/lib/utils";

const MAP = {
  lead: { label: "Lead", cls: "bg-whisper text-ink" },
  active: { label: "Active", cls: "bg-[#e4ecdf] text-ink" },
  inactive: { label: "Inactive", cls: "bg-[#efeadf] text-ink" },
};

export default function StatusBadge({ status = "lead", className = "" }) {
  const m = MAP[status] || MAP.lead;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-hair", m.cls, className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {m.label}
    </span>
  );
}