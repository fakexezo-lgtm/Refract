import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { AnimatePresence } from "framer-motion";
import { CheckSquare, AlertTriangle, Activity as ActivityIcon, KanbanSquare, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import TaskRow from "@/components/dashboard/TaskRow";
import PipelineSnapshot from "@/components/dashboard/PipelineSnapshot";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import EmptyState from "@/components/shared/EmptyState";
import { parseISO, isPast } from "@/lib/format";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: () => base44.entities.Task.list("-updated_date", 200) });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: () => base44.entities.Client.list("-updated_date", 200) });
  const { data: deals = [] } = useQuery({ queryKey: ["deals"], queryFn: () => base44.entities.Deal.list("-updated_date", 200) });
  const { data: activities = [] } = useQuery({ queryKey: ["activities"], queryFn: () => base44.entities.Activity.list("-created_date", 30) });

  const today = new Date(); today.setHours(0,0,0,0);
  const isToday = (d) => d && new Date(d).toDateString() === today.toDateString();
  const isOverdue = (d) => d && isPast(parseISO(d)) && !isToday(d);

  const todayTasks = tasks.filter(t => !t.completed && t.due_date && isToday(t.due_date));
  const overdueTasks = tasks.filter(t => !t.completed && t.due_date && isOverdue(t.due_date));

  const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <div className="text-[11px] uppercase tracking-[0.15em] text-soft mb-2">{format(new Date(), "EEEE, MMMM d")}</div>
        <h1 className="font-serif text-4xl md:text-5xl text-ink">
          {greeting}{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}.
        </h1>
        <p className="text-soft mt-2">Here's what needs your attention today.</p>
      </div>

      {/* Overdue — emphasized */}
      {overdueTasks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-danger" />
              <h2 className="font-serif text-2xl text-ink">Overdue</h2>
              <span className="text-xs text-soft">({overdueTasks.length})</span>
            </div>
          </div>
          <div className="rounded-2xl bg-[#f0e4e2]/40 border border-[#e8d4d1] p-2">
            <AnimatePresence>
              {overdueTasks.map(t => (
                <TaskRow key={t.id} task={t} client={clientMap[t.client_id]} emphasizeOverdue />
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Today */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-ink" strokeWidth={1.75} />
            <h2 className="font-serif text-2xl text-ink">Today</h2>
            <span className="text-xs text-soft">({todayTasks.length})</span>
          </div>
        </div>
        {todayTasks.length === 0 ? (
          <div className="rounded-2xl bg-cream border border-hair">
            <EmptyState
              icon={CheckSquare}
              title="You're all clear today."
              description="Nothing scheduled. A quiet day is a gift — or use it to reach out to a client."
              actionLabel="Browse clients"
              onAction={() => navigate("/app/clients")}
              compact
            />
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-hair p-2">
            <AnimatePresence>
              {todayTasks.map(t => <TaskRow key={t.id} task={t} client={clientMap[t.client_id]} />)}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Pipeline snapshot */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <KanbanSquare className="w-4 h-4 text-ink" strokeWidth={1.75} />
            <h2 className="font-serif text-2xl text-ink">Pipeline</h2>
          </div>
          <button onClick={() => navigate("/app/pipeline")} className="text-xs text-soft hover:text-ink flex items-center gap-1">
            Open board <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <PipelineSnapshot deals={deals} />
      </section>

      {/* Activity */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ActivityIcon className="w-4 h-4 text-ink" strokeWidth={1.75} />
            <h2 className="font-serif text-2xl text-ink">Recent activity</h2>
          </div>
        </div>
        {activities.length === 0 ? (
          <div className="rounded-2xl bg-cream border border-hair">
            <EmptyState
              icon={ActivityIcon}
              title="No activity yet."
              description="Add your first client to start building a timeline."
              actionLabel="Add a client"
              onAction={() => navigate("/app/clients")}
              compact
            />
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-hair p-2">
            <ActivityFeed activities={activities} clients={clients} />
          </div>
        )}
      </section>
    </div>
  );
}