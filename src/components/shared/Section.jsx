import React from "react";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

export default function Section({ 
  icon: Icon, 
  title, 
  count, 
  tone = "text-ink", 
  children, 
  empty, 
  delay = 0, 
  expanded = true, 
  onToggle = () => {} 
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <button 
        onClick={onToggle} 
        style={{ touchAction: 'manipulation' }}
        className="flex items-center gap-2 mb-4 hover:opacity-80 active:scale-[0.98] transition-all"
      >
        <HugeiconsIcon icon={expanded ? ArrowDown01Icon : ArrowRight01Icon} className="w-4 h-4 text-soft" />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.1, type: "spring", stiffness: 500, damping: 30 }}
        >
          <HugeiconsIcon icon={Icon} className={'w-4 h-4 ' + (tone || "text-ink")} strokeWidth={1.75} />
        </motion.div>
        <h2 className="font-serif text-2xl text-ink">{title}</h2>
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.15 }}
          className="text-xs text-soft"
        >
          ({count})
        </motion.span>
      </button>
      {expanded && (
        (count === 0 && empty) ? (
          <div className="text-sm text-soft py-2">
            {empty}
          </div>
        ) : (
          <div className="space-y-2">
            {children}
          </div>
        )
      )}
    </motion.section>
  );
}
