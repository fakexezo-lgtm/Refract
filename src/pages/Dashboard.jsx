// @ts-nocheck
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import TaskRow from "@/components/dashboard/TaskRow";
import PipelineSnapshot from "@/components/dashboard/PipelineSnapshot";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import EmptyState from "@/components/shared/EmptyState";
import { parseISO, isPast } from "@/lib/format";
import { format } from "date-fns";
import { apiRoutes } from "@/lib/apiRoutes";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: apiRoutes.getTasks });
  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: apiRoutes.getClients });
  const dealsQuery = useQuery({ queryKey: ["deals"], queryFn: apiRoutes.getDeals });
  const activitiesQuery = useQuery({ queryKey: ["activities"], queryFn: apiRoutes.getActivities });

  const tasks = tasksQuery.data ?? [];
  const clients = clientsQuery.data ?? [];
  const deals = dealsQuery.data ?? [];
  const activities = activitiesQuery.data ?? [];

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

  if (clientsQuery.isPending) {
    return (
      <div className="space-y-12">
        <div>
          <div className="text-[11px] uppercase tracking-[0.15em] text-soft mb-2">{format(new Date(), "EEEE, MMMM d")}</div>
          <h1 className="font-serif text-4xl md:text-5xl text-ink">
            {greeting}{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}.
          </h1>
          <p className="text-soft mt-2">Here's what needs your attention today.</p>
        </div>
        <div className="rounded-2xl bg-cream border border-hair">
          <div className="p-10 text-center text-soft text-sm">Loading your clients...</div>
        </div>
      </div>
    );
  }

  if (clientsQuery.isError) {
    return (
      <div className="space-y-12">
        <div>
          <div className="text-[11px] uppercase tracking-[0.15em] text-soft mb-2">{format(new Date(), "EEEE, MMMM d")}</div>
          <h1 className="font-serif text-4xl md:text-5xl text-ink">
            {greeting}{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}.
          </h1>
          <p className="text-soft mt-2">Here's what needs your attention today.</p>
        </div>
        <div className="rounded-2xl bg-cream border border-hair">
          <EmptyState
            icon={null}
            title="Unable to load clients right now"
            description="Please retry in a moment."
            actionLabel="Retry"
            onAction={() => clientsQuery.refetch()}
          />
        </div>
      </div>
    );
  }

  // If there are no clients, show a single empty state instead of multiple sections
  if (clientsQuery.isSuccess && clients.length === 0) {
    return (
      <div className="space-y-12">
        <div>
          <div className="text-[11px] uppercase tracking-[0.15em] text-soft mb-2">{format(new Date(), "EEEE, MMMM d")}</div>
          <h1 className="font-serif text-4xl md:text-5xl text-ink">
            {greeting}{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}.
          </h1>
          <p className="text-soft mt-2">Here's what needs your attention today.</p>
        </div>
        
        <div className="rounded-2xl bg-cream border border-hair">
          <EmptyState
            icon={null}
            title="Add your first client to get started"
            description="Clients are the center of Refract. Add your first one to start building their timeline."
            actionLabel="Add your first client"
            onAction={() => navigate("/app/clients")}
          />
        </div>
      </div>
    );
  }

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
              <div className="w-4 h-4 text-danger">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="font-serif text-2xl text-ink">Overdue</h2>
              <span className="text-xs text-soft">({overdueTasks.length})</span>
            </div>
          </div>
          <div className="rounded-2xl bg-[#f0e4e2]/40 border border-[#e8d4d1] p-2">
            {overdueTasks.map(t => (
              <TaskRow key={t.id} task={t} client={clientMap[t.client_id]} emphasizeOverdue taskIndex={t.id} onEdit={() => {}} />
            ))}
          </div>
        </section>
      )}

      {/* Today */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 text-ink">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl text-ink">Today</h2>
            <span className="text-xs text-soft">({todayTasks.length})</span>
          </div>
        </div>
        {todayTasks.length === 0 ? (
          <div className="rounded-2xl bg-cream border border-hair">
            <EmptyState
              icon={null}
              title="You're all clear today."
              description="Nothing scheduled. A quiet day is a gift — or use it to reach out to a client."
              actionLabel="Browse clients"
              onAction={() => navigate("/app/clients")}
              compact
            />
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-hair p-2">
            {todayTasks.map(t => <TaskRow key={t.id} task={t} client={clientMap[t.client_id]} taskIndex={t.id} onEdit={() => {}} />)}
          </div>
        )}
      </section>

      {/* Pipeline snapshot */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 text-ink">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 012-2h10a2 2 0 012 2v10M9 17v2a2 2 0 002 2h10a2 2 0 002-2v-2M9 17h10M9 17h10M9 7h10M9 7h10" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl text-ink">Pipeline</h2>
          </div>
          <button onClick={() => navigate("/app/pipeline")} className="text-xs text-soft hover:text-ink flex items-center gap-1">
            Open board <div className="w-3 h-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </button>
        </div>
        <PipelineSnapshot deals={deals} />
      </section>

      {/* Activity */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 text-ink">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 2m0 0l-4-4m2 2l2-2m2 2l4 4M4 12l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m6 0l2 2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl text-ink">Recent activity</h2>
          </div>
        </div>
        {activities.length === 0 ? (
          <div className="rounded-2xl bg-cream border border-hair">
            <EmptyState
              icon={null}
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