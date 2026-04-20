import { apiRoutes } from "@/lib/apiRoutes";

export async function logActivity({ client_id, type, content, metadata }) {
  if (!client_id) return;
  await apiRoutes.createActivity({ client_id, type, content, metadata });
  // Update client's last_contacted_at
  await apiRoutes.updateClient(client_id, { last_contacted_at: new Date().toISOString() });
}