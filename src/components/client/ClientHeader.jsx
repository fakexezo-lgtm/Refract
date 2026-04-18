import React from "react";
import Avatar from "@/components/shared/Avatar";
import StatusBadge from "@/components/shared/StatusBadge";
import { timeAgo, parseISO, isPast } from "@/lib/format";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, AlertCircleIcon, ClockIcon, Note02Icon, CheckmarkSquareIcon, TrendingUp } from "@hugeicons/core-free-icons";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";

export default function ClientHeader({ client, nextTask, onStatusChange, onAddNote, onAddTask, onAddDeal }) {
  const navigate = useNavigate();
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 max-w-xl">
            <div className="p-3 rounded-xl bg-white border border-hair">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-soft mb-1">
                <HugeiconsIcon icon={ClockIcon} className="w-3 h-3" /> Last contacted
              </div>
              <div className="text-sm text-ink">{client.last_contacted_at ? timeAgo(client.last_contacted_at) : "Never"}</div>
            </div>
            <div className={`p-3 rounded-xl border ${overdue ? "bg-[#f0e4e2]/60 border-[#e8d4d1]" : "bg-cream border-hair"}`}>
              <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider mb-1 ${overdue ? "text-danger" : "text-soft"}`}>
                {overdue ? <HugeiconsIcon icon={AlertWarningCircleIcon} className="w-3 h-3" /> : <HugeiconsIcon icon={ClockIcon} className="w-3 h-3" />} Next action
              </div>
              <div className="text-sm text-ink truncate">
                {nextTask ? nextTask.title : "No pending actions"}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-5">
            <Button onClick={onAddNote} className="rounded-full bg-charcoal hover:bg-black text-white h-9 px-4">
              <HugeiconsIcon icon={Note02Icon} className="w-3.5 h-3.5 mr-1.5" /> Add note
            </Button>
            <Button onClick={onAddTask} variant="outline" className="rounded-full h-9 px-4 bg-white border-hair hover:bg-cream">
              <HugeiconsIcon icon={CheckmarkSquareIcon} className="w-3.5 h-3.5 mr-1.5" /> Add task
            </Button>
            <Button onClick={onAddDeal} variant="outline" className="rounded-full h-9 px-4 bg-white border-hair hover:bg-cream">
              <HugeiconsIcon icon={TrendingUp} className="w-3.5 h-3.5 mr-1.5" /> Add deal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}