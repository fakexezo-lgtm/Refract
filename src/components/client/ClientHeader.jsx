import React from "react";
import Avatar from "@/components/shared/Avatar";
import StatusBadge from "@/components/shared/StatusBadge";
import { timeAgo, parseISO, isPast } from "@/lib/format";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, MoreHorizontalIcon } from "@hugeicons/core-free-icons";
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
    <div className="sticky top-0 lg:top-0 z-20 -mx-4 md:-mx-10 px-4 md:px-10 pt-3 md:pt-5 pb-5 bg-whisper/95 backdrop-blur-md border-b border-hair">
      <button onClick={() => navigate("/app/clients")} className="inline-flex items-center gap-1.5 text-sm text-soft hover:text-ink mb-4 transition">
        <HugeiconsIcon icon={ArrowLeft01Icon} className="w-3.5 h-3.5" /> <span className="hidden sm:inline">All clients</span>
      </button>
      
      <div className="flex items-start gap-5">
        <Avatar name={client.name} color={client.avatar_color} size="xl" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-serif text-3xl md:text-5xl text-ink tracking-tight">{client.name}</h1>
            <Select value={client.status} onValueChange={onStatusChange}>
              <SelectTrigger className="w-auto h-auto p-0 bg-transparent border-0 shadow-none hover:opacity-70">
                <StatusBadge status={client.status} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {client.company && (
            <div className="text-soft mt-1 text-sm">{client.company}</div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <div className={cn(
              "flex-1 p-4 md:p-5 rounded-2xl border-2 transition-all",
              nextTask 
                ? overdue ? "bg-red-50 border-red-200" : "bg-charcoal border-charcoal text-white"
                : "bg-white border-dashed border-hair hover:border-charcoal/30"
            )}>
              <div className={cn(
                "flex items-center justify-between mb-2",
                nextTask ? overdue ? "text-red-500" : "text-white/50" : "text-soft"
              )}>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Next Action</span>
                {nextTask?.due_date && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10">
                    {new Date(nextTask.due_date).toDateString() === new Date().toDateString() ? "TODAY" : timeAgo(nextTask.due_date)}
                  </span>
                )}
              </div>
              
              <div className="text-base md:text-lg font-semibold">
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
                    onClick={() => {}}
                    className="text-soft hover:text-ink transition-colors"
                  >
                    Add next step
                  </button>
                )}
              </div>
            </div>

            <div className="w-full sm:w-44 p-4 md:p-5 rounded-2xl bg-white border border-hair">
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-soft mb-1">Last Contacted</div>
              <div className="text-sm font-semibold text-ink">
                {client.last_contacted_at ? timeAgo(client.last_contacted_at) : "Never"}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-hair pt-5">
            <div className="flex-1 overflow-x-auto -mx-2 px-2">
              {tabs}
            </div>
            <div className="flex items-center gap-2 ml-4 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full w-9 h-9 border-hair bg-white hover:bg-cream">
                    <HugeiconsIcon icon={MoreHorizontalIcon} className="w-4 h-4 text-soft" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl border-hair bg-white">
                  <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                    Edit client
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-danger focus:text-danger cursor-pointer">
                    Delete client
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
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