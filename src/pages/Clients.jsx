import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { SearchIcon, Add01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ClientRow from "@/components/clients/ClientRow";
import QuickAddClientDialog from "@/components/clients/QuickAddClientDialog";
import NewClientChoiceDialog from "@/components/clients/NewClientChoiceDialog";
import ImportClientsDialog from "@/components/clients/ImportClientsDialog";
import BulkActionsBar from "@/components/clients/BulkActionsBar";
import { Checkbox } from "@/components/ui/checkbox";
import EmptyState from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";
import { apiRoutes } from "@/lib/apiRoutes";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "lead", label: "Lead" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
];

export default function Clients() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  
  useEffect(() => {
    setPage(1);
  }, [filter, q]);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: apiRoutes.getClients,
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: apiRoutes.getTasks,
  });

  const nextTaskByClient = useMemo(() => {
    const map = {};
    tasks.filter(t => !t.completed).forEach(t => {
      if (!map[t.client_id]) map[t.client_id] = t;
    });
    return map;
  }, [tasks]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return clients.filter(c => {
      if (filter !== "all" && c.status !== filter) return false;
      if (!s) return true;
      return c.name?.toLowerCase().includes(s) || c.company?.toLowerCase().includes(s) || c.email?.toLowerCase().includes(s);
    });
  }, [clients, q, filter]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.15em] text-soft mb-2">Your network</div>
          <h1 className="font-serif text-4xl md:text-5xl text-ink">Clients</h1>
          <p className="text-soft mt-2">{clients.length} total · {clients.filter(c => c.status === "active").length} active</p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <Button 
            variant="ghost" 
            onClick={() => {
              setIsSelectMode(!isSelectMode);
              setSelectedIds([]);
            }} 
            className={cn(
              "rounded-full px-5 h-11 border border-hair",
              isSelectMode ? "bg-charcoal text-white hover:bg-black" : "bg-white text-soft hover:text-ink"
            )}
          >
            {isSelectMode ? "Cancel selection" : "Select"}
          </Button>
          <Button onClick={() => setChoiceOpen(true)} className="rounded-full bg-charcoal hover:bg-black text-white h-11 px-5">
            <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-1" /> New client
          </Button>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <HugeiconsIcon icon={SearchIcon} className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-soft" />
          <Input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search by name, company, or email"
            className="h-12 pl-11 rounded-full bg-white border-hair"
          />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-full bg-white border border-hair self-start">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "relative px-4 h-10 rounded-full text-sm transition",
                filter === f.id ? "text-white" : "text-soft hover:text-ink"
              )}
            >
              {filter === f.id && (
                <motion.div layoutId="filter-pill" className="absolute inset-0 bg-charcoal rounded-full" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              )}
              <span className="relative">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {isSelectMode && filtered.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-cream/50 rounded-xl border border-hair animate-in fade-in slide-in-from-top-2 duration-300">
          <Checkbox 
            id="select-all" 
            checked={selectedIds.length === filtered.length && filtered.length > 0} 
            onCheckedChange={(checked) => {
              if (checked) setSelectedIds(filtered.map(c => c.id));
              else setSelectedIds([]);
            }}
          />
          <label htmlFor="select-all" className="text-sm font-medium text-ink cursor-pointer select-none">
            Select all {filtered.length} visible clients
          </label>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-white border border-hair animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        clients.length === 0 ? (
          <div className="rounded-2xl bg-cream border border-hair">
            <EmptyState
              icon={UserIcon}
              title="No clients yet."
              description="Clients are the center of Refract. Add your first one to start building their timeline."
              actionLabel="Add your first client"
              onAction={() => setChoiceOpen(true)}
            />
          </div>
        ) : (
          <div className="rounded-2xl bg-cream border border-hair">
            <EmptyState icon={SearchIcon} title="No matches." description="Try a different search or clear the filter." compact />
          </div>
        )
      ) : (
        <div className="space-y-6">
          <div className="grid gap-2">
            <AnimatePresence>
              {filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map(c => (
                <ClientRow 
                  key={c.id} 
                  client={c} 
                  nextTask={nextTaskByClient[c.id]} 
                  isSelectMode={isSelectMode}
                  isSelected={selectedIds.includes(c.id)}
                  onSelectChange={(checked) => {
                    if (checked) setSelectedIds([...selectedIds, c.id]);
                    else setSelectedIds(selectedIds.filter(id => id !== c.id));
                  }}
                />
              ))}
            </AnimatePresence>
          </div>

          {filtered.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="rounded-xl border-hair h-10 px-4"
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.ceil(filtered.length / ITEMS_PER_PAGE) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={cn(
                      "w-10 h-10 rounded-xl text-sm font-medium transition",
                      page === i + 1 
                        ? "bg-charcoal text-white" 
                        : "text-soft hover:bg-cream hover:text-ink"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={page === Math.ceil(filtered.length / ITEMS_PER_PAGE)}
                onClick={() => setPage(page + 1)}
                className="rounded-xl border-hair h-10 px-4"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {isSelectMode && selectedIds.length > 0 && (
          <BulkActionsBar 
            selectedIds={selectedIds} 
            onClear={() => {
              setSelectedIds([]);
              setIsSelectMode(false);
            }} 
          />
        )}
      </AnimatePresence>

      <NewClientChoiceDialog 
        open={choiceOpen} 
        onOpenChange={setChoiceOpen} 
        onChooseManual={() => setAddOpen(true)}
        onChooseImport={() => setImportOpen(true)}
      />
      <QuickAddClientDialog open={addOpen} onOpenChange={setAddOpen} />
      <ImportClientsDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}