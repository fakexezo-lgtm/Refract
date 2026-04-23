import React from "react";
import { STAGES } from "@/constants";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function PipelineSnapshot({ deals = [] }) {
  const navigate = useNavigate();
  const counts = STAGES.map(s => ({ ...s, count: deals.filter(d => d.stage === s.id).length }));
  return (
    <button 
      onClick={() => navigate("/app/pipeline")} 
      className="w-full block text-left group active:scale-[0.98] transition-all duration-300"
      style={{ touchAction: 'manipulation' }}
    >
      <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-5 gap-3 w-full scrollbar-none">
        {counts.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
            className="bg-white rounded-2xl border border-hair p-4 text-center min-w-[100px] sm:min-w-0 flex-shrink-0 sm:flex-shrink shadow-sm group-hover:border-charcoal/10 transition-all"
          >
            <div className="text-2xl sm:text-3xl font-serif text-ink leading-none mb-1.5 tracking-tight">{s.count}</div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-soft font-bold leading-tight opacity-70">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </button>
  );
}
