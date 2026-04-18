// ─── localStorage-backed entity store ────────────────────────────────────────
function makeEntityStore(name) {
  const key = `refract_entity_${name}`;

  const load = () => {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
  };
  const save = (rows) => localStorage.setItem(key, JSON.stringify(rows));
  const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

  return {
    async list(sortField = '-created_date', limit = 500) {
      let rows = load();
      if (sortField) {
        const desc = sortField.startsWith('-');
        const field = sortField.replace(/^-/, '');
        rows = [...rows].sort((a, b) => {
          const av = a[field] ?? '';
          const bv = b[field] ?? '';
          return desc ? (av < bv ? 1 : -1) : (av > bv ? 1 : -1);
        });
      }
      return rows.slice(0, limit);
    },
    async filter(predicates = {}, sortField = '-created_date', limit = 500) {
      let rows = load();
      rows = rows.filter(row =>
        Object.entries(predicates).every(([k, v]) => row[k] === v)
      );
      if (sortField) {
        const desc = sortField.startsWith('-');
        const field = sortField.replace(/^-/, '');
        rows = [...rows].sort((a, b) => {
          const av = a[field] ?? '';
          const bv = b[field] ?? '';
          return desc ? (av < bv ? 1 : -1) : (av > bv ? 1 : -1);
        });
      }
      return rows.slice(0, limit);
    },
    async get(id) {
      return load().find(r => r.id === id) || null;
    },
    async create(data) {
      const rows = load();
      const now = new Date().toISOString();
      const row = { id: uid(), created_date: now, updated_date: now, ...data };
      rows.push(row);
      save(rows);
      return row;
    },
    async update(id, data) {
      const rows = load();
      const idx = rows.findIndex(r => r.id === id);
      if (idx === -1) throw new Error(`${name} ${id} not found`);
      rows[idx] = { ...rows[idx], ...data, updated_date: new Date().toISOString() };
      save(rows);
      return rows[idx];
    },
    async delete(id) {
      const rows = load().filter(r => r.id !== id);
      save(rows);
      return { id };
    },
  };
}

// ─── Seed demo data on first load ─────────────────────────────────────────────
function seedIfEmpty() {
  const clientsKey = 'refract_entity_Client';
  if (localStorage.getItem(clientsKey)) return; // already seeded

  const now = new Date().toISOString();
  const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

  const c1 = { id: uid(), created_date: now, updated_date: now, name: 'Atelier Nomade', email: 'hello@ateliernomade.com', status: 'active', last_contacted_at: now };
  const c2 = { id: uid(), created_date: now, updated_date: now, name: 'Studio Bloom', email: 'hi@studiobloom.co', status: 'active', last_contacted_at: now };

  localStorage.setItem(clientsKey, JSON.stringify([c1, c2]));

  const tasksKey = 'refract_entity_Task';
  const t1 = { id: uid(), created_date: now, updated_date: now, client_id: c1.id, title: 'Send revised proposal', completed: false, due_date: now };
  localStorage.setItem(tasksKey, JSON.stringify([t1]));

  const dealsKey = 'refract_entity_Deal';
  const d1 = { id: uid(), created_date: now, updated_date: now, client_id: c1.id, title: 'Brand Identity Package', stage: 'Proposal', value: 4500 };
  localStorage.setItem(dealsKey, JSON.stringify([d1]));

  const actKey = 'refract_entity_Activity';
  const a1 = { id: uid(), created_date: now, updated_date: now, client_id: c1.id, type: 'note', content: 'Loved the new direction, wants to finalize by Friday.' };
  localStorage.setItem(actKey, JSON.stringify([a1]));
}

try { seedIfEmpty(); } catch {}

// ─── Main export ──────────────────────────────────────────────────────────────
const base44 = {
  entities: {
    Client: makeEntityStore('Client'),
    Task: makeEntityStore('Task'),
    Deal: makeEntityStore('Deal'),
    Activity: makeEntityStore('Activity'),
    Workspace: makeEntityStore('Workspace'),
  },
  query: {
    get: async () => ({ data: [], total: 0 }),
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
  },
  mutate: {
    async create() { return {}; },
    async update() { return {}; },
    async delete() { return {}; },
  },
  auth: {
    isAuthenticated: async () => !!localStorage.getItem('refract_user'),
    redirectToLogin: () => {
        const u = prompt("Enter your email to signup / login:");
        if (u) {
            localStorage.setItem('refract_user', JSON.stringify({ 
                email: u, 
                id: 'u1', 
                full_name: u.split('@')[0],
                onboarded: false 
            }));
            window.location.href = '/onboarding';
        }
    },
    logout: () => {
        localStorage.removeItem('refract_user');
        window.location.href = '/';
    },
    me: async () => JSON.parse(localStorage.getItem('refract_user') || 'null'),
  }
};

export { base44 };