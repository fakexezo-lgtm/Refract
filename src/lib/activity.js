import { base44 } from "@/api/base44Client";

export async function logActivity({ client_id, type, content, metadata }) {
  if (!client_id) return;
  await base44.entities.Activity.create({ client_id, type, content, metadata });
  // Update client's last_contacted_at
  await base44.entities.Client.update(client_id, { last_contacted_at: new Date().toISOString() });
}