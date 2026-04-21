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

  const { data: client, isLoading } = useQuery({
    queryKey: ["client", id],
    queryFn: () => apiRoutes.getClient(id),
  });
  const { data: activities = [] } = useQuery({
    queryKey: ["activities", id],
    queryFn: () => apiRoutes.getActivitiesByClient(id),
    enabled: !!id,
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", id],
    queryFn: () => apiRoutes.getTasksByClient(id),
    enabled: !!id,
  });
  const { data: deals = [] } = useQuery({
    queryKey: ["deals", id],
    queryFn: () => apiRoutes.getDealsByClient(id),
    enabled: !!id,
  });
  const { data: notes = [] } = useQuery({
    queryKey: ["notes", id],
    queryFn: () => apiRoutes.getNotesByClient(id),
    enabled: !!id,
  });

  const nextTask = useMemo(() => {
    const open = tasks.filter(t => !t.completed && t.due_date);
    if (open.length === 0) return tasks.find(t => !t.completed);
    return [...open].sort((a, b) => parseISO(a.due_date).getTime() - parseISO(b.due_date).getTime())[0];
  }, [tasks]);

  if (isLoading) {
    return <div className="h-64 rounded-2xl bg-white border border-hair animate-pulse" />;
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
    qc.setQueryData(["client", id], old => ({ ...(old || {}), status }));
    await apiRoutes.updateClient(id, { status });
    qc.invalidateQueries({ queryKey: ["clients"] });
    qc.invalidateQueries({ queryKey: ["client", id] });
  };

  const openAddNote = () => {
    setEditingNote(null);
    setNoteOpen(true);
  };

  const openEditNote = (note) => {
    setEditingNote(note);
    setNoteOpen(true);
  };

  return (
    <div className="pb-20">
      <Tabs defaultValue="timeline" className="w-full">
        <ClientHeader
          client={client}
          nextTask={nextTask}
          onStatusChange={onStatusChange}
          onEdit={() => setEditClientOpen(true)}
          tabs={
            <TabsList className="bg-transparent border-0 p-0 h-auto gap-1 flex-nowrap overflow-x-auto">
              <TabsTrigger value="timeline" className="rounded-full data-[state=active]:bg-charcoal data-[state=active]:text-white px-4 md:px-5 h-9 text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap">Timeline</TabsTrigger>
              <TabsTrigger value="tasks" className="rounded-full data-[state=active]:bg-charcoal data-[state=active]:text-white px-4 md:px-5 h-9 text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap">Tasks ({tasks.filter(t => !t.completed).length})</TabsTrigger>
              <TabsTrigger value="deals" className="rounded-full data-[state=active]:bg-charcoal data-[state=active]:text-white px-4 md:px-5 h-9 text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap">Deals ({deals.length})</TabsTrigger>
              <TabsTrigger value="notes" className="rounded-full data-[state=active]:bg-charcoal data-[state=active]:text-white px-4 md:px-5 h-9 text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap">Notes ({notes.length})</TabsTrigger>
            </TabsList>
          }
        />

        <div className="mt-6 md:mt-10 max-w-4xl">
          <TabsContent value="timeline" className="mt-0 focus-visible:outline-none">
            <Timeline activities={activities} onAddNote={openAddNote} />
          </TabsContent>
          <TabsContent value="tasks" className="mt-0 focus-visible:outline-none">
            <ClientTasks tasks={tasks} client={client} onAdd={() => setTaskOpen(true)} />
          </TabsContent>
          <TabsContent value="deals" className="mt-0 focus-visible:outline-none">
            <ClientDeals deals={deals} client={client} onAdd={() => setDealOpen(true)} />
          </TabsContent>
          <TabsContent value="notes" className="mt-0 focus-visible:outline-none">
            <ClientNotes notes={notes} client={client} onAdd={openAddNote} onEdit={openEditNote} />
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