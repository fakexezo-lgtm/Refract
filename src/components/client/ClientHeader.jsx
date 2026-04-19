import React from "react";
import Avatar from "@/components/shared/Avatar";
import StatusBadge from "@/components/shared/StatusBadge";
import { timeAgo, parseISO, isPast } from "@/lib/format";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, AlertCircleIcon, Clock01Icon, Note02Icon, CheckmarkSquareIcon, Add01Icon, MoreHorizontalIcon, Delete02Icon } from "@hugeicons/core-free-icons";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { base44 } from "@/api/base44Client";

export default function ClientHeader({ client, nextTask, onStatusChange, onAddNote, onAddTask, onAddDeal }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  
  const handleDelete = async () => {
    await base44.entities.Client.delete(client.id);
    qc.invalidateQueries({ queryKey: ["clients"] });
    navigate("/app/clients");
  };

  const overdue = nextTask?.due_date && isPast(parseISO(nextTask.due_date)) && new Date(nextTask.due_date).toDateString() !== new Date().toDateString();

  return (
    <div className="sticky top-0 lg:top-0 z-20 -mx-5 md:-mx-10 px-5 md:px-10 pt-4 pb-5 bg-whisper/80 backdrop-blur-md border-b border-hair">
      <button onClick={() => navigate("/app/clients")} className="inline-flex items-center gap-1.5 text-sm text-soft hover:text-ink mb-4 transition">
        <HugeiconsIcon icon={ArrowLeft01Icon} className="w-3.5 h-3.5" /> All clients
      </button>
      <div className="flex flex-col md:flex-row md:items-start gap-5">
        <Avatar name={client.name} color={client.avatar_color} size="xl" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-serif text-3xl md:text-5xl text-ink">{client.name}</h1>
            <Select value={client.status} onValueChange={onStatusChange}>
              <SelectTrigger className="w-auto h-auto p-0 bg-transparent border-0 shadow-none hover:opacity-70">
                <div><StatusBadge status={client.status} /></div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {client.company && <div className="text-soft mt-1">{client.company}</div>}

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            {/* Primary: Next Action */}
            <div className={cn(
              "flex-1 p-5 rounded-3xl border-2 transition-all group relative",
              nextTask 
                ? overdue ? "bg-red-50 border-red-200" : "bg-charcoal border-charcoal text-white"
                : "bg-white border-dashed border-hair hover:border-charcoal/20"
            )}>
              <div className={cn(
                "flex items-center justify-between mb-3",
                nextTask ? overdue ? "text-red-500" : "text-white/40" : "text-soft"
              )}>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em]">
                  {overdue ? <HugeiconsIcon icon={AlertCircleIcon} className="w-3.5 h-3.5" /> : <HugeiconsIcon icon={Clock01Icon} className="w-3.5 h-3.5" />}
                  Next Action
                </div>
                {nextTask?.due_date && (
                  <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10">
                    {new Date(nextTask.due_date).toDateString() === new Date().toDateString() ? "TODAY" : timeAgo(nextTask.due_date)}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {nextTask ? (
                  <input 
                    defaultValue={nextTask.title}
                    onBlur={async (e) => {
                      if (e.target.value !== nextTask.title) {
                        await base44.entities.Task.update(nextTask.id, { title: e.target.value });
                        qc.invalidateQueries({ queryKey: ["tasks", client.id] });
                      }
                    }}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        e.target.blur();
                      }
                    }}
                    className={cn(
                      "text-lg font-bold bg-transparent border-0 focus:ring-0 p-0 w-full placeholder:opacity-50",
                      overdue ? "text-red-900" : "text-white"
                    )}
                  />
                ) : (
                  <button 
                    onClick={onAddTask}
                    className="flex items-center gap-2 text-soft hover:text-ink font-bold text-lg transition-all"
                  >
                    <HugeiconsIcon icon={Add01Icon} className="w-5 h-5" />
                    <span>Add next step</span>
                  </button>
                )}
              </div>
            </div>

            {/* Secondary: Last Contacted */}
            <div className="w-full sm:w-48 p-5 rounded-3xl bg-white border border-hair flex flex-col justify-center">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-soft mb-2">
                <HugeiconsIcon icon={Clock01Icon} className="w-3.5 h-3.5" />
                Last Contacted
              </div>
              <div className="text-sm font-bold text-ink">
                {client.last_contacted_at ? timeAgo(client.last_contacted_at) : "Never"}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-5">
            <Button onClick={onAddNote} className="rounded-full bg-charcoal hover:bg-black text-white h-9 px-4 shadow-sm">
              <HugeiconsIcon icon={Note02Icon} className="w-3.5 h-3.5 mr-1.5" /> Add note
            </Button>
            <Button onClick={onAddTask} variant="outline" className="rounded-full h-9 px-4 bg-white border-hair hover:bg-cream shadow-sm">
              <HugeiconsIcon icon={CheckmarkSquareIcon} className="w-3.5 h-3.5 mr-1.5" /> Add task
            </Button>
            <Button onClick={onAddDeal} variant="outline" className="rounded-full h-9 px-4 bg-white border-hair hover:bg-cream shadow-sm">
              <HugeiconsIcon icon={Add01Icon} className="w-3.5 h-3.5 mr-1.5" /> Add deal
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full w-9 h-9 border-hair bg-white hover:bg-cream">
                  <HugeiconsIcon icon={MoreHorizontalIcon} className="w-4 h-4 text-soft" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-hair bg-white">
                <DropdownMenuItem 
                  onClick={() => setDeleteOpen(true)}
                  className="text-danger flex items-center gap-2 focus:text-danger cursor-pointer"
                >
                  <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4" />
                  Delete client
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-2xl border-hair bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl">Delete client?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {client.name} and all associated deals, tasks, and history. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="rounded-full bg-danger hover:bg-red-700 text-white"
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}