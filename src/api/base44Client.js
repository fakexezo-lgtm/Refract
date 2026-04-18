const base44 = {
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
    isAuthenticated: async () => true,
    redirectToLogin: (redirectUrl) => { window.location.href = redirectUrl; },
    logout: () => {},
    me: async () => ({ id: '1', name: 'Demo User', email: 'demo@example.com' }),
  }
};

export { base44 };