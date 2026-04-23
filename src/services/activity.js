import { apiRoutes } from "@/services/apiRoutes";

export async function logActivity({ client_id, type, content, metadata }) {
  await apiRoutes.createActivity({ client_id, type, content, metadata });
  // Update client's last_contacted_at if it exists
  if (client_id) {
    await apiRoutes.updateClient(client_id, { last_contacted_at: new Date().toISOString() });
  }
}
