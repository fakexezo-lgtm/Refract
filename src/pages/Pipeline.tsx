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
import { cn } from "@/lib/utils";

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

  const onDragEnd = async (res) => {
    const { source, destination, draggableId } = res;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;
    const deal = deals.find(d => d.id === draggableId);
    if (!deal) return;
    const newStage = destination.droppableId;

    qc.setQueryData(["deals"], (old = []) => old.map(d => d.id === deal.id ? { ...d, stage: newStage } : d));
    await base44.entities.Deal.update(deal.id, { stage: newStage });
    const fromLabel = STAGES.find(s => s.id === deal.stage)?.label;
    const toLabel = STAGES.find(s => s.id === newStage)?.label;
    await logActivity({
      client_id: deal.client_id, type: "deal_stage_changed",
      content: `${deal.title}: ${fromLabel} → ${toLabel}`,
      metadata: { deal_id: deal.id, from: deal.stage, to: newStage }
    });
    qc.invalidateQueries({ queryKey: ["deals"] });
    qc.invalidateQueries({ queryKey: ["activities"] });

    if (newStage === "won") {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.4 }, colors: ["#1f1f1f", "#f6f7ed", "#efa36a"] });
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
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {STAGES.map(stage => (
            <Droppable droppableId={stage.id} key={stage.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "rounded-2xl p-3 min-h-[300px] transition border",
                    snapshot.isDraggingOver ? "bg-cream border-ink/30" : "bg-white border-hair"
                  )}
                >
                  <div className="flex items-center justify-between px-1 pb-3 mb-1 border-b border-hair">
                    <div className="text-xs font-medium text-ink uppercase tracking-wider">{stage.label}</div>
                    <div className="text-xs text-soft">{grouped[stage.id]?.length || 0}</div>
                  </div>
                  <div className="space-y-2">
                    {grouped[stage.id]?.map((deal, idx) => {
                      const client = clientMap[deal.client_id];
                      return (
                        <Draggable draggableId={deal.id} index={idx} key={deal.id}>
                          {(p, s) => (
                            <motion.div
                              layout
                              ref={p.innerRef}
                              {...p.draggableProps}
                              {...p.dragHandleProps}
                              onClick={() => client && navigate(`/app/clients/${client.id}`)}
                              className={cn(
                                "p-3 rounded-xl bg-white border border-hair hover:border-ink/30 cursor-pointer transition",
                                s.isDragging && "shadow-xl rotate-1 border-ink/40"
                              )}
                              style={p.draggableProps.style}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                {client && <Avatar name={client.name} color={client.avatar_color} size="xs" />}
                                <div className="text-xs text-soft truncate">{client?.name || "Unknown"}</div>
                              </div>
                              <div className="text-sm text-ink font-medium leading-snug">{deal.title}</div>
                              {deal.value != null && (
                                <div className="text-xs text-soft mt-1">${deal.value.toLocaleString()}</div>
                              )}
                            </motion.div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                    {grouped[stage.id]?.length === 0 && !snapshot.isDraggingOver && (
                      <div className="text-xs text-soft text-center py-8 opacity-60">No deals</div>
                    )}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <p className="text-xs text-soft text-center mt-8">Drag a card to move between stages · Click to open the client</p>
    </div>
  );
}