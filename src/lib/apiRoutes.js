// API routes for Supabase integration
// This would typically be a server-side implementation, but for now we'll use mock data

export const apiRoutes = {
  // Clients
  getClients: () => fetch('/api/clients').then(r => r.json()),
  getClient: (id) => fetch(`/api/clients/${id}`).then(r => r.json()),
  createClient: (data) => fetch('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  updateClient: (id, data) => fetch(`/api/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  
  // Tasks
  getTasks: () => fetch('/api/tasks').then(r => r.json()),
  getTasksByClient: (clientId) => fetch(`/api/clients/${clientId}/tasks`).then(r => r.json()),
  createTask: (data) => fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  
  // Deals
  getDeals: () => fetch('/api/deals').then(r => r.json()),
  getDealsByClient: (clientId) => fetch(`/api/clients/${clientId}/deals`).then(r => r.json()),
  createDeal: (data) => fetch('/api/deals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  
  // Activities
  getActivities: () => fetch('/api/activities').then(r => r.json()),
  getActivitiesByClient: (clientId) => fetch(`/api/clients/${clientId}/activities`).then(r => r.json()),
  createActivity: (data) => fetch('/api/activities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
};