import React, { useMemo, useState, memo, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "@/lib/apiRoutes";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { STAGES } from "@/lib/constants";
import { useNavigate } from "react-router-dom";
import Avatar from "@/components/shared/Avatar";
import { motion, AnimatePresence } from "framer-motion";
import { logActivity } from "@/lib/activity";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Add01Icon, 
  SearchIcon, 
  FilterIcon, 
  ActivityIcon, 
  FolderKanbanIcon, 
  CheckmarkSquareIcon, 
  Cancel01Icon, 
  ArrowRight01Icon,
  DashboardSquareIcon,
  MoreVerticalIcon,
  Tick01Icon,
  Delete02Icon
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
import AddDealDialog from "@/components/pipeline/AddDealDialog";
import { differenceInDays, parseISO } from "date-fns";

const WIN_CONFETTI_COLORS = ["#1f1f1f", "#f6f7ed", "#efa36a", "#6b8c5f", "#a67c52"];

function fireConfetti(origin = { y: 0.4 }) {
  confetti({ particleCount: 60, spread: 70, origin, colors: WIN_CONFETTI_COLORS });
}

// Memoized Card for stable drag animation
const DealCard = memo(({ deal, client, onClick, isDragging }: { deal: any; client: any; onClick: () => void; isDragging: boolean }) => {
  const daysSinceUpdate = deal.updated_date ? differenceInDays(new Date(), parseISO(deal.updated_date)) : 0;
  const isStale = daysSinceUpdate >= 5;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group bg-white p-4 rounded-xl border border-hair shadow-sm select-none relative transition-all",
        isDragging ? "shadow-xl border-[#efa36a] z-50 ring-2 ring-[#efa36a]/20" : "hover:border-[#efa36a]/40 hover:shadow-md",
        isStale && !isDragging && "bg-red-50/20"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 truncate">
          {client && <Avatar name={client.name} size="xs" color={client.avatar_color} className="" />}
          <span className="text-[11px] text-soft truncate font-medium">{client?.name || "No Client"}</span>
        </div>
        <div className={cn(
            "text-[9px] font-bold uppercase tracking-tight px-1 rounded-sm",
            isStale ? "text-red-500" : "text-soft/60"
        )}>
            {daysSinceUpdate === 0 ? "Today" : `${daysSinceUpdate}d ago`}
        </div>
      </div>
      <div className="text-sm font-semibold text-ink mb-1 group-hover:text-charcoal transition-colors">{deal.title}</div>
      <div className="text-xs font-bold text-ink">{formatCurrency(deal.value)}</div>
      
      {deal.next_step && (
          <div className="mt-3 pt-3 border-t border-hair/50 flex items-center gap-2 text-[11px] text-soft">
              <HugeiconsIcon icon={ArrowRight01Icon} size={12} className="text-[#efa36a]" />
              <span className="truncate">Next step: {deal.next_step}</span>
          </div>
      )}
    </div>
  );
});

export default function Pipeline() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDealId, setSelectedDealId] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addInitialStage, setAddInitialStage] = useState("lead");
  
  // Controlled field for next step suggestions
  const [nextStepVal, setNextStepVal] = useState("");
  const [dealValueVal, setDealValueVal] = useState("0");
  const [detailsSaving, setDetailsSaving] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({ minPrice: '', maxPrice: '' });

  const activeFilterCount = (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0);

  // Loss Reason logic
  const [lossModalOpen, setLossModalOpen] = useState(false);
  const [pendingLossId, setPendingLossId] = useState(null);

  const { data: deals = [], isLoading: dealsLoading } = useQuery({ 
    queryKey: ["deals"], 
    queryFn: apiRoutes.getDeals 
  });
  
  console.log("Pipeline - deals:", deals, "loading:", dealsLoading);
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"], 
    queryFn: apiRoutes.getClients 
  });
  const clientMap = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c])), [clients]);

  const selectedDeal = useMemo(() => deals.find(d => d.id === selectedDealId), [deals, selectedDealId]);

  useEffect(() => {
    if (selectedDeal) setNextStepVal(selectedDeal.next_step || "");
  }, [selectedDeal]);
  
  useEffect(() => {
    if (selectedDeal) {
      setDealValueVal(String(selectedDeal.value ?? 0));
    }
  }, [selectedDeal]);

  // Metrics (Always calculated from all deals)
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
    return deals.filter(d => {
        const q = searchQuery.toLowerCase();
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
      toast.info("Deal marked as lost");
      setLossModalOpen(false);
      setPendingLossId(null);
    } catch (error) {
      toast.error(error?.message || "Failed to mark deal as lost.");
    }
  };

  const onDragEnd = async (res) => {
    const { source, destination, draggableId } = res;
    if (!destination || source.droppableId === destination.droppableId) return;
    
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

  const updateDeal = async (id, data) => {
    try {
      await apiRoutes.updateDeal(id, data);
      qc.invalidateQueries({ queryKey: ["deals"] });
      return true;
    } catch (error) {
      toast.error(error?.message || "Unable to update deal.");
      return false;
    }
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
      toast.success("Deal details saved");
    } catch (error) {
      toast.error(error?.message || "Failed to save deal details.");
    } finally {
      setDetailsSaving(false);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-8 pb-4">
      {/* 1. Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="font-serif text-4xl text-ink">Pipeline</h1>
          <p className="text-soft text-sm mt-1">Identify stalled deals and act quickly</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <HugeiconsIcon icon={SearchIcon} className="absolute left-3 top-1/2 -translate-y-1/2 text-soft w-4 h-4" />

            <Input 
              placeholder="Find deal..." 
              className="pl-9 w-64 bg-white border-hair rounded-xl h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
    
                <Button variant="outline" className={cn("border-hair bg-white h-11 px-4 rounded-xl gap-2", activeFilterCount > 0 && "border-charcoal bg-charcoal/5")}>
                    <HugeiconsIcon icon={FilterIcon} className="w-4 h-4" />
                    <span className="text-xs font-bold">Filter {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 shadow-2xl rounded-2xl border-hair bg-white p-6" align="end">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-ink">Filters</h4>
                        <button 
                            onClick={() => setFilters({ minPrice: '', maxPrice: '' })}
                            className="text-xs text-soft hover:text-charcoal transition-colors px-2 py-1 hover:bg-whisper rounded"
                        >
                            Reset
                        </button>
                    </div>
                    


                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-soft">Price Range</label>
                        <div className="flex items-center gap-2">
                            <Input 
                                type="number" 
                                placeholder="Min" 
                                value={filters.minPrice} 
                                onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                                className="h-10 text-xs rounded-xl bg-whisper/20 border-hair"
                            />
                            <span className="text-soft">—</span>
                            <Input 
                                type="number" 
                                placeholder="Max" 
                                value={filters.maxPrice} 
                                onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                                className="h-10 text-xs rounded-xl bg-whisper/20 border-hair"
                            />
                        </div>
                    </div>
                </div>
            </PopoverContent>
          </Popover>

          {/* @ts-ignore */}
          <Button onClick={() => openAdd()} className="bg-charcoal text-white hover:bg-black gap-2 h-11 px-6 rounded-xl font-bold">
            <HugeiconsIcon icon={Add01Icon} className="w-4 h-4" /> Add Deal
          </Button>
        </div>
      </div>

      {/* 2. Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-shrink-0">
        <KPIItem 
            label="Pipeline Value" 
            value={formatCurrency(metrics.totalValue)} 
            icon={<HugeiconsIcon icon={FolderKanbanIcon} className="text-charcoal" />} 
            primary={false}
            context={null}
        />
        <KPIItem 
            label="Average Size" 
            value={formatCurrency(metrics.avgSize)} 
            icon={<HugeiconsIcon icon={DashboardSquareIcon} className="text-charcoal" />} 
            primary={false}
            context={null}
        />
        <KPIItem 
            label="Win Rate" 
            value={`${metrics.convRate.toFixed(1)}%`} 
            context={`${metrics.wonCount} won`}
            icon={<HugeiconsIcon icon={Tick01Icon} className="text-charcoal" />} 
            primary={false}
        />
      </div>      {/* 3. Board */}
      <div className="flex-1 min-h-0 overflow-x-auto pb-6 scrollbar-hide relative group">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 h-full min-w-max pb-2">
              {STAGES.map((stage) => {
                const columnDeals = grouped[stage.id];
                const columnValue = columnDeals.reduce((sum, d) => sum + (d.value || 0), 0);
                
                return (
                  <Droppable droppableId={stage.id} key={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "w-[280px] md:w-[320px] flex-shrink-0 rounded-2xl flex flex-col h-full border border-hair transition-colors bg-white/50",
                          snapshot.isDraggingOver ? "bg-[#fefdf8] border-[#efa36a]/30" : ""
                        )}
                      >
                        {/* Column Header */}
                        <div className="p-4 border-b border-hair flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-sm z-10 rounded-t-2xl">
                          <div className="flex items-center gap-2">
                             <span className="text-xs font-bold text-ink/40 bg-whisper px-1.5 py-0.5 rounded">{columnDeals.length}</span>
                             <h3 className="text-sm font-bold uppercase tracking-wider text-ink">{stage.label}</h3>
                          </div>
                          <div className="text-xs font-semibold text-ink/60">{formatCurrency(columnValue)}</div>
                        </div>

                        {/* Column Body */}
                        <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
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
                          {provided.placeholder}
                          
                          {columnDeals.length === 0 && !snapshot.isDraggingOver && (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                 <p className="text-[10px] font-bold text-soft/30 uppercase tracking-[0.2em]">No deals yet</p>
                                 <p className="text-[10px] text-soft/40 mt-1 mb-4">Start by adding your first deal</p>
                     
                                 <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => openAdd(stage.id)}
                                    className="text-soft border-hair hover:text-ink text-[11px] rounded-xl px-4 h-9 gap-1.5 bg-white shadow-sm"
                                 >
                                     <HugeiconsIcon icon={Add01Icon} size={14} /> Add deal
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

      {/* 4. Deal Detail Drawer */}
      <Sheet open={!!selectedDealId} onOpenChange={(open) => !open && setSelectedDealId(null)}>
        <SheetContent className="sm:max-w-md bg-white p-0">
          <div className="p-8 h-full flex flex-col">
            <SheetHeader className="mb-10">
                <div className="flex items-center justify-between">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[#efa36a] font-black">Opportunity</div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-hair p-1.5 w-44">
                            <DropdownMenuItem 
                                onClick={async () => {
                                    if (confirm("Delete this deal?")) {
                                        await apiRoutes.deleteDeal(selectedDeal.id);
                                        qc.invalidateQueries({ queryKey: ["deals"] });
                                        setSelectedDealId(null);
                                        toast.info("Deal deleted permanently");
                                    }
                                }}
                                className="text-red-500 focus:text-red-500 focus:bg-red-50 rounded-lg cursor-pointer font-medium"
                            >
                                <HugeiconsIcon icon={Delete02Icon} size={16} />
                                <span>Delete deal</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <SheetTitle className="font-serif text-3xl mt-2 leading-tight">{selectedDeal?.title}</SheetTitle>
                <SheetDescription className="text-soft text-sm font-medium">
                  {clientMap[selectedDeal?.client_id]?.name || "Select Client"}
                </SheetDescription>
            </SheetHeader>
          
            <div className="flex-1 space-y-10 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-8">
                    {/* Stage - Primary Priority Control (TOP) */}
                    <div className="space-y-3">
                        <label className="text-[10px] uppercase font-black text-ink tracking-widest">Current Stage</label>
                        <Select 
                            value={selectedDeal?.stage} 
                            onValueChange={async (val) => {
                                await updateDeal(selectedDeal.id, { stage: val });
                                if (val === "won") fireConfetti();
                            }}
                        >
                            <SelectTrigger className="h-12 rounded-xl border-hair bg-white font-semibold text-charcoal">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-hair shadow-2xl">
                                {STAGES.map(s => (
                                    <SelectItem key={s.id} value={s.id} className="rounded-lg py-2.5">{s.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Value - Reduced Weight */}
                    <div className="space-y-3">
                        <label className="text-[10px] uppercase font-black text-ink tracking-widest">Deal Value</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-soft font-bold">$</span>
                            <Input 
                                type="number"
                                value={dealValueVal}
                                onChange={(e) => setDealValueVal(e.target.value)}
                                className="h-12 pl-8 pr-4 bg-whisper/20 border-hair rounded-xl font-serif text-xl"
                            />
                        </div>
                    </div>

                    {/* Next Action */}
                    <div className="space-y-4">
                        <label className="text-[10px] uppercase font-black text-ink tracking-widest">Next Action</label>
                        <div className="space-y-4">
                            <Input 
                                placeholder="What needs to happen next?" 
                                value={nextStepVal} 
                                onChange={(e) => setNextStepVal(e.target.value)}
                                className="h-12 bg-white border-hair rounded-xl ring-offset-background focus-visible:ring-2 focus-visible:ring-charcoal"
                            />
                            <div className="flex flex-wrap gap-2">
                                {["Call Client", "Send Proposal", "Follow up", "Contract Signoff"].map(tag => (
                                    <button 
                                        key={tag}
                                        onClick={() => {
                                            setNextStepVal(tag);
                                        }}
                                        className="text-[10px] font-extrabold text-soft/80 hover:text-charcoal hover:bg-charcoal/5 border border-hair px-3 py-1.5 rounded-full transition-all"
                                    >
                                        + {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
          
                      <Button
                        onClick={saveDealDetails}
                        disabled={!hasPendingDetailChanges || detailsSaving}
                        className="rounded-xl bg-charcoal text-white hover:bg-black px-6"
                      >
                        {detailsSaving ? "Saving..." : "Save Updates"}
                      </Button>
                    </div>
                </div>
            </div>

            <div className="pt-8 mt-auto border-t border-hair">
                <div className="text-[10px] text-soft/60 font-medium text-center uppercase tracking-widest">
                    Last activity: {selectedDeal?.updated_date ? differenceInDays(new Date(), parseISO(selectedDeal.updated_date)) === 0 ? "Today" : `${differenceInDays(new Date(), parseISO(selectedDeal.updated_date))} days ago` : "None"}
                </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* 5. Add Deal Dialog */}
      <AddDealDialog open={isAddOpen} onOpenChange={setIsAddOpen} initialStage={addInitialStage} clients={clients} clientsLoading={clientsLoading} />

      {/* 6. Loss Reason Dialog */}
      <Dialog open={lossModalOpen} onOpenChange={setLossModalOpen}>
          <DialogContent className="max-w-sm rounded-3xl bg-white border-hair shadow-2xl p-8">
              <DialogHeader>
                  <DialogTitle className="font-serif text-2xl">Capture Loss Reason</DialogTitle>
                  <DialogDescription className="text-soft">Why was this deal lost? Helps improve your business.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-3 pt-6">
                  {["Price too high", "No response", "Bad timing", "Product fit", "Other"].map(r => (
                      <button 
                        key={r}
                        onClick={() => handleLoss(pendingLossId, r)}
                        className="w-full text-left px-5 py-5 rounded-2xl border border-hair hover:border-charcoal hover:bg-whisper transition-all text-sm font-bold flex items-center justify-between group"
                      >
                          {r}
                          <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                  ))}
              </div>
              <DialogFooter className="mt-4">
                  {/* @ts-ignore */}
                  <Button variant="ghost" onClick={() => setLossModalOpen(false)} className="w-full rounded-2xl text-soft">Cancel</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}

function KPIItem({ label, value, icon, primary = false, context = null }: { label: string; value: string; icon: any; primary?: boolean; context?: string | null }) {
    return (
        <div className={cn(
            "p-6 rounded-[2rem] border",
            primary ? "bg-charcoal text-white border-charcoal shadow-2xl ring-8 ring-charcoal/5" : "bg-white text-ink border-hair shadow-sm"
        )}>
            <div className="flex items-center justify-between mb-5">
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    primary ? "bg-white/10" : "bg-whisper"
                )}>
                    {icon}
                </div>
                {context && <span className={cn("text-[10px] font-black uppercase tracking-widest", primary ? "text-white/40" : "text-soft/40")}>{context}</span>}
            </div>
            <div className={cn("text-[11px] uppercase font-black tracking-[0.15em]", primary ? "text-white/60" : "text-soft")}>{label}</div>
            <div className={cn("text-3xl font-serif mt-1", primary ? "text-white" : "text-ink")}>{value}</div>
        </div>
    );
}