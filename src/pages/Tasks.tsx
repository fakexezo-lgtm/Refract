// @ts-nocheck
import React, { useMemo, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "@/services/apiRoutes";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import Section from "@/components/shared/Section";
import { CheckmarkSquareIcon, AlertCircleIcon, Calendar03Icon, Timer01Icon, Add01Icon, CheckmarkCircle03Icon } from "@hugeicons/core-free-icons";
import TaskRow from "@/components/dashboard/TaskRow";
import EmptyState from "@/components/shared/EmptyState";
import { dueBucket } from "@/utils/format";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { logActivity } from "@/services/activity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { parseDate, getLocalTimeZone, today } from "@internationalized/date";

function AddTaskDialog({ open, onOpenChange, task, clients = [] }: any) {
  const qc = useQueryClient();
  
  const [title, setTitle] = useState("");
  const [due, setDue] = useState(null);
  const [clientId, setClientId] = useState("");
  const [busy, setBusy] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);
  const [clientFocused, setClientFocused] = useState(false);

  const isEdit = !!task;
  const clientList = useMemo(() => [...clients].sort((a, b) => (a.name || a.company || "").localeCompare(b.name || b.company || "")), [clients]);

  useEffect(() => {
    if (open) {
      if (task) {
        setTitle(task.title || "");
        setClientId(task.client_id || "");
        try {
          setDue(task.due_date ? parseDate(task.due_date) : null);
        } catch (e) {
          setDue(null);
        }
      } else {
        setTitle("");
        setClientId("");
        setDue(today(getLocalTimeZone()).add({ days: 1 }));
      }
    }
  }, [open, task]);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !clientId) {
      toast.error("Task title and client are required.");
      return;
    }
    setBusy(true);
    try {
      if (isEdit) {
        await apiRoutes.updateTask(task.id, {
          client_id: clientId,
          title: title.trim(),
          due_date: due ? due.toString() : undefined
        });
        toast.success("Task updated");
      } else {
        await apiRoutes.createTask({
          client_id: clientId,
          title: title.trim(),
          due_date: due ? due.toString() : undefined,
          completed: false
        });
        toast.success("Task added");
      }

      // Small pause to let any inflight task-completion writes settle on the server
      // before we trigger a fresh refetch (prevents race condition with completed tasks)
      await new Promise((r) => setTimeout(r, 300));
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["activities"] });
      onOpenChange(false, isEdit ? task : null);
    } catch (error) {
      toast.error(error?.message || "Unable to save task.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-hair bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-ink">{isEdit ? "Edit task" : "Add task"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4 pt-2">
            <div>
              <label className="text-xs text-soft">Task</label>
              <Input 
                autoFocus 
                value={title} 
                onChange={(e: any) => setTitle(e.target.value)} 
                onFocus={() => setTitleFocused(true)}
                onBlur={() => setTitleFocused(false)}
                placeholder="Send revised proposal"
                className="mt-1 h-11 rounded-lg border-hair bg-white focus:border-charcoal transition-all" 
              />
            </div>
            
            <div>
              <label className="text-xs text-soft">Client</label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger
                  className="mt-1 h-11 rounded-lg border-hair bg-white focus:border-charcoal transition-all"
                  onFocus={() => setClientFocused(true)}
                  onBlur={() => setClientFocused(false)}
                >
                  <SelectValue placeholder="Select a client..." />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-hair bg-white">
                  {clientList.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name || c.company || "Unnamed Client"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <DatePicker 
                label="Due date"
                value={due} 
                onChange={setDue}
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-3">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!title.trim() || !clientId || busy} 
                className="rounded-full bg-charcoal hover:bg-black text-white"
              >
                {busy ? "Saving…" : isEdit ? "Save changes" : "Add task"}
              </Button>
            </div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

export default function Tasks() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [sectionExpanded, setSectionExpanded] = useState({
    overdue: true,
    today: true,
    upcoming: true
  });
  const [filterClient, setFilterClient] = useState("all");

  const { data: tasks = [], isLoading: tasksLoading, isError: tasksError, error: tasksErrorDetails } = useQuery({ 
    queryKey: ["tasks"], 
    queryFn: apiRoutes.getTasks,
    staleTime: 0,
    gcTime: 1000 * 60 * 30,    // 30 minutes
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery({ queryKey: ["clients"], queryFn: apiRoutes.getClients });
  const clientMap = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c])), [clients]);

  const buckets = useMemo(() => {
    const filterByClient = (t) => filterClient === "all" || t.client_id === filterClient;
    const open = tasks.filter(t => !t.completed && filterByClient(t));
    const completed = tasks.filter(t => t.completed && filterByClient(t));
    return {
      overdue: open.filter(t => dueBucket(t) === "overdue"),
      today: open.filter(t => dueBucket(t) === "today"),
      upcoming: open.filter(t => dueBucket(t) === "upcoming"),
      completed: completed,
    };
  }, [tasks, filterClient]);

  const handleComplete = async (taskId: string, title?: string, clientId?: string) => {
    // 1. Optimistic cache patch for immediate UI feedback
    const patch = { completed: true };
    const apply = (old: any = []) => Array.isArray(old) ? old.map((t: any) => t.id === taskId ? { ...t, ...patch } : t) : old;
    const prevTasks = qc.getQueryData(["tasks"]);
    qc.setQueryData(["tasks"], apply);
    if (clientId) {
      // Also patch the clientFull cache so ClientDetail stays in sync
      qc.setQueryData(["clientFull", clientId], (old: any) => {
        if (!old) return old;
        return { ...old, tasks: (old.tasks || []).map((t: any) => t.id === taskId ? { ...t, ...patch } : t) };
      });
    }

    // 2. Persist to Supabase
    try {
      await apiRoutes.updateTask(taskId, { completed: true });
      if (title) toast.success(`"${title}" completed`);
      if (clientId) {
        logActivity({ client_id: clientId, type: "task_completed", content: `Completed: ${title}`, metadata: {} }).catch(() => {});
      }
      // Refetch to ensure server state is authoritative
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["activities"] });
      if (clientId) qc.invalidateQueries({ queryKey: ["clientFull", clientId] });
    } catch (e) {
      // Revert optimistic update on failure
      console.error("Task completion failed:", e);
      qc.setQueryData(["tasks"], prevTasks);
      if (clientId) qc.invalidateQueries({ queryKey: ["clientFull", clientId] });
      toast.error("Failed to complete task. Please try again.");
    }
  };

  const total = buckets.overdue.length + buckets.today.length + buckets.upcoming.length;
  const hasActiveFilter = filterClient !== "all";



  useEffect(() => {
    if (buckets.completed.length > 0) {
      setCompletedExpanded(true);
    }
  }, [buckets.completed.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      
      const allTasks = [...buckets.overdue, ...buckets.today, ...buckets.upcoming];

      switch (e.key) {
        case 'j':
        case 'ArrowDown': {
          e.preventDefault();
          if (allTasks.length === 0) return;
          const current = parseInt(sessionStorage.getItem('taskIndex') || '0', 10);
          const next = current < allTasks.length - 1 ? current + 1 : 0;
          sessionStorage.setItem('taskIndex', String(next));
          const el = document.querySelector(`[data-task-index="${next}"]`);
          el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          break;
        }
        case 'k':
        case 'ArrowUp': {
          e.preventDefault();
          if (allTasks.length === 0) return;
          const current = parseInt(sessionStorage.getItem('taskIndex') || '0', 10);
          const prev = current > 0 ? current - 1 : allTasks.length - 1;
          sessionStorage.setItem('taskIndex', String(prev));
          const el = document.querySelector(`[data-task-index="${prev}"]`);
          el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          break;
        }
        case ' ': {
          e.preventDefault();
          if (allTasks.length === 0) return;
          const idx = parseInt(sessionStorage.getItem('taskIndex') || '0', 10);
          const task = allTasks[idx];
          if (task && !task.completed) {
            handleComplete(task.id, task.title, task.client_id);
          }
          break;
        }
        case 'n': {
          e.preventDefault();
          setAddTaskOpen(true);
          break;
        }
        case 'Escape':
          sessionStorage.setItem('taskIndex', '0');
          break;
        case '?':
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buckets, qc]);

  return (
    <div className="space-y-8">
      <motion.div 
        className="flex items-start justify-between gap-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[11px] uppercase tracking-[0.15em] text-soft mb-2"
          >
            Your list
          </motion.div>
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl md:text-5xl font-serif text-ink tracking-tight flex items-baseline gap-2">
              <span>Tasks</span>
              <span className="text-xs sm:text-sm font-sans font-normal text-soft whitespace-nowrap">{total} open</span>
            </h1>
            <div className="text-[12px] sm:text-[13px] text-soft mt-0.5 leading-tight">
              Focused on what moves the needle.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {clients.length > 0 && (
            <Select value={filterClient} onValueChange={setFilterClient}>
              <SelectTrigger 
                style={{ touchAction: 'manipulation' }}
                className="h-9 min-w-[130px] w-auto rounded-full border-hair bg-white text-sm text-soft active:bg-cream/50 transition-all"
              >
                <SelectValue placeholder="All clients" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-hair bg-white">
                <SelectItem value="all">All clients</SelectItem>
                {clients.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.name || c.company || "Unnamed Client"}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {clients.length > 0 && (
            <div>
              <Button 
                onClick={() => setAddTaskOpen(true)} 
                style={{ touchAction: 'manipulation' }}
                className="rounded-full bg-charcoal hover:bg-black text-white active:scale-95 transition-all"
              >
                <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-1" />
                Add task
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {tasksLoading ? (
        <div className="rounded-2xl bg-cream border border-hair p-6 text-sm text-soft">
          Loading tasks...
        </div>
      ) : tasksError ? (
        <div className="rounded-2xl bg-cream border border-hair p-6 text-sm text-danger">
          {tasksErrorDetails?.message || "Unable to load tasks right now."}
        </div>
      ) : tasks.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="rounded-2xl bg-cream border border-hair p-6"
        >
          <EmptyState
            icon={CheckmarkSquareIcon}
            title="No tasks yet."
            description="Add your first task to get started."
            actionLabel="Add task"
            onAction={() => setAddTaskOpen(true)}
          />
        </motion.div>
      ) : total === 0 && hasActiveFilter ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="rounded-2xl bg-cream border border-hair p-6"
        >
          <EmptyState
            icon={CheckmarkSquareIcon}
            title="No open tasks for this client."
            description="Try another client filter or add a new task."
            actionLabel="Clear filter"
            onAction={() => setFilterClient("all")}
          />
        </motion.div>
      ) : (
        <>
          <Section
            icon={AlertCircleIcon}
            title="Overdue"
            count={buckets.overdue.length}
            tone="text-danger"
            empty="Nothing overdue. You're on top of it."
            delay={0.3}
            expanded={sectionExpanded.overdue}
            onToggle={() => setSectionExpanded((prev) => ({ ...prev, overdue: !prev.overdue }))}
          >
            {buckets.overdue.map((t: any, idx: number) => (
              <TaskRow 
                key={t.id} 
                task={t} 
                client={clientMap[t.client_id]} 
                emphasizeOverdue 
                taskIndex={idx} 
                onEdit={(t) => { setEditTask(t); setAddTaskOpen(true); }} 
                onComplete={handleComplete}
              />
            ))}
          </Section>
          <Section
            icon={Calendar03Icon}
            title="Today"
            count={buckets.today.length}
            tone="text-ink"
            empty="Nothing scheduled for today."
            delay={0.45}
            expanded={sectionExpanded.today}
            onToggle={() => setSectionExpanded((prev) => ({ ...prev, today: !prev.today }))}
          >
            {buckets.today.map((t: any, idx: number) => (
              <TaskRow 
                key={t.id} 
                task={t} 
                client={clientMap[t.client_id]} 
                taskIndex={buckets.overdue.length + idx} 
                onEdit={(t) => { setEditTask(t); setAddTaskOpen(true); }} 
                onComplete={handleComplete}
              />
            ))}
          </Section>
          <Section
            icon={Timer01Icon}
            title="Upcoming"
            count={buckets.upcoming.length}
            tone="text-soft"
            empty="Nothing queued up yet."
            delay={0.6}
            expanded={sectionExpanded.upcoming}
            onToggle={() => setSectionExpanded((prev) => ({ ...prev, upcoming: !prev.upcoming }))}
          >
            {buckets.upcoming.map((t: any, idx: number) => (
              <TaskRow 
                key={t.id} 
                task={t} 
                client={clientMap[t.client_id]} 
                taskIndex={buckets.overdue.length + buckets.today.length + idx} 
                onEdit={(t) => { setEditTask(t); setAddTaskOpen(true); }} 
                onComplete={handleComplete}
              />
            ))}
          </Section>

          <Section
            icon={CheckmarkCircle03Icon}
            title="Completed"
            count={buckets.completed.length}
            tone="text-success"
            empty="No completed tasks yet."
            delay={0.8}
            expanded={completedExpanded}
            onToggle={() => setCompletedExpanded(!completedExpanded)}
          >
            {buckets.completed.map((t: any) => (
              <TaskRow 
                key={t.id} 
                task={t} 
                client={clientMap[t.client_id]} 
                taskIndex={-1} 
                onEdit={null} 
              />
            ))}
            {buckets.completed.length > 5 && (
              <div className="pt-2 text-center">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/app/tasks/history')}
                  className="text-xs text-soft h-8"
                >
                  View history
                </Button>
              </div>
            )}
          </Section>
        </>
      )}

      <AddTaskDialog 
        open={addTaskOpen} 
        onOpenChange={(open, editedTask) => {
          setAddTaskOpen(open);
          if (!open) setEditTask(null);
        }} 
        task={editTask} 
        clients={clients}
      />
      
    </div>
  );
}
