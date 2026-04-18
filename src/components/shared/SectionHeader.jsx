import React from "react";

export default function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        {eyebrow && <div className="text-[11px] uppercase tracking-[0.15em] text-soft mb-1.5">{eyebrow}</div>}
        <h2 className="font-serif text-2xl text-ink">{title}</h2>
      </div>
      {action}
    </div>
  );
}