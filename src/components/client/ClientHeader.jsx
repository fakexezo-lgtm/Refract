// @ts-nocheck
import React from "react";
import Avatar from "@/components/shared/Avatar";
import StatusBadge from "@/components/shared/StatusBadge";
import { timeAgo, parseISO, isPast } from "@/lib/format";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, MoreHorizontalIcon, CheckmarkSquareIcon } from "@hugeicons/core-free-icons";
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

export default function ClientHeader({ client, nextTask, onStatusChange, onEdit, tabs }) {
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
    <div className="pt-6 md:pt-10 pb-2">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <button onClick={() => navigate("/app/clients")} className="inline-flex items-center gap-1.5 text-sm text-soft hover:text-ink transition group">
          <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> <span className="hidden sm:inline">All clients</span>
        </button>
        
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Select value={client.status} onValueChange={onStatusChange}>
            <SelectTrigger className="w-auto h-auto p-0 bg-transparent border-0 shadow-none hover:opacity-70 focus:ring-0">
              <StatusBadge status={client.status} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-hair bg-white">
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <div className="h-4 w-px bg-hair" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full w-9 h-9 border-hair bg-white hover:bg-cream transition-colors">
                <HugeiconsIcon icon={MoreHorizontalIcon} className="w-4 h-4 text-soft" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border-hair bg-white p-1 min-w-[160px]">
              <DropdownMenuItem onClick={onEdit} className="cursor-pointer rounded-xl py-2.5 px-3">
                Edit client details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-danger focus:text-danger cursor-pointer rounded-xl py-2.5 px-3 focus:bg-red-50">
                Delete client
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Identity Block */}
      <div className="flex flex-col md:flex-row gap-6 md:items-center mb-12">
        <div className="shrink-0 scale-110 origin-left">
          <Avatar name={client.name} color={client.avatar_color} size="xl" />
        </div>
        <div>
          <h1 className="font-serif text-4xl md:text-5xl text-ink tracking-tight mb-1.5 leading-none">{client.name}</h1>
          {client.company && (
            <div className="text-lg text-soft tracking-tight">{client.company}</div>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
        <div className={cn(
          "lg:col-span-2 p-6 md:p-8 rounded-[2rem] border transition-all duration-500 overflow-hidden relative",
          nextTask 
            ? overdue ? "bg-red-50/80 border-red-200/60" : "bg-charcoal border-charcoal text-white shadow-2xl ring-1 ring-white/10"
            : "bg-white border-dashed border-hair hover:border-charcoal/30 flex flex-col justify-center"
        )}>
          <div className={cn(
            "flex items-center justify-between mb-4 relative z-10",
            nextTask ? overdue ? "text-red-600" : "text-white/60" : "text-soft/60"
          )}>
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] flex items-center gap-2">
              Next Action
              {overdue && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
            </span>
            {nextTask?.due_date && (
              <span className={cn(
                "text-[10px] font-bold px-2.5 py-1 rounded-full",
                overdue ? "bg-red-100 text-red-700" : "bg-black/10"
              )}>
                {new Date(nextTask.due_date).toDateString() === new Date().toDateString() ? "TODAY" : timeAgo(nextTask.due_date)}
              </span>
            )}
          </div>
          
          <div className="text-xl md:text-2xl font-medium tracking-tight relative z-10">
            {nextTask ? (
              <input 
                defaultValue={nextTask.title}
                onBlur={async (e) => {
                  if (e.target.value !== nextTask.title) {
                    await base44.entities.Task.update(nextTask.id, { title: e.target.value });
                    qc.invalidateQueries({ queryKey: ["clientFull", client.id] });
                  }
                }}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    e.target.blur();
                  }
                }}
                className={cn(
                  "bg-transparent border-0 focus:ring-0 p-0 w-full placeholder:opacity-50",
                  overdue ? "text-red-900" : "text-white"
                )}
              />
            ) : (
              <button 
                className="text-soft hover:text-ink transition-colors text-left"
              >
                Add next step to move forward...
              </button>
            )}
          </div>
          
          {nextTask && !overdue && (
            <div className="absolute right-0 bottom-0 pointer-events-none opacity-[0.03]">
              <HugeiconsIcon icon={CheckmarkSquareIcon} className="w-48 h-48 translate-x-12 translate-y-12" />
            </div>
          )}
        </div>

        <div className="p-6 md:p-8 rounded-[2rem] bg-white border border-hair shadow-sm flex flex-col justify-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-soft/60 mb-2">Last Contacted</div>
          <div className="text-xl md:text-2xl font-medium text-ink tracking-tight">
            {client.last_contacted_at ? timeAgo(client.last_contacted_at) : "Never"}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full">
        {tabs}
      </div>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-2xl border-hair bg-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl">Delete client?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {client.name} and all associated deals, tasks, and history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-full bg-danger hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}