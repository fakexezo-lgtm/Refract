// @ts-nocheck
import React from "react";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";

export default function EmptyState({ icon: Icon, title, description, actionLabel = null, onAction = null, compact = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
      className={`flex flex-col items-center justify-center text-center ${compact ? "py-10" : "py-20"} px-6`}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-cream border border-hair flex items-center justify-center mb-4">
          <HugeiconsIcon icon={Icon} className="w-5 h-5 text-ink" />
        </div>
      )}
      <h3 className="font-serif text-xl text-ink mb-1">{title}</h3>
      {description && <p className="text-sm text-soft max-w-sm mb-5">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-charcoal text-white hover:bg-black rounded-full px-5">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}