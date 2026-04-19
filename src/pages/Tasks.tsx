import React, { useMemo, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkSquareIcon, AlertCircleIcon, Calendar03Icon, Timer01Icon, AddIcon, ArrowDown01Icon, ArrowRight01Icon, CheckmarkCircle03Icon } from "@hugeicons/core-free-icons";
import TaskRow from "@/components/dashboard/TaskRow";
import EmptyState from "@/components/shared/EmptyState";
import { dueBucket } from "@/lib/format";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function Section({ icon: Icon, title, count, tone, children, empty, delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex items-center gap-2 mb-4">
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
      </div>
      {count === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
          className="text-sm text-soft py-4"
        >
          {empty}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
          className="rounded-2xl bg-white border border-hair p-2 space-y-0.5"
        >
          <AnimatePresence>{children}</AnimatePresence>
        </motion.div>
      )}
    </motion.section>
  );
}

function AddTaskDialog({ open, onOpenChange, task }) {
  const qc = useQueryClient();
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: () => base44.entities.Client.list("-updated_date", 500) });
  
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [clientId, setClientId] = useState("");
  const [busy, setBusy] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);
  const [clientFocused, setClientFocused] = useState(false);

  const isEdit = !!task;
  const clientList = useMemo(() => clients.filter(c => c.name).sort((a, b) => a.name.localeCompare(b.name)), [clients]);

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
    if (!title.trim() || !clientId) return;
    setBusy(true);
    
    if (isEdit) {
      await base44.entities.Task.update(task.id, { 
        client_id: clientId, 
        title: title.trim(), 
        due_date: due || undefined 
      });
      toast.success("Task updated");
    } else {
      await base44.entities.Task.create({ 
        client_id: clientId, 
        title: title.trim(), 
        due_date: due || undefined, 
        completed: false 
      });
      toast.success("Task added");
    }
    
    qc.invalidateQueries({ queryKey: ["tasks"] });
    qc.invalidateQueries({ queryKey: ["activities"] });
    setBusy(false);
    onOpenChange(false, isEdit ? task : null);
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
            <motion.div
              animate={{ scale: titleFocused ? 1.02 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <label className="text-xs text-soft">Task</label>
              <Input 
                autoFocus 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
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
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger
                  className={"mt-1 h-11 rounded-lg border-hair bg-white transition-all duration-200" + (clientFocused ? " border-ink/60 shadow-sm" : "")}
                  onFocus={() => setClientFocused(true)}
                  onBlur={() => setClientFocused(false)}
                >
                  <SelectValue placeholder="Select a client..." />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-hair bg-white">
                  {clientList.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
            
            <div>
              <label className="text-xs text-soft">Due date</label>
              <Input 
                type="date" 
                value={due} 
                onChange={e => setDue(e.target.value)} 
                className="mt-1 h-11 rounded-lg border-hair bg-white" 
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">
                  Cancel
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  type="submit" 
                  disabled={!title.trim() || !clientId || busy} 
                  className="rounded-full bg-charcoal hover:bg-black text-white"
                >
                  {busy ? "Saving…" : isEdit ? "Save changes" : "Add task"}
                </Button>
              </motion.div>
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
  const [showHints, setShowHints] = useState(false);
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [filterClient, setFilterClient] = useState("all");
  
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({ queryKey: ["tasks"], queryFn: () => base44.entities.Task.list("-updated_date", 500) });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: () => base44.entities.Client.list("-updated_date", 500) });
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

  useEffect(() => {
    const timer = setTimeout(() => setShowHints(true), 2000);
    return () => clearTimeout(timer);
  }, []);

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
            qc.setQueryData(["tasks"], (old = []) =>
              old.map(t => t.id === task.id ? { ...t, completed: true, completed_at: new Date().toISOString() } : t)
            );
            base44.entities.Task.update(task.id, { completed: true, completed_at: new Date().toISOString() });
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
        className="flex items-start justify-between"
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
        {clients.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button onClick={() => setAddTaskOpen(true)} className="rounded-full bg-charcoal hover:bg-black text-white">
              <HugeiconsIcon icon={AddIcon} className="w-4 h-4 mr-1" />
              Add task
            </Button>
          </motion.div>
        )}
        {clients.length > 0 && (
          <select
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="h-9 px-3 rounded-full border border-hair bg-white text-sm text-soft focus:outline-none focus:border-ink/40"
          >
            <option value="all">All clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="relative"
      >
        <input
          type="text"
          placeholder="+ Add a task... press Enter"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
              e.preventDefault();
              const title = e.target.value.trim();
              e.target.value = '';
              const firstClient = clients[0]?.id;
              if (firstClient) {
                (async () => {
                  await base44.entities.Task.create({
                    client_id: firstClient,
                    title: title,
                    due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                    completed: false
                  });
                  qc.invalidateQueries({ queryKey: ["tasks"] });
                  toast.success('Task added');
                })();
              } else {
                setAddTaskOpen(true);
              }
            }
          }}
          className="w-full h-11 px-4 pl-10 rounded-full border border-hair bg-white text-sm placeholder:text-soft/50 focus:outline-none focus:border-ink/40 focus:ring-2 focus:ring-ink/10 transition-all"
        />
        <HugeiconsIcon icon={AddIcon} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft/40" />
      </motion.div>

      {tasks.length === 0 ? (
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
      ) : (
        <>
          <Section icon={AlertCircleIcon} title="Overdue" count={buckets.overdue.length} tone="text-danger" empty="Nothing overdue. You're on top of it." delay={0.3}>
            {buckets.overdue.map((t, idx) => <TaskRow key={t.id} task={t} client={clientMap[t.client_id]} emphasizeOverdue taskIndex={idx} onEdit={(t) => { setEditTask(t); setAddTaskOpen(true); }} />)}
          </Section>
          <Section icon={Calendar03Icon} title="Today" count={buckets.today.length} empty="Nothing scheduled for today." delay={0.45}>
            {buckets.today.map((t, idx) => <TaskRow key={t.id} task={t} client={clientMap[t.client_id]} taskIndex={buckets.overdue.length + idx} onEdit={(t) => { setEditTask(t); setAddTaskOpen(true); }} />)}
          </Section>
          <Section icon={Timer01Icon} title="Upcoming" count={buckets.upcoming.length} empty="Nothing queued up yet." delay={0.6}>
            {buckets.upcoming.map((t, idx) => <TaskRow key={t.id} task={t} client={clientMap[t.client_id]} taskIndex={buckets.overdue.length + buckets.today.length + idx} onEdit={(t) => { setEditTask(t); setAddTaskOpen(true); }} />)}
          </Section>

          {buckets.completed.length > 0 && (
            <motion.section>
              <button
                onClick={() => setCompletedExpanded(!completedExpanded)}
                className="flex items-center gap-2 mb-4 mt-6 hover:opacity-70 transition-opacity"
              >
                <HugeiconsIcon 
                  icon={completedExpanded ? ArrowDown01Icon : ArrowRight01Icon} 
                  className="w-4 h-4 text-soft" 
                />
                <h2 className="font-serif text-2xl text-soft">Completed</h2>
                <span className="text-xs text-soft">({buckets.completed.length})</span>
              </button>
              <AnimatePresence>
                {completedExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-2xl bg-white border border-hair p-2 space-y-0.5">
                      {buckets.completed.slice(0, 5).map((t, idx) => (
                        <TaskRow key={t.id} task={t} client={clientMap[t.client_id]} taskIndex={-1} onEdit={(t) => { setEditTask(t); setAddTaskOpen(true); }} />
                      ))}
                    </div>
                    {buckets.completed.length > 5 && (
                      <button
                        onClick={() => navigate('/app/tasks/history')}
                        className="mt-3 text-sm text-soft hover:text-ink transition-colors"
                      >
                        View all history ({buckets.completed.length})
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}
        </>
      )}

      <AddTaskDialog 
        open={addTaskOpen} 
        onOpenChange={(open, editedTask) => {
          setAddTaskOpen(open);
          if (!open) setEditTask(null);
        }} 
        task={editTask} 
      />
      
      <AnimatePresence>
        {showHints && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="text-xs text-soft/50 text-center"
          >
            Press <kbd className="px-1.5 py-0.5 bg-white border border-hair rounded text-soft mx-0.5">n</kbd> add · <kbd className="px-1.5 py-0.5 bg-white border border-hair rounded text-soft mx-0.5">j</kbd>/<kbd className="px-1.5 py-0.5 bg-white border border-hair rounded text-soft mx-0.5">k</kbd> nav · <kbd className="px-1.5 py-0.5 bg-white border border-hair rounded text-soft mx-0.5">Space</kbd> done · <kbd className="px-1.5 py-0.5 bg-white border border-hair rounded text-soft mx-0.5">?</kbd> help · <kbd className="px-1.5 py-0.5 bg-white border border-hair rounded text-soft mx-0.5">Esc</kbd> reset
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}