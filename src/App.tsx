import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { Show, useUser } from '@clerk/react';

import Landing from '@/pages/Landing';
import Onboarding from '@/pages/Onboarding';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Clients from '@/pages/Clients';
import ClientDetail from '@/pages/ClientDetail';
import Pipeline from '@/pages/Pipeline';
import Tasks from '@/pages/Tasks';
import Settings from '@/pages/Settings';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out"><Navigate to="/" replace /></Show>
    </>
  );
};

const RequireOnboarding = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded } = useUser();
  if (!isLoaded) return null;
  if (!user?.unsafeMetadata?.onboarded) {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
};

const AuthenticatedApp = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={
        <ProtectedRoute><Onboarding /></ProtectedRoute>
      } />
      <Route path="/app" element={<ProtectedRoute><RequireOnboarding><Layout /></RequireOnboarding></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="clients/:id" element={<ClientDetail />} />
        <Route path="pipeline" element={<Pipeline />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClientInstance}>
        <AuthenticatedApp />
        <Toaster />
      </QueryClientProvider>
    </Router>
  )
}

export default App