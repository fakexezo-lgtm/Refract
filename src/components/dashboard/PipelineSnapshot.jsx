import React from "react";
import { STAGES } from "@/lib/constants";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function PipelineSnapshot({ deals = [] }) {
  const navigate = useNavigate();
  const counts = STAGES.map(s => ({ ...s, count: deals.filter(d => d.stage === s.id).length }));
  return (
    <button onClick={() => navigate("/app/pipeline")} className="w-full block text-left">
      <div className="grid grid-cols-5 gap-2">
        {counts.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="p-4 rounded-xl bg-white border border-hair hover:border-ink/40 transition"
          >
            <div className="text-[10px] uppercase tracking-[0.1em] text-soft mb-2">{s.label}</div>
            <div className="font-serif text-3xl">{s.count}</div>
          </motion.div>
        ))}
      </div>
    </button>
  );
}