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
  DashboardSquareIcon,
  MoreVerticalIcon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  Folder01Icon,
  CircleIcon
} from "@hugeicons/core-free-icons";
import { Button as BaseButton } from "@/components/ui/button";
import { Input as BaseInput } from "@/components/ui/input";
import { 
  Sheet as BaseSheet, 
  SheetContent as BaseSheetContent, 
  SheetHeader as BaseSheetHeader, 
  SheetTitle as BaseSheetTitle, 
  SheetDescription as BaseSheetDescription 
} from "@/components/ui/sheet";
import {
  Dialog as BaseDialog,
  DialogContent as BaseDialogContent,
  DialogHeader as BaseDialogHeader,
  DialogTitle as BaseDialogTitle,
  DialogDescription as BaseDialogDescription,
  DialogFooter as BaseDialogFooter
} from "@/components/ui/dialog";
import {
  Popover as BasePopover,
  PopoverContent as BasePopoverContent,
  PopoverTrigger as BasePopoverTrigger,
} from "@/components/ui/popover";
import {
  Select as BaseSelect,
  SelectContent as BaseSelectContent,
  SelectItem as BaseSelectItem,
  SelectTrigger as BaseSelectTrigger,
  SelectValue as BaseSelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu as BaseDropdownMenu,
  DropdownMenuContent as BaseDropdownMenuContent,
  DropdownMenuItem as BaseDropdownMenuItem,
  DropdownMenuTrigger as BaseDropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddDealDialog from "@/components/pipeline/AddDealDialog";
import { differenceInDays, parseISO } from "date-fns";

const Button = BaseButton as any;
const Input = BaseInput as any;
const Sheet = BaseSheet as any;
const SheetContent = BaseSheetContent as any;
const SheetHeader = BaseSheetHeader as any;
const SheetTitle = BaseSheetTitle as any;
const SheetDescription = BaseSheetDescription as any;
const Dialog = BaseDialog as any;
const DialogContent = BaseDialogContent as any;
const DialogHeader = BaseDialogHeader as any;
const DialogTitle = BaseDialogTitle as any;
const DialogDescription = BaseDialogDescription as any;
const DialogFooter = BaseDialogFooter as any;
const Popover = BasePopover as any;
const PopoverContent = BasePopoverContent as any;
const PopoverTrigger = BasePopoverTrigger as any;
const Select = BaseSelect as any;
const SelectContent = BaseSelectContent as any;
const SelectItem = BaseSelectItem as any;
const SelectTrigger = BaseSelectTrigger as any;
const SelectValue = BaseSelectValue as any;
const DropdownMenu = BaseDropdownMenu as any;
const DropdownMenuContent = BaseDropdownMenuContent as any;
const DropdownMenuItem = BaseDropdownMenuItem as any;
const DropdownMenuTrigger = BaseDropdownMenuTrigger as any;

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
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "group bg-white p-4 rounded-2xl border border-hair shadow-sm select-none relative transition-all duration-300 cursor-pointer",
        isDragging ? "shadow-2xl border-[#efa36a] z-50 ring-4 ring-[#efa36a]/10" : "hover:border-[#efa36a]/30 hover:shadow-md",
        isStale && !isDragging && "bg-[#fffafa]"
      )}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 truncate">
          {client ? (
            <Avatar name={client.name} size="xs" color={client.avatar_color} className="ring-1 ring-hair shadow-sm" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-whisper border border-hair" />
          )}
          <span className="text-[0.6875rem] text-soft truncate font-semibold uppercase tracking-wider">{client?.name || "Unassigned"}</span>
        </div>
        <div className={cn(
            "text-[0.625rem] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded-md",
            isStale ? "bg-red-50 text-red-500" : "bg-whisper text-soft"
        )}>
            {daysSinceUpdate === 0 ? "Today" : `${daysSinceUpdate}d`}
        </div>
      </div>
      
      <div className="text-[0.875rem] font-semibold text-ink mb-1 leading-snug group-hover:text-charcoal transition-colors">
        {deal.title}
      </div>
      
      <div className="text-[0.8125rem] font-bold text-ink tabular-nums">
        {formatCurrency(deal.value)}
      </div>
      
      {deal.next_step && (
        <div className="mt-3 pt-3 border-t border-hair/60 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#efa36a]/10 flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={ArrowRight01Icon} size={10} className="text-[#efa36a]" strokeWidth={3} />
          </div>
          <span className="text-[0.6875rem] text-soft truncate font-medium">
            {deal.next_step}
          </span>
        </div>
      )}
    </motion.div>
  );
});

function KPIItem({ label, value, icon: Icon, primary = false, context = null }: { label: string; value: string; icon: any; primary?: boolean; context?: string | null }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASING }}
            className={cn(
                "group relative overflow-hidden p-6 rounded-[2rem] border transition-all duration-500",
                primary 
                  ? "bg-charcoal text-white border-charcoal shadow-2xl ring-1 ring-white/10" 
                  : "bg-white text-ink border-hair shadow-sm hover:shadow-xl hover:border-charcoal/10"
            )}
        >
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
                        primary ? "bg-white/10" : "bg-whisper"
                    )}>
                        {Icon && <HugeiconsIcon icon={Icon} size={24} className={primary ? "text-white" : "text-charcoal"} />}
                    </div>
                    {context && (
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[0.625rem] font-black uppercase tracking-widest border transition-all",
                        primary ? "bg-white/5 border-white/10 text-white/60" : "bg-charcoal/5 border-charcoal/10 text-soft"
                      )}>
                        {context}
                      </div>
                    )}
                </div>
                
                <div className={cn(
                  "text-[0.6875rem] uppercase font-black tracking-[0.15em] mb-1", 
                  primary ? "text-white/50" : "text-soft/60"
                )}>
                  {label}
                </div>
                
                <div className={cn(
                  "text-3xl font-serif tracking-tight tabular-nums", 
                  primary ? "text-white" : "text-ink"
                )}>
                  {value}
                </div>
            </div>
            
            {/* Visual Flair */}
            <div className={cn(
              "absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] transition-transform duration-700 group-hover:scale-150",
              primary ? "bg-white" : "bg-charcoal"
            )} />
        </motion.div>
    );
}

export default function Pipeline() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDealId, setSelectedDealId] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addInitialStage, setAddInitialStage] = useState("lead");
  
  const [nextStepVal, setNextStepVal] = useState("");
  const [dealValueVal, setDealValueVal] = useState("0");
  const [detailsSaving, setDetailsSaving] = useState(false);

  const [filters, setFilters] = useState({ minPrice: '', maxPrice: '' });
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
    });
  }, [deals, searchQuery, clientMap, filters]);

  const grouped = useMemo(() => {
    const g = Object.fromEntries(STAGES.map(s => [s.id, []]));
    filteredDeals.forEach(d => { if (g[d.stage]) g[d.stage].push(d); });
    return g;
  }, [filteredDeals]);

  const handleLoss = async (id, reason) => {
    try {
      await apiRoutes.updateDeal(id, { stage: "lost", loss_reason: reason });
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
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-8 min-h-[600px] animate-in fade-in duration-700">
      {/* 1. Header with Rhythm */}
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
              className="pl-11 pr-4 w-full md:w-72 bg-white border-hair rounded-2xl h-12 focus:ring-4 focus:ring-charcoal/5 focus:border-charcoal transition-all placeholder:text-soft/40 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className={cn(
                  "border-hair bg-white h-12 px-5 rounded-2xl gap-2.5 transition-all hover:bg-whisp hover:border-charcoal/20 shadow-sm", 
                  activeFilterCount > 0 && "border-charcoal bg-charcoal/5 ring-4 ring-charcoal/5"
                )}>
                    <HugeiconsIcon icon={FilterIcon} size={18} className="text-soft" />
                    <span className="text-xs font-bold text-ink">Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-charcoal text-white text-[10px] flex items-center justify-center -mr-1">{activeFilterCount}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 shadow-2xl rounded-[2rem] border-hair bg-white p-8" align="end">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="font-serif text-xl text-ink">Narrow down</h4>
                        <button 
                            onClick={() => setFilters({ minPrice: '', maxPrice: '' })}
                            className="text-[0.625rem] font-bold text-soft hover:text-red-500 transition-colors uppercase tracking-widest"
                        >
                            Reset
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <label className="text-[0.625rem] uppercase tracking-[0.2em] font-black text-soft">Value Range</label>
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-soft font-bold">$</span>
                                <Input 
                                    type="number" 
                                    placeholder="Min" 
                                    value={filters.minPrice} 
                                    onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                                    className="h-10 pl-7 text-[0.8125rem] rounded-xl bg-whisper/20 border-hair focus:border-charcoal transition-colors tabular-nums"
                                />
                            </div>
                            <span className="text-soft/40">—</span>
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-soft font-bold">$</span>
                                <Input 
                                    type="number" 
                                    placeholder="Max" 
                                    value={filters.maxPrice} 
                                    onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                                    className="h-10 pl-7 text-[0.8125rem] rounded-xl bg-whisper/20 border-hair focus:border-charcoal transition-colors tabular-nums"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <Button 
                      className="w-full h-11 rounded-xl bg-charcoal text-white hover:bg-black font-bold text-xs"
                      onClick={() => document.body.click()}
                    >
                      Apply Filters
                    </Button>
                </div>
            </PopoverContent>
          </Popover>

          <Button onClick={() => openAdd()} className="bg-charcoal text-white hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all gap-2.5 h-12 px-6 rounded-2xl font-bold border-none shadow-xl shadow-charcoal/10">
            <HugeiconsIcon icon={Add01Icon} size={18} strokeWidth={3} /> 
            <span>Create Deal</span>
          </Button>
        </div>
      </div>

      {/* 2. Advanced Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-shrink-0">
        <KPIItem 
            label="Live Pipe Value" 
            value={formatCurrency(metrics.totalValue)} 
            icon={Add01Icon} 
            primary={true}
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

      {/* 3. Board with Column Tints */}
      <div className="flex-1 min-h-0 overflow-x-auto pb-8 scrollbar-hide">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 h-full min-w-max pb-2">
              {STAGES.map((stage, sIdx) => {
                const columnDeals = grouped[stage.id];
                const columnValue = columnDeals.reduce((sum, d) => sum + (d.value || 0), 0);
                
                return (
                  <Droppable droppableId={stage.id} key={stage.id}>
                    {(provided, snapshot) => (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: sIdx * 0.1, duration: 0.5, ease: EASING }}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "w-[300px] md:w-[340px] flex-shrink-0 rounded-[2.5rem] flex flex-col h-full border border-hair transition-all duration-300 relative",
                          snapshot.isDraggingOver ? "bg-[#fefdf8] border-[#efa36a]/40 ring-8 ring-[#efa36a]/5 shadow-inner" : "bg-white/40 hover:bg-white/60"
                        )}
                      >
                        {/* Column Header */}
                        <div className="p-6 pb-4 flex items-center justify-between sticky top-0 z-20">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-xl bg-charcoal text-white text-[0.625rem] font-black flex items-center justify-center shadow-lg shadow-charcoal/20">
                                {columnDeals.length}
                             </div>
                             <h3 className="text-[0.75rem] font-black uppercase tracking-[0.2em] text-ink">{stage.label}</h3>
                          </div>
                          <div className="text-[0.875rem] font-serif text-soft tabular-nums">{formatCurrency(columnValue)}</div>
                        </div>

                        {/* Column Body */}
                        <div className="px-4 pb-6 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                          <LayoutGroup>
                            <AnimatePresence mode="popLayout" initial={false}>
                              {columnDeals.map((deal, idx) => {
                                const client = clientMap[deal.client_id];
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
                            </AnimatePresence>
                          </LayoutGroup>
                          
                          {provided.placeholder}
                          
{columnDeals.length === 0 && !snapshot.isDraggingOver && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex flex-col items-center justify-center py-20 text-center px-4"
                            >
                                  <div className="w-20 h-20 rounded-[2rem] bg-cream flex items-center justify-center mb-5 border border-hair border-dashed">
                                    <HugeiconsIcon icon={Folder01Icon} className="text-brown/30 w-10 h-10" />
                                  </div>
                                  <p className="text-[0.625rem] font-black text-soft uppercase tracking-[0.2em]">No deals yet</p>
                                  <p className="text-[0.6875rem] text-soft/50 mt-2 mb-8 max-w-[20ch]">Add a deal or drag one here to get started.</p>
                   
                                  <Button 
                                     variant="outline" 
                                     size="sm" 
                                     onClick={() => openAdd(stage.id)}
                                     className="text-soft border-hair hover:text-ink hover:border-charcoal text-[0.625rem] font-black uppercase tracking-widest rounded-full px-6 h-10 bg-white shadow-sm transition-all hover:scale-105 active:scale-95"
                                  >
                                       Add deal
                                  </Button>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
      </div>

      {/* 4. Refined Deal Detail Drawer */}
      <Sheet open={!!selectedDealId} onOpenChange={(open) => !open && setSelectedDealId(null)}>
        <SheetContent className="sm:max-w-md bg-white p-0 border-l border-hair shadow-2xl">
          <div className="p-10 h-full flex flex-col">
            <SheetHeader className="mb-12">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-[#efa36a]/10 border border-[#efa36a]/20 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#efa36a] animate-pulse" />
                      <span className="text-[0.625rem] uppercase tracking-[0.2em] text-[#a67c52] font-black">Deal Insights</span>
                    </div>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-whisper transition-all">
                                <HugeiconsIcon icon={MoreVerticalIcon} size={18} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-hair p-2 w-48 shadow-2xl">
                            <DropdownMenuItem 
                                onClick={async () => {
                                    if (confirm("Permanently delete this deal? This cannot be undone.")) {
                                        await apiRoutes.deleteDeal(selectedDeal.id);
                                        qc.invalidateQueries({ queryKey: ["deals"] });
                                        setSelectedDealId(null);
                                        toast.success("Deal purged from pipeline");
                                    }
                                }}
                                className="text-red-500 focus:text-white focus:bg-red-500 rounded-xl cursor-pointer font-bold h-11 transition-all"
                            >
                                <HugeiconsIcon icon={Delete02Icon} size={18} />
                                <span className="ml-2 text-xs uppercase tracking-widest font-black">Delete deal</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <SheetTitle className="font-serif text-4xl mt-4 leading-[1.1] text-ink tracking-tight">{selectedDeal?.title}</SheetTitle>
                <div className="flex items-center gap-2.5 mt-4">
                  {selectedDeal && clientMap[selectedDeal.client_id] && (
                    <Avatar name={clientMap[selectedDeal.client_id].name} size="xs" color={clientMap[selectedDeal.client_id].avatar_color} className="ring-1 ring-hair shadow-sm" />
                  )}
                  <SheetDescription className="text-soft text-base font-medium">
                    {clientMap[selectedDeal?.client_id]?.name || "Unassociated client"}
                  </SheetDescription>
                </div>
            </SheetHeader>
          
            <div className="flex-1 space-y-12 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-10">
                    {/* Stage Control */}
                    <div className="space-y-4">
                        <label className="text-[0.625rem] uppercase font-black text-soft tracking-[0.25em]">Workflow Phase</label>
                        <Select 
                            value={selectedDeal?.stage} 
                            onValueChange={async (val) => {
                                await apiRoutes.updateDeal(selectedDeal.id, { stage: val });
                                qc.setQueryData(["deals"], (old: any = []) => old.map((d: any) => d.id === selectedDeal.id ? { ...d, stage: val } : d));
                                if (val === "won") fireConfetti();
                                toast.success(`Moved to ${val}`);
                            }}
                        >
                            <SelectTrigger className="h-14 rounded-2xl border-hair bg-whisper/20 hover:bg-whisper/40 transition-all font-bold text-ink focus:ring-4 focus:ring-charcoal/5">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-hair shadow-2xl p-2 min-w-[200px]">
                                {STAGES.map(s => (
                                    <SelectItem key={s.id} value={s.id} className="rounded-xl py-3 focus:bg-whisper cursor-pointer">
                                      <span className="font-bold text-sm tracking-tight">{s.label}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Value Field */}
                    <div className="space-y-4">
                        <label className="text-[0.625rem] uppercase font-black text-soft tracking-[0.25em]">Financial Value</label>
                        <div className="relative group">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-soft/40 font-serif text-2xl tracking-tighter transition-colors group-focus-within:text-charcoal">$</span>
                            <Input 
                                type="number"
                                value={dealValueVal}
                                onChange={(e) => setDealValueVal(e.target.value)}
                                className="h-16 pl-10 pr-6 bg-whisper/10 border-hair rounded-2xl font-serif text-3xl focus:ring-4 focus:ring-charcoal/5 focus:bg-white transition-all tabular-nums tracking-tighter"
                            />
                        </div>
                    </div>

                    {/* Next Action Implementation */}
                    <div className="space-y-5">
                        <label className="text-[0.625rem] uppercase font-black text-soft tracking-[0.25em]">Execution Plan</label>
                        <div className="space-y-5">
                            <Input 
                                placeholder="Define the immediate next step..." 
                                value={nextStepVal} 
                                onChange={(e) => setNextStepVal(e.target.value)}
                                className="h-14 bg-white border-hair rounded-2xl font-medium focus:ring-4 focus:ring-charcoal/5 transition-all text-ink px-6 placeholder:text-soft/30"
                            />
                            <div className="flex flex-wrap gap-2.5">
                                {["Call Client", "Draft Proposal", "Follow up", "Final Contract"].map(tag => (
                                    <button 
                                        key={tag}
                                        onClick={() => setNextStepVal(tag)}
                                        className="text-[0.625rem] font-black text-soft/60 hover:text-charcoal hover:bg-charcoal/5 hover:border-charcoal border border-hair px-4 py-2 rounded-full transition-all uppercase tracking-widest whitespace-nowrap"
                                    >
                                        + {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-10 mt-auto border-t border-hair flex items-center justify-between">
                <div className="text-[0.625rem] text-soft/40 font-black uppercase tracking-[0.2em] italic">
                  Updated: {selectedDeal?.updated_date ? differenceInDays(new Date(), parseISO(selectedDeal.updated_date)) === 0 ? "TODAY" : `${differenceInDays(new Date(), parseISO(selectedDeal.updated_date))}D AGO` : "NEVER"}
                </div>
                
                <Button
                  onClick={saveDealDetails}
                  disabled={!hasPendingDetailChanges || detailsSaving}
                  className="rounded-2xl bg-charcoal text-white hover:bg-black px-8 h-12 font-bold shadow-xl shadow-charcoal/10 transition-all active:scale-95 disabled:opacity-30"
                >
                  {detailsSaving ? "Syncing..." : "Update Details"}
                </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AddDealDialog open={isAddOpen} onOpenChange={setIsAddOpen} initialStage={addInitialStage} clients={clients} clientsLoading={clientsLoading} />

      {/* Loss Reason Dialog */}
      <Dialog open={lossModalOpen} onOpenChange={setLossModalOpen}>
          <DialogContent className="max-w-md rounded-[3rem] bg-white border-hair shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] p-12 overflow-hidden border-none ring-1 ring-hair/50">
              <DialogHeader>
                  <div className="w-16 h-16 rounded-[1.5rem] bg-red-50 flex items-center justify-center mb-8 border border-red-100 rotate-3">
                    <HugeiconsIcon icon={Delete02Icon} className="text-red-500 w-8 h-8" />
                  </div>
                  <DialogTitle className="font-serif text-4xl tracking-tight leading-none text-ink">Archive Opportunity</DialogTitle>
                  <DialogDescription className="text-soft text-lg mt-3 leading-relaxed">Why was this deal lost? Capturing context helps refine your future strategy.</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-3 pt-10">
                  {["Price point", "Communication gap", "Project scope shift", "No budget", "External factors"].map(r => (
                      <button 
                        key={r}
                        onClick={() => handleLoss(pendingLossId, r)}
                        className="w-full text-left px-7 py-5 rounded-[1.5rem] border border-hair hover:border-charcoal hover:bg-whisper transition-all duration-300 transform active:scale-[0.98] group flex items-center justify-between"
                      >
                          <span className="text-[0.9375rem] font-bold text-ink">{r}</span>
                          <div className="w-10 h-10 rounded-full bg-whisper flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                            <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="text-ink" />
                          </div>
                      </button>
                  ))}
              </div>
              
              <div className="mt-10 text-center">
                <button 
                    onClick={() => setLossModalOpen(false)}
                    className="text-[0.6875rem] font-black text-soft hover:text-ink transition-colors uppercase tracking-[0.25em] py-2 px-4"
                >
                    Keep in pipeline
                </button>
              </div>
          </DialogContent>
      </Dialog>
    </div>
  );
}