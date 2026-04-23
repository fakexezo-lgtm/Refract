import { supabase } from '@/services/supabaseClient';

const tableMap = {
  Client: 'clients',
  Task: 'tasks',
  Deal: 'deals',
  Activity: 'activities',
  Workspace: 'workspaces'
};

function makeEntityStore(name) {
  const table = tableMap[name] || name.toLowerCase();

  return {
    async list(sortField = '-created_at', limit = 500) {
      if (sortField) {
        const desc = sortField.startsWith('-');
        const field = sortField.replace(/^-/, '');
        const { data, error } = await supabase.from(table).select('*').order(field, { ascending: !desc }).limit(limit);
        if (error) { console.warn(`Supabase error listing ${table}:`, error); return []; }
        return data;
      }
      const { data, error } = await supabase.from(table).select('*').limit(limit);
      if (error) { console.warn(`Supabase error listing ${table}:`, error); return []; }
      return data;
    },
    async filter(predicates = {}, sortField = '-created_at', limit = 500) {
      let query = supabase.from(table).select('*');
      for (const [k, v] of Object.entries(predicates)) {
        query = query.eq(k, v);
      }
      if (sortField) {
        const desc = sortField.startsWith('-');
        const field = sortField.replace(/^-/, '');
        query = query.order(field, { ascending: !desc });
      }
      const { data, error } = await query.limit(limit);
      if (error) { console.warn(`Supabase error filtering ${table}:`, error); return []; }
      return data;
    },
    async get(id) {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (error && error.code !== 'PGRST116') { console.warn(`Supabase error getting ${table} ${id}:`, error); }
      return data || null;
    },
    async create(data) {
      const { data: { user } } = await supabase.auth.getUser();
      const insertData = { ...data, user_id: user?.id };
      
      const { data: created, error } = await supabase.from(table).insert([insertData]).select().single();
      if (error) { throw error; }
      return created;
    },
    async update(id, data) {
      const { data: updated, error } = await supabase.from(table).update(data).eq('id', id).select().single();
      if (error) { throw error; }
      return updated;
    },
    async delete(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) { throw error; }
      return { id };
    },
  };
}

const base44 = {
  entities: {
    Client: makeEntityStore('Client'),
    Task: makeEntityStore('Task'),
    Deal: makeEntityStore('Deal'),
    Activity: makeEntityStore('Activity'),
    Workspace: makeEntityStore('Workspace'),
  },
  auth: {
    isAuthenticated: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    },
    redirectToLogin: () => {
      window.location.href = '/login';
    },
    logout: async () => {
      await supabase.auth.signOut();
      window.location.href = '/';
    },
    me: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      // Combine user obj with profiles if needed, or simply return standard metadata
      return {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email.split('@')[0],
        onboarded: user.user_metadata?.onboarded || false
      };
    },
    updateMe: async (data) => {
      const { error } = await supabase.auth.updateUser({ data });
      if (error) throw error;
    }
  }
};

export { base44 };
