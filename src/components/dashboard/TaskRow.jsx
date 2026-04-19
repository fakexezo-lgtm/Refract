import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { logActivity } from "@/lib/activity";
import { shortDate, parseISO, isPast } from "@/lib/format";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick01Icon, CheckmarkCircle02Icon, MoreVerticalIcon, Edit01Icon, Delete03Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function TaskRow({ task, client, emphasizeOverdue, taskIndex, onEdit }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [recentlyCompleted, setRecentlyCompleted] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  const overdue = task.due_date && isPast(parseISO(task.due_date)) && !task.completed && new Date(task.due_date).toDateString() !== new Date().toDateString();

  const scale = useMotionValue(1);
  const scaleValue = useTransform(scale, [0, 0.5, 1], [0.85, 0.95, 1]);

  const toggle = async (e) => {
    e.stopPropagation();
    if (task.completed) return;
    
    const previousState = { completed: task.completed, completed_at: task.completed_at };
    
    qc.setQueryData(["tasks"], (old = []) =>
      old.map(t => t.id === task.id ? { ...t, completed: true, completed_at: new Date().toISOString() } : t)
    );
    setRecentlyCompleted(true);
    
    await base44.entities.Task.update(task.id, { completed: true, completed_at: new Date().toISOString() });
    let clientRef = client;
    if (!clientRef) {
      const { data: clients } = await base44.entities.Client.list();
      clientRef = clients?.find(c => c.id === task.client_id);
    }
    if (clientRef) await logActivity({ client_id: clientRef.id, type: "task_completed", content: `Completed: ${task.title}` });
    qc.invalidateQueries({ queryKey: ["tasks"] });
    qc.invalidateQueries({ queryKey: ["activities"] });
    qc.invalidateQueries({ queryKey: ["clients"] });

    toast.success(`"${task.title}" completed`, {
      duration: 5000,
      action: {
        label: "Undo",
        onClick: async () => {
          qc.setQueryData(["tasks"], (old = []) =>
            old.map(t => t.id === task.id ? { ...t, completed: previousState.completed, completed_at: previousState.completed_at } : t)
          );
          await base44.entities.Task.update(task.id, { completed: false, completed_at: null });
          setRecentlyCompleted(false);
          if (clientRef) await logActivity({ client_id: clientRef.id, type: "task_uncompleted", content: `Uncompleted: ${task.title}` });
          qc.invalidateQueries({ queryKey: ["tasks"] });
          qc.invalidateQueries({ queryKey: ["activities"] });
        }
      }
    });
  };

  useEffect(() => {
    if (recentlyCompleted) {
      const timer = setTimeout(() => setRecentlyCompleted(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [recentlyCompleted]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  const deletedRef = useRef(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    
    if (deletedRef.current) return;
    deletedRef.current = true;
    
    const previousTask = { ...task };
    const taskId = task.id;
    const taskTitle = task.title;
    const clientIdRef = client?.id;
    
    qc.setQueryData(["tasks"], (old = []) => old.filter(t => t.id !== taskId));
    
    toast.success(`"${taskTitle}" deleted`, {
      duration: 5000,
      action: {
        label: "Undo",
        onClick: () => {
          deletedRef.current = false;
          qc.setQueryData(["tasks"], (old = []) => [...old, previousTask]);
        }
      }
    });

    setTimeout(async () => {
      if (deletedRef.current) {
        await base44.entities.Task.delete(taskId);
        if (clientIdRef) await logActivity({ client_id: clientIdRef, type: "task_deleted", content: `Deleted: ${taskTitle}` });
        qc.invalidateQueries({ queryKey: ["tasks"] });
        qc.invalidateQueries({ queryKey: ["activities"] });
      }
    }, 5000);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onEdit?.(task);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ 
        opacity: task.completed ? 0.6 : 1, 
        y: 0,
        scale: 1
      }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      data-task-index={taskIndex}
      onClick={() => client && navigate(`/app/clients/${client.id}`)}
      whileHover={{ y: -2 }}
      className={cn(
        "group flex items-center gap-3 py-3 px-4 rounded-xl cursor-pointer transition-all duration-200",
        "hover:bg-white hover:border-hair hover:shadow-sm",
        emphasizeOverdue && overdue && "bg-[#f0e4e2]/40 hover:bg-[#f0e4e2]/70",
        task.completed && "opacity-60"
      )}
    >
      <motion.button
        onClick={toggle}
        disabled={task.completed}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        whileTap={{ scale: 0.85 }}
        animate={{ scale: isPressed ? 0.85 : 1 }}
        transition={{ duration: 0.15 }}
        className={cn(
          "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all duration-200",
          task.completed 
            ? "bg-ink border-ink cursor-not-allowed" 
            : "border-border hover:border-ink/60 hover:bg-cream hover:scale-110",
          recentlyCompleted && "ring-2 ring-offset-2 ring-ink/30"
        )}
        title={task.completed ? "Completed" : "Mark complete"}
      >
        <AnimatePresence mode="wait">
          {task.completed && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <HugeiconsIcon icon={Tick01Icon} className="w-3 h-3 text-white" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      
      <div className="flex-1 min-w-0 relative overflow-hidden">
        <motion.div
          animate={{ 
            opacity: task.completed ? 0.6 : 1,
            y: task.completed ? 0 : 0
          }}
          transition={{ duration: 0.3 }}
          className={cn("text-sm truncate", task.completed && "line-through")}
        >
          {task.title}
        </motion.div>
        {task.completed && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 bg-ink/10 -z-10 rounded"
          />
        )}
        {client && <div className="text-xs text-soft truncate">{client.name}</div>}
      </div>
      
      {task.due_date && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={cn("text-xs shrink-0", overdue ? "text-danger font-medium" : "text-soft")}
        >
          {overdue ? "Overdue · " : ""}{shortDate(task.due_date)}
        </motion.div>
      )}

      <div className="relative" ref={menuRef}>
        <motion.button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-hair transition-all"
          title="More actions"
        >
          <HugeiconsIcon icon={MoreVerticalIcon} className="w-4 h-4 text-soft" />
        </motion.button>
        
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1 w-36 rounded-lg border-hair bg-white shadow-lg z-10 overflow-hidden"
            >
              <button
                onClick={handleEdit}
                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-cream transition-colors"
              >
                <HugeiconsIcon icon={Edit01Icon} className="w-4 h-4 text-soft" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-red-50 text-danger transition-colors"
              >
                <HugeiconsIcon icon={Delete03Icon} className="w-4 h-4" />
                Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}