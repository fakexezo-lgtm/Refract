import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, TrendingUp } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { STAGES } from "@/lib/constants";
import { apiRoutes } from "@/lib/apiRoutes";
import { useQueryClient } from "@tanstack/react-query";
import { logActivity } from "@/lib/activity";
import EmptyState from "@/components/shared/EmptyState";
import { toast } from "sonner";


export default function ClientDeals({ deals = [], client, onAdd }) {
  const qc = useQueryClient();

  const changeStage = async (deal, newStage) => {
    if (newStage === deal.stage) return;
    const previousDeals = qc.getQueryData(["deals"]);
    qc.setQueryData(["deals"], (old = []) => old.map(d => d.id === deal.id ? { ...d, stage: newStage } : d));
    try {
      await apiRoutes.updateDeal(deal.id, { stage: newStage });
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
      toast.success("Deal updated");
    } catch (error) {
      qc.setQueryData(["deals"], previousDeals || []);
      toast.error(error?.message || "Unable to update deal. Please try again.");
    }
  };

  if (deals.length === 0) {
    return (
      <div className="rounded-2xl bg-cream border border-hair p-8 text-center">
        <EmptyState 
          icon={TrendingUp} 
          title="No deals yet." 
          description="Track the next opportunity with this client." 
          actionLabel="Add deal" 
          onAction={onAdd} 
          compact 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-sm font-black uppercase tracking-[0.15em] text-ink">Active Opportunities</h3>
        <Button 
          onClick={onAdd} 
          variant="outline" 
          size="sm" 
          className="rounded-full h-9 bg-white border-hair shadow-sm hover:bg-whisper transition-all gap-1.5"
        >
          <HugeiconsIcon icon={Add01Icon} className="w-3.5 h-3.5" />
          <span className="text-xs font-bold text-ink">New deal</span>
        </Button>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {deals.map(d => (
            <motion.div
              key={d.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group p-6 rounded-3xl bg-white border border-hair hover:border-ink/20 transition-all shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-ink font-bold text-xl truncate tracking-tight">{d.title}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {d.value != null && (
                      <div className="text-lg font-black text-ink tracking-tight">
                        ${d.value.toLocaleString()}
                      </div>
                    )}
                    <div className="h-4 w-px bg-hair" />
                    <div className="text-[10px] font-black uppercase tracking-widest text-soft/60">
                      Added {new Date(d.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Select value={d.stage} onValueChange={(v) => changeStage(d, v)}>
                    <SelectTrigger className="w-40 h-11 rounded-2xl bg-whisper border-hair text-xs font-black uppercase tracking-widest text-ink focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-hair bg-white">
                      {STAGES.map(s => (
                        <SelectItem key={s.id} value={s.id} className="text-xs font-bold py-2.5">
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {d.next_step && (
                <div className="mt-6 flex items-center gap-3 py-3 px-4 bg-cream/30 rounded-2xl border border-hair/40 group-hover:bg-cream/50 transition-colors">
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-soft/60">Next Step</div>
                  <div className="text-sm font-bold text-ink truncate">{d.next_step}</div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}