import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { SearchIcon, Add01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ClientRow from "@/components/clients/ClientRow";
import QuickAddClientDialog from "@/components/clients/QuickAddClientDialog";
import EmptyState from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "lead", label: "Lead" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
];

export default function Clients() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list("-updated_date", 500),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list("-due_date", 500),
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
        <Button onClick={() => setAddOpen(true)} className="rounded-full bg-charcoal hover:bg-black text-white h-11 px-5 self-start md:self-auto">
          <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-1" /> New client
        </Button>
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
              onAction={() => setAddOpen(true)}
            />
          </div>
        ) : (
          <div className="rounded-2xl bg-cream border border-hair">
            <EmptyState icon={SearchIcon} title="No matches." description="Try a different search or clear the filter." compact />
          </div>
        )
      ) : (
        <div className="grid gap-2">
          <AnimatePresence>
            {filtered.map(c => <ClientRow key={c.id} client={c} nextTask={nextTaskByClient[c.id]} />)}
          </AnimatePresence>
        </div>
      )}

      <QuickAddClientDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}