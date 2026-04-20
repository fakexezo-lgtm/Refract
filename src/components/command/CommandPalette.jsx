import React, { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import { apiRoutes } from "@/lib/apiRoutes";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, UserIcon, CheckmarkSquareIcon, Add01Icon, ArrowRight01Icon, Plus } from "@hugeicons/core-free-icons";
import Avatar from "@/components/shared/Avatar";

export default function CommandPalette({ open, onOpenChange, onQuickAddClient }) {
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const navigate = useNavigate();

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: apiRoutes.getClients,
    enabled: open,
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list("-updated_date", 100),
    enabled: open,
  });

  useEffect(() => { if (open) { setQ(""); setCursor(0); } }, [open]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    const out = [];
    out.push({ kind: "action", id: "new-client", label: "Create new client", icon: Plus, run: () => { onOpenChange(false); onQuickAddClient?.(); } });
    if (s) {
      clients.filter(c => c.name?.toLowerCase().includes(s) || c.company?.toLowerCase().includes(s)).slice(0, 6).forEach(c => {
        out.push({ kind: "client", id: c.id, label: c.name, sub: c.company, client: c, run: () => { onOpenChange(false); navigate(`/app/clients/${c.id}`); } });
      });
      tasks.filter(t => !t.completed && t.title?.toLowerCase().includes(s)).slice(0, 5).forEach(t => {
        const c = clients.find(c => c.id === t.client_id);
        out.push({ kind: "task", id: t.id, label: t.title, sub: c?.name, run: () => { onOpenChange(false); if (c) navigate(`/app/clients/${c.id}`); } });
      });
    } else {
      clients.slice(0, 6).forEach(c => {
        out.push({ kind: "client", id: c.id, label: c.name, sub: c.company, client: c, run: () => { onOpenChange(false); navigate(`/app/clients/${c.id}`); } });
      });
    }
    return out;
  }, [q, clients, tasks, navigate, onOpenChange, onQuickAddClient]);

  useEffect(() => { if (cursor >= results.length) setCursor(0); }, [results.length, cursor]);

  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor(c => Math.min(c + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); results[cursor]?.run(); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-2xl border-hair bg-white shadow-2xl">
        <div className="flex items-center gap-3 px-4 h-14 border-b border-hair">
          <HugeiconsIcon icon={Search01Icon} className="w-4 h-4 text-soft" />
          <input
            autoFocus
            value={q}
            onChange={(e) => { setQ(e.target.value); setCursor(0); }}
            onKeyDown={onKey}
            placeholder="Search clients, tasks, or type a command…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-soft"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-whisper border border-hair text-soft">esc</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto scrollbar-minimal py-2">
          {results.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-soft">No results. Try another query.</div>
          )}
          {results.map((r, i) => (
            <button
              key={`${r.kind}-${r.id}`}
              onMouseEnter={() => setCursor(i)}
              onClick={r.run}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${i === cursor ? "bg-cream" : ""}`}
            >
              {r.kind === "client" ? (
                <Avatar name={r.label} color={r.client?.avatar_color} size="sm" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-whisper border border-hair flex items-center justify-center">
                  {r.kind === "task" ? <HugeiconsIcon icon={CheckmarkSquareIcon} className="w-4 h-4 text-ink" strokeWidth={1.75} /> :
                   r.kind === "action" ? <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 text-ink" strokeWidth={1.75} /> :
                   <HugeiconsIcon icon={UserIcon} className="w-4 h-4 text-ink" strokeWidth={1.75} />}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-ink truncate">{r.label}</div>
                {r.sub && <div className="text-xs text-soft truncate">{r.sub}</div>}
              </div>
              <span className="text-[10px] uppercase tracking-wider text-soft">{r.kind}</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="w-3.5 h-3.5 text-soft" />
            </button>
          ))}
        </div>
        <div className="px-4 h-9 border-t border-hair flex items-center justify-between text-[11px] text-soft">
          <span>Navigate with ↑ ↓ · Enter to open</span>
          <span>⌘K to toggle</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}