import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, TrendingUp } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { STAGES } from "@/lib/constants";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { logActivity } from "@/lib/activity";
import EmptyState from "@/components/shared/EmptyState";
import StageBadge from "@/components/shared/StageBadge";

export default function ClientDeals({ deals = [], client, onAdd }) {
  const qc = useQueryClient();

  const changeStage = async (deal, newStage) => {
    if (newStage === deal.stage) return;
    qc.setQueryData(["deals"], (old = []) => old.map(d => d.id === deal.id ? { ...d, stage: newStage } : d));
    await base44.entities.Deal.update(deal.id, { stage: newStage });
    const from = STAGES.find(s => s.id === deal.stage)?.label;
    const to = STAGES.find(s => s.id === newStage)?.label;
    await logActivity({
      client_id: client.id,
      type: "deal_stage_changed",
      content: `${deal.title}: ${from} → ${to}`,
      metadata: { 
        deal_id: deal.id, 
        from: deal.stage, 
        to: newStage,
        from_label: from,
        to_label: to
      }
    });
    qc.invalidateQueries({ queryKey: ["deals"] });
    qc.invalidateQueries({ queryKey: ["activities"] });
  };

  if (deals.length === 0) {
    return (
      <div className="rounded-2xl bg-cream border border-hair">
        <EmptyState icon={TrendingUp} title="No deals yet." description="Track the next opportunity with this client." actionLabel="Add deal" onAction={onAdd} compact />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="text-[11px] uppercase tracking-[0.15em] text-soft">Deals · {deals.length}</div>
        <Button onClick={onAdd} variant="outline" size="sm" className="rounded-full h-8 bg-white border-hair">
          <HugeiconsIcon icon={Add01Icon} className="w-3 h-3 mr-1" /> New deal
        </Button>
      </div>
      <AnimatePresence>
        {deals.map(d => (
          <motion.div
            key={d.id}
            layout
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-5 rounded-3xl bg-white border border-hair hover:border-ink/20 transition-all shadow-sm"
          >
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="text-ink font-bold text-lg truncate">{d.title}</div>
                {d.value != null && <div className="text-sm font-bold text-soft mt-0.5 tracking-tight">${d.value.toLocaleString()}</div>}
              </div>
              <div className="flex items-center gap-2">
                <Select value={d.stage} onValueChange={(v) => changeStage(d, v)}>
                  <SelectTrigger className="w-36 h-10 rounded-full bg-whisper border-hair text-xs font-bold text-ink">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {d.next_step && (
              <div className="flex items-center gap-2 py-3 px-4 bg-cream/50 rounded-2xl border border-hair/50">
                <div className="text-[10px] font-black uppercase tracking-[0.15em] text-soft">Next Step</div>
                <div className="text-xs font-bold text-ink truncate">{d.next_step}</div>
              </div>
            )}
            {!d.next_step && (
              <div className="text-[10px] font-bold text-soft/50 italic px-1">No next step defined for this opportunity.</div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}