import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ClientHeader from "@/components/client/ClientHeader";
import Timeline from "@/components/client/Timeline";
import ClientTasks from "@/components/client/ClientTasks";
import ClientDeals from "@/components/client/ClientDeals";
import AddNoteDialog from "@/components/client/AddNoteDialog";
import AddTaskDialog from "@/components/client/AddTaskDialog";
import AddDealDialog from "@/components/client/AddDealDialog";
import { parseISO } from "@/lib/format";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [noteOpen, setNoteOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [dealOpen, setDealOpen] = useState(false);

  const { data: client, isLoading } = useQuery({
    queryKey: ["client", id],
    queryFn: () => fetch(`/api/clients/${id}`).then(r => r.json()),
  });
  const { data: activities = [] } = useQuery({
    queryKey: ["activities", id],
    queryFn: () => fetch(`/api/clients/${id}/activities`).then(r => r.json()),
    enabled: !!id,
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", id],
    queryFn: () => fetch(`/api/clients/${id}/tasks`).then(r => r.json()),
    enabled: !!id,
  });
  const { data: deals = [] } = useQuery({
    queryKey: ["deals", id],
    queryFn: () => fetch(`/api/clients/${id}/deals`).then(r => r.json()),
    enabled: !!id,
  });

  const nextTask = useMemo(() => {
    const open = tasks.filter(t => !t.completed && t.due_date);
    if (open.length === 0) return tasks.find(t => !t.completed);
    return [...open].sort((a, b) => parseISO(a.due_date) - parseISO(b.due_date))[0];
  }, [tasks]);

  if (isLoading) {
    return <div className="h-64 rounded-2xl bg-white border border-hair animate-pulse" />;
  }
  if (!client) {
    return (
      <div className="text-center py-20">
        <h2 className="font-serif text-2xl mb-2">Client not found.</h2>
        <button onClick={() => navigate("/app/clients")} className="text-sm text-soft underline">Back to clients</button>
      </div>
    );
  }

  const onStatusChange = async (status) => {
    qc.setQueryData(["client", id], old => ({ ...old, status }));
    await fetch(`/api/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    qc.invalidateQueries({ queryKey: ["clients"] });
    qc.invalidateQueries({ queryKey: ["client", id] });
  };

  return (
    <div>
      <ClientHeader
        client={client}
        nextTask={nextTask}
        onStatusChange={onStatusChange}
        onAddNote={() => setNoteOpen(true)}
        onAddTask={() => setTaskOpen(true)}
        onAddDeal={() => setDealOpen(true)}
      />

      <div className="mt-8">
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="bg-white border border-hair p-1 rounded-full h-auto">
            <TabsTrigger value="timeline" className="rounded-full data-[state=active]:bg-charcoal data-[state=active]:text-white px-5 h-9">Timeline</TabsTrigger>
            <TabsTrigger value="tasks" className="rounded-full data-[state=active]:bg-charcoal data-[state=active]:text-white px-5 h-9">Tasks · {tasks.filter(t => !t.completed).length}</TabsTrigger>
            <TabsTrigger value="deals" className="rounded-full data-[state=active]:bg-charcoal data-[state=active]:text-white px-5 h-9">Deals · {deals.length}</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-6">
            <Timeline activities={activities} onAddNote={() => setNoteOpen(true)} />
          </TabsContent>
          <TabsContent value="tasks" className="mt-6">
            <ClientTasks tasks={tasks} client={client} onAdd={() => setTaskOpen(true)} />
          </TabsContent>
          <TabsContent value="deals" className="mt-6">
            <ClientDeals deals={deals} client={client} onAdd={() => setDealOpen(true)} />
          </TabsContent>
        </Tabs>
      </div>

      <AddNoteDialog open={noteOpen} onOpenChange={setNoteOpen} client={client} />
      <AddTaskDialog open={taskOpen} onOpenChange={setTaskOpen} client={client} />
      <AddDealDialog open={dealOpen} onOpenChange={setDealOpen} client={client} />
    </div>
  );
}