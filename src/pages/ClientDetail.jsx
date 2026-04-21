// @ts-nocheck
import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ClientHeader from "@/components/client/ClientHeader";
import Timeline from "@/components/client/Timeline";
import ClientTasks from "@/components/client/ClientTasks";
import ClientDeals from "@/components/client/ClientDeals";
import AddNoteDialog from "@/components/client/AddNoteDialog";
import AddTaskDialog from "@/components/client/AddTaskDialog";
import AddDealDialog from "@/components/client/AddDealDialog";
import { parseISO } from "@/lib/format";
import { apiRoutes } from "@/lib/apiRoutes";

import ClientNotes from "@/components/client/ClientNotes";
import EditClientDialog from "@/components/client/EditClientDialog";

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
    <div className="pb-20">
      <Tabs defaultValue="timeline" className="w-full">
        <ClientHeader
          client={client}
          onStatusChange={onStatusChange}
          onEdit={() => setEditClientOpen(true)}
          tabs={
            <div className="w-full overflow-x-auto scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
              <TabsList className="inline-flex items-center h-auto p-0 rounded-none bg-transparent border-b border-hair/60 w-full md:w-auto">
                <TabsTrigger 
                  value="timeline" 
                  className="relative px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.06em] transition-all rounded-none border-b-2 border-transparent data-[state=active]:border-ink data-[state=active]:text-ink data-[state=active]:bg-transparent data-[state=active]:shadow-none text-soft hover:text-ink whitespace-nowrap bg-transparent shadow-none"
                >
                  Timeline
                </TabsTrigger>
                <TabsTrigger 
                  value="tasks" 
                  className="relative px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.06em] transition-all rounded-none border-b-2 border-transparent data-[state=active]:border-ink data-[state=active]:text-ink data-[state=active]:bg-transparent data-[state=active]:shadow-none text-soft hover:text-ink whitespace-nowrap bg-transparent shadow-none"
                >
                  Tasks
                  {activeTasks > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-whisper text-[10px] font-bold text-ink">{activeTasks}</span>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="deals" 
                  className="relative px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.06em] transition-all rounded-none border-b-2 border-transparent data-[state=active]:border-ink data-[state=active]:text-ink data-[state=active]:bg-transparent data-[state=active]:shadow-none text-soft hover:text-ink whitespace-nowrap bg-transparent shadow-none"
                >
                  Deals
                  {deals.length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-whisper text-[10px] font-bold text-ink">{deals.length}</span>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="notes" 
                  className="relative px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.06em] transition-all rounded-none border-b-2 border-transparent data-[state=active]:border-ink data-[state=active]:text-ink data-[state=active]:bg-transparent data-[state=active]:shadow-none text-soft hover:text-ink whitespace-nowrap bg-transparent shadow-none"
                >
                  Notes
                </TabsTrigger>
              </TabsList>
            </div>
          }
        />

        {/* ─── Tab Content ─── */}
        <div className="mt-8 md:mt-10">
          {/* Activity Feed Card */}
          <TabsContent value="timeline" className="mt-0 focus-visible:outline-none">
            <div className="bg-white rounded-[1.5rem] border border-hair/60 p-8 md:p-10 shadow-sm">
              <Timeline activities={activities} onAddNote={openAddNote} />
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-0 focus-visible:outline-none">
            <div className="bg-white rounded-[1.5rem] border border-hair/60 p-8 md:p-10 shadow-sm">
              <ClientTasks tasks={tasks} client={client} onAdd={() => setTaskOpen(true)} />
            </div>
          </TabsContent>

          <TabsContent value="deals" className="mt-0 focus-visible:outline-none">
            <div className="bg-white rounded-[1.5rem] border border-hair/60 p-8 md:p-10 shadow-sm">
              <ClientDeals deals={deals} client={client} onAdd={() => setDealOpen(true)} />
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-0 focus-visible:outline-none">
            <div className="bg-white rounded-[1.5rem] border border-hair/60 p-8 md:p-10 shadow-sm">
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