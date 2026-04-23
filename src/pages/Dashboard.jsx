// @ts-nocheck
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import TaskRow from "@/components/dashboard/TaskRow";
import PipelineSnapshot from "@/components/dashboard/PipelineSnapshot";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import EmptyState from "@/components/shared/EmptyState";
import { parseISO, isPast } from "@/utils/format";
import { format } from "date-fns";
import { apiRoutes } from "@/services/apiRoutes";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Calendar03Icon, 
  CheckmarkCircle01Icon, 
  ArrowRight01Icon, 
  Task01Icon,
  ActivityIcon,
  AlertCircleIcon,
  PipelineIcon
} from "@hugeicons/core-free-icons";

import Section from "@/components/shared/Section";

const DashboardHeader = ({ user, greeting }) => (
  <div className="mb-12">
    <div className="text-[11px] uppercase font-bold tracking-[0.2em] text-soft mb-3">{format(new Date(), "EEEE, MMMM d")}</div>
    <h1 className="font-serif text-4xl md:text-5xl text-ink leading-[1.1] tracking-tight">
      {greeting}{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}.
    </h1>
    <p className="text-soft mt-3 text-lg font-medium opacity-80">Here's what needs your attention today.</p>
  </div>
);

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

  const [expanded, setExpanded] = React.useState({
    overdue: true,
    today: true,
    pipeline: true,
    activity: true
  });

  const todayDate = new Date(); todayDate.setHours(0,0,0,0);
  const isToday = (d) => d && new Date(d).toDateString() === todayDate.toDateString();
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
      <div className="max-w-5xl mx-auto">
        <DashboardHeader user={user} greeting={greeting} />
        <div className="rounded-2xl bg-white border border-hair h-64 flex items-center justify-center shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-hair border-t-charcoal rounded-full animate-spin" />
            <div className="text-soft text-sm font-medium">Loading your universe...</div>
          </div>
        </div>
      </div>
    );
  }

  if (clientsQuery.isError) {
    return (
      <div className="max-w-5xl mx-auto">
        <DashboardHeader user={user} greeting={greeting} />
        <div className="rounded-2xl bg-white border border-hair shadow-sm">
          <EmptyState
            icon={AlertCircleIcon}
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
      <div className="max-w-5xl mx-auto">
        <DashboardHeader user={user} greeting={greeting} />
        <div className="rounded-2xl bg-white border border-hair shadow-sm">
          <EmptyState
            icon={Task01Icon}
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
    <div className="space-y-12 pb-20">
      <DashboardHeader user={user} greeting={greeting} />

      {/* Overdue */}
      {overdueTasks.length > 0 && (
        <Section
          icon={AlertCircleIcon}
          title="Overdue"
          count={overdueTasks.length}
          tone="text-danger"
          expanded={expanded.overdue}
          onToggle={() => setExpanded(p => ({ ...p, overdue: !p.overdue }))}
          empty="Nothing overdue. You're on top of it."
        >
          {overdueTasks.map(t => (
            <TaskRow key={t.id} task={t} client={clientMap[t.client_id]} emphasizeOverdue taskIndex={t.id} onEdit={() => {}} />
          ))}
        </Section>
      )}

      {/* Today */}
      <Section
        icon={Calendar03Icon}
        title="Today"
        count={todayTasks.length}
        tone="text-ink"
        expanded={expanded.today}
        onToggle={() => setExpanded(p => ({ ...p, today: !p.today }))}
        empty="You're all clear today. A quiet day is a gift."
      >
        {todayTasks.map(t => <TaskRow key={t.id} task={t} client={clientMap[t.client_id]} taskIndex={t.id} onEdit={() => {}} />)}
      </Section>

      {/* Pipeline snapshot */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={PipelineIcon} size={18} className="text-ink" />
            <h2 className="font-serif text-2xl text-ink">Pipeline</h2>
          </div>
          <button 
            onClick={() => navigate("/app/pipeline")} 
            style={{ touchAction: 'manipulation' }}
            className="text-[10px] uppercase font-bold tracking-widest text-soft hover:text-ink flex items-center gap-2 active:scale-95 transition-all group"
          >
            Open board 
            <div className="w-5 h-5 flex items-center justify-center rounded-full bg-cream group-hover:bg-charcoal group-hover:text-white transition-all">
              <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
            </div>
          </button>
        </div>
        <PipelineSnapshot deals={deals} />
      </section>

      {/* Activity */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={ActivityIcon} size={18} className="text-ink" />
            <h2 className="font-serif text-2xl text-ink">Recent activity</h2>
          </div>
        </div>
        {activities.length === 0 ? (
          <div className="rounded-2xl bg-white border border-hair p-8 shadow-sm">
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
          <div className="rounded-2xl bg-white border border-hair p-2 shadow-sm">
            <ActivityFeed activities={activities} clients={clients} />
          </div>
        )}
      </section>
    </div>
  );
}
