import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { AnimatePresence } from "framer-motion";
import { CheckSquare, AlertTriangle, Calendar, Hourglass } from "lucide-react";
import TaskRow from "@/components/dashboard/TaskRow";
import EmptyState from "@/components/shared/EmptyState";
import { dueBucket } from "@/lib/format";
import { useNavigate } from "react-router-dom";

function Section({ icon: Icon, title, count, tone, children, empty }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-4 h-4 ${tone || "text-ink"}`} strokeWidth={1.75} />
        <h2 className="font-serif text-2xl text-ink">{title}</h2>
        <span className="text-xs text-soft">({count})</span>
      </div>
      {count === 0 ? (
        <div className="text-sm text-soft py-4">{empty}</div>
      ) : (
        <div className="rounded-2xl bg-white border border-hair p-2 space-y-0.5">
          <AnimatePresence>{children}</AnimatePresence>
        </div>
      )}
    </section>
  );
}

export default function Tasks() {
  const navigate = useNavigate();
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: () => base44.entities.Task.list("-updated_date", 500) });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: () => base44.entities.Client.list("-updated_date", 500) });
  const clientMap = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c])), [clients]);

  const buckets = useMemo(() => {
    const open = tasks.filter(t => !t.completed);
    return {
      overdue: open.filter(t => dueBucket(t) === "overdue"),
      today: open.filter(t => dueBucket(t) === "today"),
      upcoming: open.filter(t => dueBucket(t) === "upcoming"),
    };
  }, [tasks]);

  const total = buckets.overdue.length + buckets.today.length + buckets.upcoming.length;

  return (
    <div className="space-y-10">
      <div>
        <div className="text-[11px] uppercase tracking-[0.15em] text-soft mb-2">Your list</div>
        <h1 className="font-serif text-4xl md:text-5xl text-ink">Tasks</h1>
        <p className="text-soft mt-2">{total} open · focused on what moves the needle</p>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-2xl bg-cream border border-hair">
          <EmptyState
            icon={CheckSquare}
            title="No tasks yet."
            description="Tasks in Refract always belong to a client. Open a client to add one."
            actionLabel="Browse clients"
            onAction={() => navigate("/app/clients")}
          />
        </div>
      ) : (
        <>
          <Section icon={AlertTriangle} title="Overdue" count={buckets.overdue.length} tone="text-danger" empty="Nothing overdue. You're on top of it.">
            {buckets.overdue.map(t => <TaskRow key={t.id} task={t} client={clientMap[t.client_id]} emphasizeOverdue />)}
          </Section>
          <Section icon={Calendar} title="Today" count={buckets.today.length} empty="Nothing scheduled for today.">
            {buckets.today.map(t => <TaskRow key={t.id} task={t} client={clientMap[t.client_id]} />)}
          </Section>
          <Section icon={Hourglass} title="Upcoming" count={buckets.upcoming.length} empty="Nothing queued up yet.">
            {buckets.upcoming.map(t => <TaskRow key={t.id} task={t} client={clientMap[t.client_id]} />)}
          </Section>
        </>
      )}
    </div>
  );
}