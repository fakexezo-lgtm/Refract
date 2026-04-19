import React, { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { STAGES } from "@/lib/constants";
import { useNavigate } from "react-router-dom";
import Avatar from "@/components/shared/Avatar";
import { motion } from "framer-motion";
import { logActivity } from "@/lib/activity";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STAGE_MESSAGES = {
  lead: { empty: "Every empire starts with a spark", icon: "✨" },
  contacted: { empty: "Your next big conversation awaits", icon: "👋" },
  proposal: { empty: "Crafting something great", icon: "📝" },
  won: { empty: "Celebrate — you've earned it", icon: "🎉" },
  lost: { empty: "Not gone, just waiting for the right moment", icon: "⏳" },
};

const WIN_CONFETTI_COLORS = ["#1f1f1f", "#f6f7ed", "#efa36a", "#6b8c5f", "#a67c52"];

function fireConfetti(origin = { y: 0.4 }) {
  confetti({ particleCount: 60, spread: 70, origin, colors: WIN_CONFETTI_COLORS });
}

function fireGoldenRain(origin = { y: 0.6 }) {
  confetti({ particleCount: 40, spread: 100, origin, colors: ["#efa36a", "#f6f7ed"], velocity: -15, gravity: 0.9 });
}

function trackWinStreak() {
  const today = new Date().toDateString();
  const lastWin = localStorage.getItem("lastWinDate");
  const streak = parseInt(localStorage.getItem("winStreak") || "0", 10);
  if (lastWin === today) return streak;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const newStreak = lastWin === yesterday ? streak + 1 : 1;
  localStorage.setItem("lastWinDate", today);
  localStorage.setItem("winStreak", String(newStreak));
  return newStreak;
}

function getWinMessage(streak) {
  if (streak === 1) return " First win — let's build momentum!";
  if (streak === 3) return " 3-win streak! Keep it going!";
  if (streak >= 5) return ` ${streak}x winning streak! You're unstoppable!`;
  if (streak > 1) return " You're on fire! 🔥";
  return " Another win in the bag!";
}

export default function Pipeline() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  
  const { data: deals = [] } = useQuery({ queryKey: ["deals"], queryFn: () => base44.entities.Deal.list("-updated_date", 500) });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: () => base44.entities.Client.list("-updated_date", 500) });
  const clientMap = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c])), [clients]);

  const grouped = useMemo(() => {
    const g = Object.fromEntries(STAGES.map(s => [s.id, []]));
    deals.forEach(d => { if (g[d.stage]) g[d.stage].push(d); });
    return g;
  }, [deals]);

  const wonDeals = useMemo(() => deals.filter(d => d.stage === "won"), [deals]);
  const wonValue = useMemo(() => wonDeals.reduce((sum, d) => sum + (d.value || 0), 0), [wonDeals]);

  const onDragStart = () => {
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
  };

  const onDragEnd = async (res) => {
    document.body.style.cursor = "";
    document.body.style.userSelect = "auto";
    
    const { source, destination, draggableId } = res;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;
    
    const deal = deals.find(d => d.id === draggableId);
    if (!deal) return;
    const newStage = destination.droppableId;
    const oldStage = deal.stage;
    
    qc.setQueryData(["deals"], (old = []) => old.map(d => d.id === deal.id ? { ...d, stage: newStage } : d));
    
    await base44.entities.Deal.update(deal.id, { stage: newStage });
    const fromLabel = STAGES.find(s => s.id === oldStage)?.label;
    const toLabel = STAGES.find(s => s.id === newStage)?.label;
    await logActivity({
      client_id: deal.client_id, type: "deal_stage_changed",
      content: `${deal.title}: ${fromLabel} → ${toLabel}`,
      metadata: { deal_id: deal.id, from: oldStage, to: newStage }
    });
    qc.invalidateQueries({ queryKey: ["deals"] });
    qc.invalidateQueries({ queryKey: ["activities"] });

    if (newStage === "won") {
      const streak = trackWinStreak();
      fireConfetti({ y: 0.3 });
      setTimeout(() => fireGoldenRain({ y: 0.5 }), 300);
      setTimeout(() => fireConfetti({ y: 0.2 }), 600);
      const formattedValue = deal.value ? `$${deal.value.toLocaleString()}` : "a win";
      toast.success(`Deal ${formattedValue} closed!${getWinMessage(streak)}`, { duration: 4000 });
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <div className="text-[11px] uppercase tracking-[0.15em] text-soft mb-2">Deal progression</div>
          <h1 className="font-serif text-4xl md:text-5xl text-ink">Pipeline</h1>
          <p className="text-soft mt-2">{deals.length} deal{deals.length === 1 ? "" : "s"} across {STAGES.length} stages</p>
        </div>
        {wonValue > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-right">
            <div className="text-[10px] uppercase tracking-[0.15em] text-soft">Won value</div>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="font-serif text-2xl md:text-3xl text-[#6b8c5f]"
            >
              ${wonValue.toLocaleString()}
            </motion.div>
          </motion.div>
        )}
      </div>

      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {STAGES.map((stage) => (
            <Droppable droppableId={stage.id} key={stage.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "rounded-2xl p-3 min-h-[300px] pipeline-column",
                    snapshot.isDraggingOver ? "drag-over bg-[#fefdf8]" : "bg-white",
                    "border border-hair"
                  )}
                >
                  {stage.id === "won" && grouped[stage.id]?.length > 0 && !snapshot.isDraggingOver && (
                    <motion.div className="absolute inset-0 pointer-events-none" animate={{ opacity: 0.3 }} transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}>
                      <div className="absolute top-2 right-4 text-2xl opacity-20">✦</div>
                      <div className="absolute bottom-8 left-2 text-xl opacity-20">✦</div>
                      <div className="absolute top-1/2 right-8 text-lg opacity-20">✦</div>
                    </motion.div>
                  )}
                  <div className="flex items-center justify-between px-1 pb-3 mb-1 border-b border-hair/60">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">{STAGE_MESSAGES[stage.id]?.icon}</span>
                      <div className="text-xs font-medium text-ink uppercase tracking-wider">{stage.label}</div>
                    </div>
                    <div className="text-xs text-soft">{grouped[stage.id]?.length || 0}</div>
                  </div>
                  <div className="space-y-2 flex flex-col">
                    {grouped[stage.id]?.map((deal, idx) => {
                      const client = clientMap[deal.client_id];
                      return (
                        <Draggable draggableId={deal.id} index={idx} key={deal.id}>
                          {(p, s) => (
                            <div
                              ref={p.innerRef}
                              {...p.draggableProps}
                              {...p.dragHandleProps}
                              style={p.draggableProps.style}
                              onClick={() => client && !s.isDragging && navigate(`/app/clients/${client.id}`)}
                              className={cn(
                                "pipeline-card p-3 rounded-xl border select-none bg-white",
                                s.isDragging ? "dragging" : "border-hair"
                              )}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                {client && <Avatar name={client.name} color={client.avatar_color} size="xs" />}
                                <div className="text-xs text-soft truncate">{client?.name || "Unknown"}</div>
                              </div>
                              <div className="text-sm text-ink font-medium leading-snug">{deal.title}</div>
                              {deal.value != null && <div className="text-xs text-soft mt-1">${deal.value.toLocaleString()}</div>}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                    {grouped[stage.id]?.length === 0 && !snapshot.isDraggingOver && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-soft/60 text-center py-8 flex flex-col items-center gap-1">
                        <span className="text-lg">{STAGE_MESSAGES[stage.id]?.icon}</span>
                        <span className="italic">{STAGE_MESSAGES[stage.id]?.empty}</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-xs text-soft text-center mt-8">
        Drag a card to move between stages · Click to open the client · Drop on Won for a surprise 🎉
      </motion.p>
    </div>
  );
}