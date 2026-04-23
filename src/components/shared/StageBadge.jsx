import React from "react";
import { STAGES } from "@/constants";
import { cn } from "@/utils";

export default function StageBadge({ stage, className }) {
  const s = STAGES.find(s => s.id === stage) || STAGES[0];
  return (
    <span className={cn("inline-flex px-2.5 py-1 rounded-full text-xs font-medium border", s.tone, className)}>
      {s.label}
    </span>
  );
}
