// @ts-nocheck
import React, { useMemo, useState, memo, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "@/lib/apiRoutes";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { STAGES } from "@/lib/constants";
import { useNavigate } from "react-router-dom";
import Avatar from "@/components/shared/Avatar";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { logActivity } from "@/lib/activity";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Add01Icon, 
  SearchIcon, 
  FilterIcon, 
  ArrowRight01Icon,
  ArrowLeft01Icon,
  DashboardSquareIcon,
  MoreVerticalIcon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  Folder01Icon,
  CircleIcon,
  ArrowUpDownIcon
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddDealDialog from "@/components/pipeline/AddDealDialog";
import { differenceInDays, parseISO } from "date-fns";



const WIN_CONFETTI_COLORS = ["#1f1f1f", "#f6f7ed", "#efa36a", "#6b8c5f", "#a67c52"];

function fireConfetti(origin = { y: 0.4 }) {
  confetti({ particleCount: 60, spread: 70, origin, colors: WIN_CONFETTI_COLORS });
}

// Enhancing animations with easing from skill
const EASING = [0.16, 1, 0.3, 1]; // ease-out-expo

// Memoized Card for stable drag animation
const DealCard = memo(({ deal, client, onClick, isDragging }: { deal: any; client: any; onClick: () => void; isDragging: boolean }) => {
  const daysSinceUpdate = deal.updated_date ? differenceInDays(new Date(), parseISO(deal.updated_date)) : 0;
  const isStale = daysSinceUpdate >= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{ touchAction: "manipulation" }}
      className={cn(
        "group bg-white p-4 rounded-2xl border border-hair select-none relative cursor-pointer",
        isDragging ? "border-[#efa36a] z-50 shadow-xl ring-4 ring-[#efa36a]/10" : "hover:border-soft/30 hover:bg-[#fefdf8]/50",
        isStale && !isDragging && "bg-[#fefdf8]"
      )}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 truncate">
          {client ? (
            <Avatar name={client.name} size="xs" color={client.avatar_color} className="ring-1 ring-hair" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-cream border border-hair flex items-center justify-center">
              <HugeiconsIcon icon={CircleIcon} size={8} className="text-soft" />
            </div>
          )}
          <span className="text-[10px] font-bold text-soft uppercase tracking-widest truncate">
            {client?.name || "Unknown Client"}
          </span>
        </div>
        <div className={cn(
          "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
          isStale ? "bg-red-50 text-red-600" : "bg-cream text-soft"
        )}>
          {isStale ? "Stale" : `${daysSinceUpdate}d`}
        </div>
      </div>
      
      <div className="text-sm font-semibold text-ink mb-1 leading-snug group-hover:text-charcoal transition-colors">
        {deal.title}
      </div>
      
      <div className="text-sm font-bold text-ink tabular-nums">
        {formatCurrency(deal.value)}
      </div>
      
      {deal.next_step && (
        <div className="mt-3 pt-3 border-t border-hair/60 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-white/50 border border-hair flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={ArrowRight01Icon} size={10} className="text-soft" />
          </div>
          <span className="text-[0.6875rem] text-soft truncate font-medium italic">
            {deal.next_step}
          </span>
        </div>
      )}
    </motion.div>
  );
});

function KPIItem({ label, value, icon: Icon, primary = false, context = null, isEmpty = false }: { label: string; value: string; icon: any; primary?: boolean; context?: string | null; isEmpty?: boolean }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "group relative overflow-hidden p-6 rounded-2xl border border-hair transition-all duration-300",
                "bg-white",
                isEmpty && "opacity-60"
            )}
        >
            <div className="flex flex-col h-full space-y-5">
                <div className="flex items-center justify-between">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center border border-hair bg-cream"
                    )}>
                        {Icon && <HugeiconsIcon icon={Icon} size={20} className="text-ink" />}
                    </div>
                    {context && (
                      <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/50 border border-hair text-soft">
                        {context}
                      </div>
                    )}
                </div>
                
                <div className="space-y-1">
                    <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-soft leading-none">
                      {label}
                    </div>
                    <div className={cn(
                      "text-xl xs:text-3xl font-serif tracking-tight tabular-nums text-ink leading-tight",
                      primary && "text-2xl xs:text-4xl"
                    )}>
                      {value}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function Pipeline() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDealId, setSelectedDealId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  const scrollBoard = (direction: 'left' | 'right') => {
    if (!boardRef.current) return;
    const scrollAmount = 350;
    boardRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addInitialStage, setAddInitialStage] = useState("lead");
  
  const [nextStepVal, setNextStepVal] = useState("");
  const [dealValueVal, setDealValueVal] = useState("0");
  const [detailsSaving, setDetailsSaving] = useState(false);

  const [filters, setFilters] = useState({ minPrice: '', maxPrice: '' });
  const [sortOrder, setSortOrder] = useState("-updated_date");
  const activeFilterCount = (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0);

  const [lossModalOpen, setLossModalOpen] = useState(false);
  const [pendingLossId, setPendingLossId] = useState(null);

  const { data: deals = [], isLoading: dealsLoading } = useQuery({ 
    queryKey: ["deals"], 
    queryFn: apiRoutes.getDeals 
  });
  
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"], 
    queryFn: apiRoutes.getClients 
  });
  const clientMap = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c])), [clients]);

  const selectedDeal = useMemo(() => deals.find(d => d.id === selectedDealId), [deals, selectedDealId]);

  useEffect(() => {
    if (selectedDeal) {
      setNextStepVal(selectedDeal.next_step || "");
      setDealValueVal(String(selectedDeal.value ?? 0));
    }
  }, [selectedDeal]);

  const metrics = useMemo(() => {
    const openDeals = deals.filter(d => d.stage !== "won" && d.stage !== "lost");
    const wonDeals = deals.filter(d => d.stage === "won");
    const lostDeals = deals.filter(d => d.stage === "lost");
    const totalValue = openDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    const avgSize = openDeals.length ? totalValue / openDeals.length : 0;
    const closedCount = wonDeals.length + lostDeals.length;
    const convRate = closedCount ? (wonDeals.length / closedCount) * 100 : 0;
    
    return { totalValue, avgSize, convRate, closedCount, wonCount: wonDeals.length, count: deals.length };
  }, [deals]);

  const filteredDeals = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return deals.filter(d => {
        const matchesSearch = !searchQuery || d.title.toLowerCase().includes(q) || clientMap[d.client_id]?.name.toLowerCase().includes(q);
        const val = d.value || 0;
        const matchesMinVal = !filters.minPrice || val >= parseFloat(filters.minPrice);
        const matchesMaxVal = !filters.maxPrice || val <= parseFloat(filters.maxPrice);
        return matchesSearch && matchesMinVal && matchesMaxVal;
    }).sort((a, b) => {
        if (sortOrder === "-value") return (b.value || 0) - (a.value || 0);
        if (sortOrder === "name") return (a.title || "").localeCompare(b.title || "");
        // Default to updated_date
        const da = new Date(a.updated_date || a.created_at || 0).getTime();
        const db = new Date(b.updated_date || b.created_at || 0).getTime();
        return db - da;
    });
  }, [deals, searchQuery, clientMap, filters, sortOrder]);

  const grouped = useMemo(() => {
    const g = Object.fromEntries(STAGES.map(s => [s.id, []]));
    filteredDeals.forEach(d => { if (g[d.stage]) g[d.stage].push(d); });
    return g;
  }, [filteredDeals]);

  const handleLoss = async (id, reason) => {
    const deal = deals.find(d => d.id === id);
    if (!deal) return;
    
    try {
      // Remove loss_reason from DB call to fix schema mismatch error
      await apiRoutes.updateDeal(id, { stage: "lost" });
      
      // Log the loss reason as an activity instead
      await logActivity({
        client_id: deal.client_id,
        type: "deal_stage_changed",
        content: `Lost deal "${deal.title}" · Reason: ${reason}`,
        metadata: { from: deal.stage, to: "lost", deal_id: id, reason }
      });

      qc.invalidateQueries({ queryKey: ["deals"] });
      toast.info("Deal archived as lost");
      setLossModalOpen(false);
      setPendingLossId(null);
    } catch (error) {
      toast.error(error?.message || "Failed to mark deal as lost.");
    }
  };

  const onDragEnd = async (res) => {
    const { source, destination, draggableId } = res;
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return;
    
    const deal = deals.find(d => d.id === draggableId);
    if (!deal) return;
    const newStage = destination.droppableId;
    const oldStage = deal.stage;
    
    if (newStage === "lost") {
        setPendingLossId(deal.id);
        setLossModalOpen(true);
        return;
    }

    const now = new Date().toISOString();
    const previousDeals = qc.getQueryData(["deals"]);
    qc.setQueryData(["deals"], (old: any = []) => old.map((d: any) => d.id === deal.id ? { ...d, stage: newStage, updated_date: now } : d));
    
    try {
      await apiRoutes.updateDeal(deal.id, { stage: newStage });
      if (newStage === "won") {
        fireConfetti({ y: 0.3 });
        toast.success(`Deal "${deal.title}" won! 🎉`);
      }
      qc.invalidateQueries({ queryKey: ["deals"] });
      await logActivity({
        client_id: deal.client_id,
        type: "deal_stage_changed",
        content: `Moved deal "${deal.title}" to ${newStage}`,
        metadata: { from: oldStage, to: newStage, deal_id: deal.id }
      });
    } catch (error) {
      qc.setQueryData(["deals"], previousDeals || []);
      toast.error(error?.message || "Unable to update deal stage.");
    }
  };

  const openAdd = (stage = "lead") => {
      setAddInitialStage(stage);
      setIsAddOpen(true);
  };

  const hasPendingDetailChanges = selectedDeal
    ? Number.parseFloat(dealValueVal || "0") !== Number(selectedDeal.value || 0) ||
      (nextStepVal || "") !== (selectedDeal.next_step || "")
    : false;

  const saveDealDetails = async () => {
    if (!selectedDeal || !hasPendingDetailChanges) return;
    setDetailsSaving(true);
    try {
      await apiRoutes.updateDeal(selectedDeal.id, {
        value: Number.parseFloat(dealValueVal || "0") || 0,
        next_step: nextStepVal?.trim() || null
      });
      qc.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Deal details updated");
    } catch (error) {
      toast.error(error?.message || "Failed to save updates.");
    } finally {
      setDetailsSaving(false);
    }
  };

  return (
    <div className="flex flex-col space-y-8 h-auto lg:h-[calc(100vh-120px)] lg:min-h-[600px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 flex-shrink-0 px-1">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#efa36a]" />
            <span className="text-[0.625rem] font-bold uppercase tracking-[0.25em] text-soft">Sales Pipeline</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-ink tracking-tight">Pipeline</h1>
          <p className="text-soft text-[0.9375rem] mt-2 max-w-[40ch]">Track, optimize, and close your opportunities.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soft/60 transition-colors group-focus-within:text-charcoal pl-1">
              <HugeiconsIcon icon={SearchIcon} size={18} />
            </div>
            <Input 
              placeholder="Search deals or clients..." 
              className="pl-11 pr-4 w-full md:w-72 bg-white border-hair rounded-full h-12 focus:ring-4 focus:ring-charcoal/5 focus:border-charcoal transition-all placeholder:text-soft/40 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  style={{ touchAction: 'manipulation' }}
                  className={cn(
                    "border-hair bg-white h-12 px-5 rounded-full gap-2.5 transition-all active:scale-95", 
                    activeFilterCount > 0 && "border-charcoal bg-charcoal/5"
                  )}
                >
                    <HugeiconsIcon icon={FilterIcon} size={18} className="text-soft" />
                    <span className="text-xs font-medium text-ink">Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-charcoal text-white text-[10px] flex items-center justify-center -mr-1">{activeFilterCount}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 overflow-hidden rounded-[2rem] border-hair bg-white" align="end">
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="font-serif text-xl text-ink">Narrow down</h4>
                        <button 
                            onClick={() => setFilters({ minPrice: '', maxPrice: '' })}
                            style={{ touchAction: 'manipulation' }}
                            className="text-[10px] font-medium text-soft hover:text-red-500 transition-colors uppercase tracking-widest active:scale-90"
                        >
                            Reset
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <label className="text-xs text-soft">Value Range</label>
                        <div className="flex items-center gap-3">
                            <Input 
                                type="number" 
                                placeholder="Min $" 
                                value={filters.minPrice} 
                                onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                                className="h-10 text-[0.8125rem] rounded-xl bg-whisper/20 border-hair focus:border-charcoal transition-colors tabular-nums"
                            />
                            <span className="text-soft/40">—</span>
                            <Input 
                                type="number" 
                                placeholder="Max $" 
                                value={filters.maxPrice} 
                                onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                                className="h-10 text-[0.8125rem] rounded-xl bg-whisper/20 border-hair focus:border-charcoal transition-colors tabular-nums"
                            />
                        </div>
                    </div>
                </div>
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="rounded-full border-hair bg-white text-soft hover:text-ink h-12 px-6">
                <HugeiconsIcon icon={ArrowUpDownIcon} size={16} className="mr-2" />
                Sort: {sortOrder === "-value" ? "Value" : sortOrder === "-updated_date" ? "Recently updated" : "Name"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 rounded-2xl border-hair bg-white" align="end">
                <div className="space-y-1">
                    <button 
                        onClick={() => setSortOrder("-value")}
                        className={cn("w-full text-left px-3 py-2 text-sm rounded-lg transition", sortOrder === "-value" ? "bg-cream text-ink" : "text-soft hover:bg-cream/50")}
                    >Value (High to Low)</button>
                    <button 
                        onClick={() => setSortOrder("-updated_date")}
                        className={cn("w-full text-left px-3 py-2 text-sm rounded-lg transition", sortOrder === "-updated_date" ? "bg-cream text-ink" : "text-soft hover:bg-cream/50")}
                    >Recently updated</button>
                </div>
            </PopoverContent>
          </Popover>

          <Button 
            onClick={() => openAdd()} 
            style={{ touchAction: 'manipulation' }}
            className="bg-charcoal text-white hover:bg-black transition-all active:scale-95 gap-2 h-12 px-6 rounded-full font-bold border-none"
          >
            <HugeiconsIcon icon={Add01Icon} size={18} /> 
            Create Deal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 flex-shrink-0">
        <KPIItem 
            label="Live Pipe Value" 
            value={formatCurrency(metrics.totalValue)} 
            icon={Add01Icon} 
            primary={true}
            isEmpty={metrics.totalValue === 0}
            context={`${metrics.count} active`}
        />
        <KPIItem 
            label="Average Deal Size" 
            value={formatCurrency(metrics.avgSize)} 
            icon={DashboardSquareIcon} 
        />
        <KPIItem 
            label="Win Rate" 
            value={`${metrics.convRate.toFixed(1)}%`} 
            context={`${metrics.wonCount} won`}
            icon={CheckmarkCircle02Icon} 
        />
      </div>

      <div className="relative flex-1 min-h-[500px] lg:min-h-0 group/board mt-6 md:mt-8">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-6 z-20 opacity-0 xl:group-hover/board:opacity-100 transition-opacity hidden xl:block">
          <Button
            variant="outline"
            size="icon"
            style={{ touchAction: 'manipulation' }}
            className="w-12 h-12 rounded-full bg-white border-hair active:scale-90 transition-all"
            onClick={() => scrollBoard('left')}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} className="text-soft" />
          </Button>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-6 z-20 opacity-0 xl:group-hover/board:opacity-100 transition-opacity hidden xl:block">
          <Button
            variant="outline"
            size="icon"
            style={{ touchAction: 'manipulation' }}
            className="w-12 h-12 rounded-full bg-white border-hair active:scale-90 transition-all"
            onClick={() => scrollBoard('right')}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={20} className="text-soft" />
          </Button>
        </div>

        <div ref={boardRef} className="h-full overflow-x-auto pb-8 scrollbar-none">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 h-full min-w-max pb-2">
              {STAGES.map((stage, sIdx) => {
                const columnDeals = grouped[stage.id];
                const columnValue = columnDeals.reduce((sum, d) => sum + (d.value || 0), 0);
                
                return (
                  <Droppable droppableId={stage.id} key={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "w-[300px] md:w-[340px] flex-shrink-0 rounded-2xl flex flex-col h-full border border-hair relative",
                          snapshot.isDraggingOver ? "bg-[#fefdf8] border-[#efa36a]/40" : "bg-white/40"
                        )}
                      >
                        <div className="p-6 pb-4 flex items-center justify-between sticky top-0 z-20">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-xl bg-charcoal text-white text-[10px] font-medium flex items-center justify-center">
                                {columnDeals.length}
                             </div>
                             <h3 className="text-[10px] font-medium uppercase tracking-widest text-soft">{stage.label}</h3>
                          </div>
                          <div className="text-[0.875rem] font-serif text-soft tabular-nums">{formatCurrency(columnValue)}</div>
                        </div>

                        <div className="px-4 pb-6 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                          {columnDeals.map((deal, idx) => {
                            const client = clients.find(c => c.id === deal.client_id);
                            return (
                              <Draggable draggableId={deal.id} index={idx} key={deal.id}>
                                {(p, s) => (
                                  <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps} style={p.draggableProps.style}>
                                    <DealCard deal={deal} client={client} onClick={() => setSelectedDealId(deal.id)} isDragging={s.isDragging} />
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          
                          {provided.placeholder}
                          
                          {columnDeals.length === 0 && !snapshot.isDraggingOver && (
                            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                                  <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center mb-5 border border-hair border-dashed">
                                    <HugeiconsIcon icon={Folder01Icon} className="text-brown/30 w-10 h-10" />
                                  </div>
                                  <p className="text-[0.625rem] font-black text-soft uppercase tracking-[0.2em]">No deals yet</p>
                                  <Button 
                                     variant="outline" 
                                     size="sm" 
                                     onClick={() => openAdd(stage.id)}
                                     style={{ touchAction: 'manipulation' }}
                                     className="mt-4 text-soft border-hair hover:text-ink hover:border-charcoal text-[0.625rem] font-black uppercase tracking-widest rounded-xl px-6 h-10 bg-white active:scale-95 transition-all"
                                  >
                                       Add deal
                                  </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        </div>
      </div>

      {/* 4. Refined Deal Detail Drawer */}
      <Sheet open={!!selectedDealId} onOpenChange={(open) => !open && setSelectedDealId(null)}>
        <SheetContent className="sm:max-w-md bg-white p-0 border-l border-hair">
          <div className="p-10 h-full flex flex-col">
            <SheetHeader className="mb-12">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-cream border border-hair rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-charcoal" />
                      <span className="text-[10px] uppercase tracking-widest text-ink font-medium">Deal Details</span>
                    </div>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-whisper transition-all">
                                <HugeiconsIcon icon={MoreVerticalIcon} size={18} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-hair p-2 w-48 bg-white">
                            <DropdownMenuItem 
                                onClick={async () => {
                                    if (confirm("Permanently delete this deal? This cannot be undone.")) {
                                        await apiRoutes.deleteDeal(selectedDeal.id);
                                        qc.invalidateQueries({ queryKey: ["deals"] });
                                        setSelectedDealId(null);
                                        toast.success("Deal purged from pipeline");
                                    }
                                }}
                                className="text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg cursor-pointer transition-all"
                            >
                                <HugeiconsIcon icon={Delete02Icon} size={18} className="mr-2" />
                                <span className="font-medium">Delete Deal</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <SheetTitle className="font-serif text-2xl mt-2 text-ink">{selectedDeal?.title}</SheetTitle>
                <div className="flex items-center gap-2 mt-2">
                  {selectedDeal && clientMap[selectedDeal.client_id] && (
                    <Avatar name={clientMap[selectedDeal.client_id].name} size="xs" color={clientMap[selectedDeal.client_id].avatar_color} />
                  )}
                  <SheetDescription className="text-soft text-sm">
                    {clientMap[selectedDeal?.client_id]?.name || "Unassociated client"}
                  </SheetDescription>
                </div>
            </SheetHeader>
          
            <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-6">
                    {/* Stage Control */}
                    <div className="space-y-2">
                        <label className="text-xs text-soft">Workflow Phase</label>
                        <Select 
                            value={selectedDeal?.stage} 
                            onValueChange={async (val) => {
                                await apiRoutes.updateDeal(selectedDeal.id, { stage: val });
                                qc.setQueryData(["deals"], (old: any = []) => old.map((d: any) => d.id === selectedDeal.id ? { ...d, stage: val } : d));
                                if (val === "won") fireConfetti();
                                toast.success(`Moved to ${val}`);
                            }}
                        >
                            <SelectTrigger className="h-11 rounded-lg border-hair bg-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-hair p-2">
                                {STAGES.map(s => (
                                    <SelectItem key={s.id} value={s.id} className="rounded-lg py-2 cursor-pointer">
                                      <span className="font-medium text-sm">{s.label}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Value Field */}
                    <div className="space-y-2">
                        <label className="text-xs text-soft">Financial Value</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-soft/60">$</span>
                            <Input 
                                type="number"
                                value={dealValueVal}
                                onChange={(e) => setDealValueVal(e.target.value)}
                                className="h-11 pl-7 rounded-lg border-hair bg-white" 
                            />
                        </div>
                    </div>

                    {/* Next Action Implementation */}
                    <div className="space-y-2">
                        <label className="text-xs text-soft">Execution Plan</label>
                        <div className="space-y-3">
                            <Input 
                                placeholder="Define the immediate next step..." 
                                value={nextStepVal} 
                                onChange={(e) => setNextStepVal(e.target.value)}
                                className="h-11 bg-white border-hair rounded-lg"
                            />
                            <div className="flex flex-wrap gap-2">
                                {["Call Client", "Draft Proposal", "Follow up", "Final Contract"].map(tag => (
                                    <button 
                                        key={tag}
                                        onClick={() => setNextStepVal(tag)}
                                        className="text-[10px] font-medium text-soft hover:text-ink hover:bg-cream border border-hair px-3 py-1.5 rounded-full transition-all uppercase tracking-wider"
                                    >
                                        + {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 mt-auto border-t border-hair flex items-center justify-between">
                <div className="text-[10px] text-soft/60 font-medium uppercase tracking-widest">
                  Updated: {selectedDeal?.updated_date ? differenceInDays(new Date(), parseISO(selectedDeal.updated_date)) === 0 ? "TODAY" : `${differenceInDays(new Date(), parseISO(selectedDeal.updated_date))}D AGO` : "NEVER"}
                </div>
                
                <Button
                  onClick={saveDealDetails}
                  disabled={!hasPendingDetailChanges || detailsSaving}
                  className="rounded-full bg-charcoal text-white hover:bg-black px-6 h-11"
                >
                  {detailsSaving ? "Saving…" : "Update Details"}
                </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AddDealDialog open={isAddOpen} onOpenChange={setIsAddOpen} initialStage={addInitialStage} clients={clients} clientsLoading={clientsLoading} />

      {/* Loss Reason Dialog */}
      <Dialog open={lossModalOpen} onOpenChange={setLossModalOpen}>
          <DialogContent className="max-w-md rounded-2xl bg-white border-hair">
              <DialogHeader>
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4 border border-red-100">
                    <HugeiconsIcon icon={Delete02Icon} className="text-red-500 w-6 h-6" />
                  </div>
                  <DialogTitle className="font-serif text-2xl text-ink">Archive Opportunity</DialogTitle>
                  <DialogDescription className="text-soft text-sm mt-1">Why was this deal lost? Capturing context helps refine your future strategy.</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-2 pt-6">
                  {["Price point", "Communication gap", "Project scope shift", "No budget", "External factors"].map(r => (
                      <button 
                        key={r}
                        onClick={() => handleLoss(pendingLossId, r)}
                        style={{ touchAction: 'manipulation' }}
                        className="w-full text-left px-5 py-3 rounded-xl border border-hair hover:border-charcoal hover:bg-cream transition-all group flex items-center justify-between active:scale-[0.98]"
                      >
                          <span className="text-sm font-medium text-ink">{r}</span>
                          <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="text-soft opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                  ))}
              </div>
              
              <div className="mt-6 text-center">
                <Button 
                    variant="ghost"
                    onClick={() => setLossModalOpen(false)}
                    className="text-xs font-bold text-soft hover:text-ink uppercase tracking-wider rounded-full"
                >
                    Keep in pipeline
                </Button>
              </div>
          </DialogContent>
      </Dialog>
    </div>
  );
}