import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { useAuth } from '@/lib/AuthContext';

import Landing from '@/pages/Landing';
import Onboarding from '@/pages/Onboarding';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Clients from '@/pages/Clients';
import ClientDetail from '@/pages/ClientDetail';
import Pipeline from '@/pages/Pipeline';
import Tasks from '@/pages/Tasks';
import TaskHistory from '@/pages/TaskHistory';
import Settings from '@/pages/Settings';

// Auth Pages
import Login from '@/pages/Auth/Login';
import ForgotPassword from '@/pages/Auth/ForgotPassword';
import ResetPassword from '@/pages/Auth/ResetPassword';
import VerifyEmail from '@/pages/Auth/VerifyEmail';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, authChecked } = useAuth();
  
  if (!authChecked) return null;
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const RequireOnboarding = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.onboarded) {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
};

const AuthenticatedApp = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route path="/onboarding" element={
        <ProtectedRoute><Onboarding /></ProtectedRoute>
      } />
      
      <Route path="/app" element={<ProtectedRoute><RequireOnboarding><Layout /></RequireOnboarding></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="clients/:id" element={<ClientDetail />} />
        <Route path="pipeline" element={<Pipeline />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="tasks/history" element={<TaskHistory />} />
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
        <Sonner richColors position="top-right" />
      </QueryClientProvider>
    </Router>
  )
}

export default App