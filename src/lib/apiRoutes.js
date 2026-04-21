import { supabase } from './supabaseClient';

export const apiRoutes = {
  _normalizeError: (error, fallbackMessage = "Request failed") => {
    const normalized = new Error(error?.message || fallbackMessage);
    Object.assign(normalized, {
      code: error?.code || "REQUEST_FAILED",
      status: error?.status || 500
    });
    return normalized;
  },

  // Helper
  _getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw apiRoutes._normalizeError(error, "Unable to authenticate user");
    return user;
  },

  _requireUser: async () => {
    const user = await apiRoutes._getUser();
    if (!user?.id) {
      const unauthorizedError = new Error("Your session has expired. Please log in again");
      Object.assign(unauthorizedError, {
        code: "UNAUTHENTICATED",
        status: 401
      });
      throw unauthorizedError;
    }
    return user;
  },

  // Clients
  getClients: async () => {
    const user = await apiRoutes._requireUser();
    const { data, error } = await supabase.from('clients').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) throw apiRoutes._normalizeError(error, "Unable to fetch clients");
    return data;
  },
  getClient: async (id) => {
    const user = await apiRoutes._requireUser();
    const { data, error } = await supabase.from('clients').select('*').eq('id', id).eq('user_id', user.id).single();
    if (error) throw apiRoutes._normalizeError(error, "Unable to fetch client");
    return data;
  },
  createClient: async (data) => {
    const user = await apiRoutes._requireUser();
    const { data: created, error } = await supabase.from('clients').insert([{ ...data, user_id: user?.id }]).select().single();
    if (error) throw apiRoutes._normalizeError(error, "Unable to create client");
    return created;
  },
  createClients: async (dataArray) => {
    const user = await apiRoutes._requireUser();
    const dataWithUserId = dataArray.map(item => ({ ...item, user_id: user?.id }));
    const { data: created, error } = await supabase.from('clients').insert(dataWithUserId).select();
    if (error) throw apiRoutes._normalizeError(error, "Unable to import clients");
    return created;
  },
  updateClient: async (id, data) => {
    const user = await apiRoutes._requireUser();
    const { data: updated, error } = await supabase.from('clients').update(data).eq('id', id).eq('user_id', user.id).select().single();
    if (error) throw apiRoutes._normalizeError(error, "Unable to update client");
    return updated;
  },
  deleteClients: async (ids) => {
    const user = await apiRoutes._requireUser();
    const { error } = await supabase.from('clients').delete().in('id', ids).eq('user_id', user.id);
    if (error) throw apiRoutes._normalizeError(error, "Unable to delete clients");
    return { ids };
  },
  updateClientsStatus: async (ids, status) => {
    const user = await apiRoutes._requireUser();
    const { data: updated, error } = await supabase.from('clients').update({ status }).in('id', ids).eq('user_id', user.id).select();
    if (error) throw apiRoutes._normalizeError(error, "Unable to update clients");
    return updated;
  },
  
  // Tasks
  getTasks: async () => {
    const user = await apiRoutes._requireUser();
    const { data, error } = await supabase.from('tasks').select('*').eq('user_id', user.id).order('due_date', { ascending: true });
    if (error) throw apiRoutes._normalizeError(error, "Unable to fetch tasks");
    return data;
  },
  getTasksByClient: async (clientId) => {
    const user = await apiRoutes._requireUser();
    const { data, error } = await supabase.from('tasks').select('*').eq('client_id', clientId).eq('user_id', user.id).order('due_date', { ascending: true });
    if (error) throw apiRoutes._normalizeError(error, "Unable to fetch client tasks");
    return data;
  },
  createTask: async (data) => {
    const user = await apiRoutes._requireUser();
    const { data: created, error } = await supabase.from('tasks').insert([{ ...data, user_id: user?.id }]).select().single();
    if (error) throw apiRoutes._normalizeError(error, "Unable to create task");
    return created;
  },
  updateTask: async (id, data) => {
    const user = await apiRoutes._requireUser();
    const { data: updated, error } = await supabase.from('tasks').update(data).eq('id', id).eq('user_id', user.id).select().single();
    if (error) throw apiRoutes._normalizeError(error, "Unable to update task");
    return updated;
  },
  deleteTask: async (id) => {
    const user = await apiRoutes._requireUser();
    const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw apiRoutes._normalizeError(error, "Unable to delete task");
    return { id };
  },
  
  // Deals
  getDeals: async () => {
    const user = await apiRoutes._requireUser();
    const { data, error } = await supabase.from('deals').select('*').eq('user_id', user.id).order('value', { ascending: false });
    if (error) throw apiRoutes._normalizeError(error, "Unable to fetch deals");
    return data;
  },
  getDealsByClient: async (clientId) => {
    const user = await apiRoutes._requireUser();
    const { data, error } = await supabase.from('deals').select('*').eq('client_id', clientId).eq('user_id', user.id);
    if (error) throw apiRoutes._normalizeError(error, "Unable to fetch client deals");
    return data;
  },
  createDeal: async (data) => {
    const user = await apiRoutes._requireUser();
    const { data: created, error } = await supabase.from('deals').insert([{ ...data, user_id: user?.id }]).select().single();
    if (error) throw apiRoutes._normalizeError(error, "Unable to create deal");
    return created;
  },
  updateDeal: async (id, data) => {
    const user = await apiRoutes._requireUser();
    const { data: updated, error } = await supabase.from('deals').update(data).eq('id', id).eq('user_id', user.id).select().single();
    if (error) throw apiRoutes._normalizeError(error, "Unable to update deal");
    return updated;
  },
  deleteDeal: async (id) => {
    const user = await apiRoutes._requireUser();
    const { error } = await supabase.from('deals').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw apiRoutes._normalizeError(error, "Unable to delete deal");
    return { id };
  },
  
  // Activities
  getActivities: async () => {
    const user = await apiRoutes._requireUser();
    const { data, error } = await supabase.from('activities').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) throw apiRoutes._normalizeError(error, "Unable to fetch activities");
    return data;
  },
  getActivitiesByClient: async (clientId) => {
    const user = await apiRoutes._requireUser();
    const { data, error } = await supabase.from('activities').select('*').eq('client_id', clientId).eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) throw apiRoutes._normalizeError(error, "Unable to fetch client activity");
    return data;
  },
  createActivity: async (data) => {
    const user = await apiRoutes._requireUser();
    const { data: created, error } = await supabase.from('activities').insert([{ ...data, user_id: user?.id }]).select().single();
    if (error) {
      if (error.code === '42P01') {
        console.warn("Activities table doesn't exist yet");
        return { id: Date.now().toString(), ...data, user_id: user?.id };
      }
      throw apiRoutes._normalizeError(error, "Unable to create activity");
    }
    return created;
  },
  updateActivity: async (id, data) => {
    const user = await apiRoutes._requireUser();
    const { data: updated, error } = await supabase.from('activities').update(data).eq('id', id).eq('user_id', user.id).select().single();
    if (error) throw apiRoutes._normalizeError(error, "Unable to update activity");
    return updated;
  },
  deleteActivity: async (id) => {
    const user = await apiRoutes._requireUser();
    const { error } = await supabase.from('activities').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw apiRoutes._normalizeError(error, "Unable to delete activity");
    return { id };
  },

  // Notes
  getNotesByClient: async (clientId) => {
    const user = await apiRoutes._requireUser();
    const { data, error } = await supabase.from('notes').select('*').eq('client_id', clientId).eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) {
      // Fallback if table doesn't exist
      if (error.code === 'PGRST116' || error.code === '42P01') return [];
      throw apiRoutes._normalizeError(error, "Unable to fetch notes");
    }
    return data;
  },
  createNote: async (data) => {
    const user = await apiRoutes._requireUser();
    try {
      const { data: created, error } = await supabase.from('notes').insert([{ ...data, user_id: user?.id }]).select().single();
      if (error) {
        if (error.code === '42P01') {
          console.warn("Notes table doesn't exist yet");
          return { id: Date.now().toString(), ...data, user_id: user?.id };
        }
        throw apiRoutes._normalizeError(error, "Unable to create note");
      }
      return created;
    } catch (err) {
      if (err?.code === '42P01') {
        return { id: Date.now().toString(), ...data, user_id: user?.id };
      }
      throw err;
    }
  },
  updateNote: async (id, data) => {
    const user = await apiRoutes._requireUser();
    const { data: updated, error } = await supabase.from('notes').update(data).eq('id', id).eq('user_id', user.id).select().single();
    if (error) {
      if (error.code === '42P01') return { id, ...data };
      throw apiRoutes._normalizeError(error, "Unable to update note");
    }
    return updated;
  },
  deleteNote: async (id) => {
    const user = await apiRoutes._requireUser();
    const { error } = await supabase.from('notes').delete().eq('id', id).eq('user_id', user.id);
    if (error) {
      if (error.code === '42P01') return { id };
      throw apiRoutes._normalizeError(error, "Unable to delete note");
    }
    return { id };
  },
  
  // Account & Data
  exportData: async () => {
    const [clients, tasks, deals] = await Promise.all([
      supabase.from('clients').select('*'),
      supabase.from('tasks').select('*'),
      supabase.from('deals').select('*'),
    ]);
    
    return {
      clients: clients.data || [],
      tasks: tasks.data || [],
      deals: deals.data || [],
    };
  },
  deleteAccount: async () => {
    const { error } = await supabase.rpc('delete_user_data');
    if (error) throw error;
  }
};