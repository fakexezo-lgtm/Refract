import React, { useMemo, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "@/lib/apiRoutes";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkSquareIcon, AlertCircleIcon, Calendar03Icon, Timer01Icon, AddIcon, ArrowDown01Icon, ArrowRight01Icon, CheckmarkCircle03Icon } from "@hugeicons/core-free-icons";
import TaskRow from "@/components/dashboard/TaskRow";
import EmptyState from "@/components/shared/EmptyState";
import { dueBucket } from "@/lib/format";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { logActivity } from "@/lib/activity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Cast JS components to any to bypass TS errors
const ButtonAny = Button as any;
const InputAny = Input as any;
const DialogAny = Dialog as any;
const DialogContentAny = DialogContent as any;
const DialogHeaderAny = DialogHeader as any;
const DialogTitleAny = DialogTitle as any;
const SelectAny = Select as any;
const SelectContentAny = SelectContent as any;
const SelectItemAny = SelectItem as any;
const SelectTriggerAny = SelectTrigger as any;
const SelectValueAny = SelectValue as any;

function Section({ icon: Icon, title, count, tone = "text-ink", children, empty, delay = 0, expanded = true, onToggle = () => {} }: any) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <button onClick={onToggle} className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
        <HugeiconsIcon icon={expanded ? ArrowDown01Icon : ArrowRight01Icon} className="w-4 h-4 text-soft" />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.1, type: "spring", stiffness: 500, damping: 30 }}
        >
          <HugeiconsIcon icon={Icon} className={'w-4 h-4 ' + (tone || "text-ink")} strokeWidth={1.75} />
        </motion.div>
        <h2 className="font-serif text-2xl text-ink">{title}</h2>
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.15 }}
          className="text-xs text-soft"
        >
          ({count})
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          count === 0 ? (
            <motion.div
              key={`${title}-empty`}
              initial={{ opacity: 0, height: 0, overflow: "hidden" }}
              animate={{ opacity: 1, height: "auto", transitionEnd: { overflow: "visible" } }}
              exit={{ opacity: 0, height: 0, overflow: "hidden" }}
              transition={{ duration: 0.3 }}
              className="text-sm text-soft py-2"
            >
              {empty}
            </motion.div>
          ) : (
            <motion.div
              key={`${title}-items`}
              initial={{ opacity: 0, height: 0, overflow: "hidden" }}
              animate={{ opacity: 1, height: "auto", transitionEnd: { overflow: "visible" } }}
              exit={{ opacity: 0, height: 0, overflow: "hidden" }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <AnimatePresence>{children}</AnimatePresence>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function AddTaskDialog({ open, onOpenChange, task, clients = [] }: any) {
  const qc = useQueryClient();
  
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
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
        setDue(task.due_date || "");
      } else {
        setTitle("");
        setClientId("");
        const t = new Date(); t.setDate(t.getDate() + 1);
        setDue(t.toISOString().slice(0, 10));
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
          due_date: due || undefined
        });
        toast.success("Task updated");
      } else {
        await apiRoutes.createTask({
          client_id: clientId,
          title: title.trim(),
          due_date: due || undefined,
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
    <DialogAny open={open} onOpenChange={onOpenChange}>
      <DialogContentAny className="max-w-md rounded-2xl border-hair bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <DialogHeaderAny>
            <DialogTitleAny className="font-serif text-2xl text-ink">{isEdit ? "Edit task" : "Add task"}</DialogTitleAny>
          </DialogHeaderAny>
          <form onSubmit={submit} className="space-y-4 pt-2">
            <motion.div
              animate={{ scale: titleFocused ? 1.02 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <label className="text-xs text-soft">Task</label>
              <InputAny 
                autoFocus 
                value={title} 
                onChange={(e: any) => setTitle(e.target.value)} 
                onFocus={() => setTitleFocused(true)}
                onBlur={() => setTitleFocused(false)}
                placeholder="Send revised proposal"
                className={"mt-1 h-11 rounded-lg border-hair bg-white transition-all duration-200" + (titleFocused ? " border-ink/60 shadow-sm" : "")} 
              />
            </motion.div>
            
            <motion.div
              animate={{ scale: clientFocused ? 1.02 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <label className="text-xs text-soft">Client</label>
              <SelectAny value={clientId} onValueChange={setClientId}>
                <SelectTriggerAny
                  className={"mt-1 h-11 rounded-lg border-hair bg-white transition-all duration-200" + (clientFocused ? " border-ink/60 shadow-sm" : "")}
                  onFocus={() => setClientFocused(true)}
                  onBlur={() => setClientFocused(false)}
                >
                  <SelectValueAny placeholder="Select a client..." />
                </SelectTriggerAny>
                <SelectContentAny className="rounded-lg border-hair bg-white">
                  {clientList.map((c: any) => (
                    <SelectItemAny key={c.id} value={c.id}>{c.name || c.company || "Unnamed Client"}</SelectItemAny>
                  ))}
                </SelectContentAny>
              </SelectAny>
            </motion.div>
            
            <div>
              <label className="text-xs text-soft">Due date</label>
              <InputAny 
                type="date" 
                value={due} 
                onChange={(e: any) => setDue(e.target.value)} 
                className="mt-1 h-11 rounded-lg border-hair bg-white" 
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <ButtonAny type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">
                  Cancel
                </ButtonAny>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <ButtonAny 
                  type="submit" 
                  disabled={!title.trim() || !clientId || busy} 
                  className="rounded-full bg-charcoal hover:bg-black text-white"
                >
                  {busy ? "Saving…" : isEdit ? "Save changes" : "Add task"}
                </ButtonAny>
              </motion.div>
            </div>
          </form>
        </motion.div>
      </DialogContentAny>
    </DialogAny>
  );
}

export default function Tasks() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [showHints, setShowHints] = useState(false);
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

  const total = buckets.overdue.length + buckets.today.length + buckets.upcoming.length;
  const hasActiveFilter = filterClient !== "all";

  useEffect(() => {
    const timer = setTimeout(() => setShowHints(true), 2000);
    return () => clearTimeout(timer);
  }, []);

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
            const updateData = { completed: true, completed_at: new Date().toISOString() };

            // Update cache directly — do NOT invalidate (would race with fresh fetch)
            const applyToCache = (key: any, patch: any) => {
              qc.setQueryData(key, (old: any = []) => {
                if (!Array.isArray(old)) return old;
                return old.map((t: any) => (t.id === task.id ? { ...t, ...patch } : t));
              });
            };

            applyToCache(["tasks"], updateData);
            if (task.client_id) applyToCache(["tasks", task.client_id], updateData);

            apiRoutes.updateTask(task.id, updateData)
              .then((saved: any) => {
                const final = saved || { ...task, ...updateData };
                applyToCache(["tasks"], final);
                if (task.client_id) applyToCache(["tasks", task.client_id], final);
                if (task.client_id) {
                  logActivity({ client_id: task.client_id, type: "task_completed", content: `Completed: ${task.title}`, metadata: {} }).catch(() => {});
                }
                qc.invalidateQueries({ queryKey: ["activities"] });
              })
              .catch(() => {
                applyToCache(["tasks"], { completed: false, completed_at: null });
                if (task.client_id) applyToCache(["tasks", task.client_id], { completed: false, completed_at: null });
                toast.error("Failed to complete task");
              });

            toast.success(`"${task.title}" completed`, { duration: 3000 });
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
          setShowHints(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buckets, qc]);

  return (
    <div className="space-y-6">
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
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="font-serif text-4xl md:text-5xl text-ink"
          >
            Tasks
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-soft mt-2"
          >
            {total} open · focused on what moves the needle
          </motion.p>
        </div>
        <div className="flex items-center gap-2">
          {clients.length > 0 && (
            <SelectAny value={filterClient} onValueChange={setFilterClient}>
              <SelectTriggerAny className="h-9 min-w-[130px] w-auto rounded-full border-hair bg-white text-sm text-soft">
                <SelectValueAny placeholder="All clients" />
              </SelectTriggerAny>
              <SelectContentAny className="rounded-xl border-hair bg-white">
                <SelectItemAny value="all">All clients</SelectItemAny>
                {clients.map((c: any) => (
                  <SelectItemAny key={c.id} value={c.id}>{c.name || c.company || "Unnamed Client"}</SelectItemAny>
                ))}
              </SelectContentAny>
            </SelectAny>
          )}
          {clients.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25, duration: 0.3 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <ButtonAny onClick={() => setAddTaskOpen(true)} className="rounded-full bg-charcoal hover:bg-black text-white">
                <HugeiconsIcon icon={AddIcon} className="w-4 h-4 mr-1" />
                Add task
              </ButtonAny>
            </motion.div>
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
            {buckets.overdue.map((t: any, idx: number) => <TaskRow key={t.id} task={t} client={clientMap[t.client_id]} emphasizeOverdue taskIndex={idx} onEdit={(t) => { setEditTask(t); setAddTaskOpen(true); }} />)}
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
            {buckets.today.map((t: any, idx: number) => <TaskRow key={t.id} task={t} client={clientMap[t.client_id]} taskIndex={buckets.overdue.length + idx} onEdit={(t) => { setEditTask(t); setAddTaskOpen(true); }} />)}
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
            {buckets.upcoming.map((t: any, idx: number) => <TaskRow key={t.id} task={t} client={clientMap[t.client_id]} taskIndex={buckets.overdue.length + buckets.today.length + idx} onEdit={(t) => { setEditTask(t); setAddTaskOpen(true); }} />)}
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
                <ButtonAny
                  variant="ghost"
                  onClick={() => navigate('/app/tasks/history')}
                  className="text-xs text-soft h-8"
                >
                  View history
                </ButtonAny>
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