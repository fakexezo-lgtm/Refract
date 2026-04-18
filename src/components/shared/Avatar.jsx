import React from "react";
import { initialsOf, pickAvatarColor } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function Avatar({ name = "", color, size = "md", className }) {
  const bg = color || pickAvatarColor(name);
  const sizes = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
    xl: "w-20 h-20 text-xl"
  };
  return (
    <div
      className={cn("rounded-full flex items-center justify-center font-medium text-white shrink-0 shadow-sm", sizes[size], className)}
      style={{ backgroundColor: bg }}
    >
      {initialsOf(name)}
    </div>
  );
}