import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRoutes } from "@/lib/apiRoutes";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, CheckmarkCircle03Icon, Calendar03Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { useNavigate } from "react-router-dom";
import { shortDate } from "@/lib/format";
import { Button } from "@/components/ui/button";

function HistoryGroup({ title, tasks, clientMap }) {
  if (tasks.length === 0) return null;
  
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="font-serif text-xl text-ink mb-3">{title}</h2>
      <div className="rounded-2xl bg-white border border-hair divide-y divide-hair">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3 py-3 px-4">
            <HugeiconsIcon icon={CheckmarkCircle03Icon} className="w-4 h-4 text-success shrink-0" strokeWidth={2} />
            <div className="flex-1 min-w-0">
              <div className="text-sm line-through text-soft">{task.title}</div>
              {task.client_id && clientMap[task.client_id] && (
                <div className="text-xs text-soft/70">{clientMap[task.client_id].name}</div>
              )}
            </div>
            <div className="text-xs text-soft shrink-0">
              {task.completed_at ? shortDate(task.completed_at) : ""}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

export default function TaskHistory() {
  const navigate = useNavigate();
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: apiRoutes.getTasks });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: apiRoutes.getClients });
  const clientMap = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c])), [clients]);

  const groups = useMemo(() => {
    const completed = tasks.filter(t => t.completed);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      today: completed.filter(t => {
        if (!t.completed_at) return false;
        const d = new Date(t.completed_at);
        return d >= today;
      }),
      yesterday: completed.filter(t => {
        if (!t.completed_at) return false;
        const d = new Date(t.completed_at);
        return d >= yesterday && d < today;
      }),
      last7Days: completed.filter(t => {
        if (!t.completed_at) return false;
        const d = new Date(t.completed_at);
        return d >= last7Days && d < yesterday;
      }),
      older: completed.filter(t => {
        if (!t.completed_at) return false;
        const d = new Date(t.completed_at);
        return d < last7Days;
      }),
    };
  }, [tasks]);

  const total = groups.today.length + groups.yesterday.length + groups.last7Days.length + groups.older.length;

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <button
          onClick={() => navigate('/app/tasks')}
          className="flex items-center gap-1 text-sm text-soft hover:text-ink transition-colors mb-4"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
          Back to Tasks
        </button>
        
        <h1 className="font-serif text-4xl md:text-5xl text-ink">History</h1>
        <p className="text-soft mt-2">{total} completed tasks</p>
      </motion.div>

      {total === 0 ? (
        <div className="rounded-2xl bg-cream border border-hair p-6 text-center">
          <p className="text-soft">No completed tasks yet.</p>
          <Button onClick={() => navigate('/app/tasks')} variant="link" className="mt-2">
            Go to Tasks
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          <HistoryGroup title="Today" tasks={groups.today} clientMap={clientMap} />
          <HistoryGroup title="Yesterday" tasks={groups.yesterday} clientMap={clientMap} />
          <HistoryGroup title="Last 7 days" tasks={groups.last7Days} clientMap={clientMap} />
          <HistoryGroup title="Older" tasks={groups.older} clientMap={clientMap} />
        </div>
      )}
    </div>
  );
}