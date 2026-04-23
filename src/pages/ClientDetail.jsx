// @ts-nocheck
import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ClientHeader from "@/components/clients/ClientHeader";
import Timeline from "@/components/clients/Timeline";
import ClientTasks from "@/components/clients/ClientTasks";
import ClientDeals from "@/components/clients/ClientDeals";
import AddNoteDialog from "@/components/clients/AddNoteDialog";
import AddTaskDialog from "@/components/clients/AddTaskDialog";
import AddDealDialog from "@/components/clients/AddDealDialog";
import { parseISO, timeAgo } from "@/utils/format";
import { apiRoutes } from "@/services/apiRoutes";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

import ClientNotes from "@/components/clients/ClientNotes";
import EditClientDialog from "@/components/clients/EditClientDialog";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  
  const [noteOpen, setNoteOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [taskOpen, setTaskOpen] = useState(false);
  const [dealOpen, setDealOpen] = useState(false);
  const [editClientOpen, setEditClientOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["clientFull", id],
    queryFn: () => apiRoutes.getClientFull(id),
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const client = data?.client;
  const activities = data?.activities || [];
  const tasks = data?.tasks || [];
  const deals = data?.deals || [];
  const notes = data?.notes || [];

  const nextTask = useMemo(() => {
    const open = tasks.filter(t => !t.completed && t.due_date);
    if (open.length === 0) return tasks.find(t => !t.completed);
    return [...open].sort((a, b) => parseISO(a.due_date).getTime() - parseISO(b.due_date).getTime())[0];
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="pt-6 md:pt-10 pb-20 animate-pulse space-y-6">
        <div className="h-5 w-24 rounded-full bg-whisper" />
        <div className="h-48 rounded-[1.5rem] bg-white border border-hair" />
        <div className="h-12 w-80 rounded-full bg-whisper" />
        <div className="h-64 rounded-[1.5rem] bg-white border border-hair" />
      </div>
    );
  }
  if (!client) {
    return (
      <div className="text-center py-12 md:py-20">
        <h2 className="font-serif text-2xl md:text-3xl mb-2 md:mb-4 text-ink">Client not found</h2>
        <button onClick={() => navigate("/app/clients")} className="text-sm text-soft hover:text-ink underline transition">Back to clients</button>
      </div>
    );
  }

  const onStatusChange = async (status) => {
    qc.setQueryData(["clientFull", id], old => ({ ...(old || {}), client: { ...(old?.client || {}), status } }));
    await apiRoutes.updateClient(id, { status });
    qc.invalidateQueries({ queryKey: ["clients"] });
    qc.invalidateQueries({ queryKey: ["clientFull", id] });
  };

  const openAddNote = () => {
    setEditingNote(null);
    setNoteOpen(true);
  };

  const openEditNote = (note) => {
    setEditingNote(note);
    setNoteOpen(true);
  };

  const activeTasks = tasks.filter(t => !t.completed).length;

  return (
    <div className="pb-20 max-w-[1400px] mx-auto px-5 md:px-10 py-8 md:py-12">
      <Tabs defaultValue="timeline" className="w-full">
        <ClientHeader
          client={client}
          onStatusChange={onStatusChange}
          onEdit={() => setEditClientOpen(true)}
          tabs={
            <div className="w-full overflow-x-auto scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
              <TabsList className="inline-flex items-center h-auto p-0 rounded-none bg-transparent border-b border-hair w-full md:w-auto gap-2">
                <TabsTrigger 
                  value="timeline" 
                  className="relative px-6 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all rounded-none border-b-2 border-transparent data-[state=active]:border-charcoal data-[state=active]:text-ink data-[state=active]:bg-transparent data-[state=active]:shadow-none text-soft hover:text-ink whitespace-nowrap bg-transparent shadow-none"
                >
                  Timeline
                </TabsTrigger>
                <TabsTrigger 
                  value="tasks" 
                  className="relative px-6 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all rounded-none border-b-2 border-transparent data-[state=active]:border-charcoal data-[state=active]:text-ink data-[state=active]:bg-transparent data-[state=active]:shadow-none text-soft hover:text-ink whitespace-nowrap bg-transparent shadow-none"
                >
                  Tasks
                  {activeTasks > 0 && (
                    <span className="ml-3 inline-flex items-center justify-center px-2 h-5 rounded-full bg-charcoal text-[9px] font-black text-white">{activeTasks}</span>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="deals" 
                  className="relative px-6 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all rounded-none border-b-2 border-transparent data-[state=active]:border-charcoal data-[state=active]:text-ink data-[state=active]:bg-transparent data-[state=active]:shadow-none text-soft hover:text-ink whitespace-nowrap bg-transparent shadow-none"
                >
                  Deals
                  {deals.length > 0 && (
                    <span className="ml-3 inline-flex items-center justify-center px-2 h-5 rounded-full bg-cream border border-hair text-[9px] font-black text-ink">{deals.length}</span>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="notes" 
                  className="relative px-6 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all rounded-none border-b-2 border-transparent data-[state=active]:border-charcoal data-[state=active]:text-ink data-[state=active]:bg-transparent data-[state=active]:shadow-none text-soft hover:text-ink whitespace-nowrap bg-transparent shadow-none"
                >
                  Notes
                </TabsTrigger>
              </TabsList>
            </div>
          }
        />

        {/* ─── Next Action Callout (UX Boost) ─── */}
        {nextTask && !nextTask.completed && (
          <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 md:p-6 rounded-2xl bg-charcoal text-white shadow-xl relative overflow-hidden group">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
               <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            </div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={22} className="text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-white/50 leading-none mb-1.5">Next Momentum Step</span>
                <h3 className="font-bold text-lg tracking-tight truncate leading-tight">{nextTask.title}</h3>
              </div>
            </div>
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="flex flex-col items-end mr-2">
                <span className="text-[10px] uppercase tracking-widest font-black text-white/40 leading-none mb-1">Due</span>
                <span className="text-sm font-bold">{timeAgo(nextTask.due_date)}</span>
              </div>
              <Button 
                onClick={() => setTaskOpen(true)}
                className="rounded-xl h-11 px-6 bg-white text-charcoal hover:bg-cream transition-all font-bold shadow-lg"
              >
                Add Task
              </Button>
            </div>
          </div>
        )}

        {/* ─── Tab Content ─── */}
        <div className="mt-10 md:mt-12">
          {/* Activity Feed Card */}
          <TabsContent value="timeline" className="mt-0 focus-visible:outline-none focus:outline-none outline-none ring-0 border-none shadow-none">
            <div className="bg-white rounded-2xl border border-hair p-8 md:p-10 shadow-sm min-h-[400px]">
              <Timeline activities={activities} onAddNote={openAddNote} />
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-0 focus-visible:outline-none focus:outline-none outline-none ring-0 border-none shadow-none">
            <div className="bg-white rounded-2xl border border-hair p-8 md:p-10 shadow-sm min-h-[400px]">
              <ClientTasks tasks={tasks} client={client} onAdd={() => setTaskOpen(true)} />
            </div>
          </TabsContent>

          <TabsContent value="deals" className="mt-0 focus-visible:outline-none focus:outline-none outline-none ring-0 border-none shadow-none">
            <div className="bg-white rounded-2xl border border-hair p-8 md:p-10 shadow-sm min-h-[400px]">
              <ClientDeals deals={deals} client={client} onAdd={() => setDealOpen(true)} />
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-0 focus-visible:outline-none focus:outline-none outline-none ring-0 border-none shadow-none">
            <div className="bg-white rounded-2xl border border-hair p-8 md:p-10 shadow-sm min-h-[400px]">
              <ClientNotes notes={notes} client={client} onAdd={openAddNote} onEdit={openEditNote} />
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <AddNoteDialog 
        open={noteOpen} 
        onOpenChange={setNoteOpen} 
        client={client} 
        note={editingNote}
      />
      <AddTaskDialog open={taskOpen} onOpenChange={setTaskOpen} client={client} />
      <AddDealDialog open={dealOpen} onOpenChange={setDealOpen} client={client} />
      <EditClientDialog open={editClientOpen} onOpenChange={setEditClientOpen} client={client} />
    </div>
  );
}

