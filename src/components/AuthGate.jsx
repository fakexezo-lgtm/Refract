import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

export default function AuthGate({ children, requireOnboarded = true }) {
  const { user, isAuthenticated, isLoadingAuth, navigateToLogin } = useAuth();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      navigateToLogin();
    }
  }, [isLoadingAuth, isAuthenticated, navigateToLogin]);

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-whisper">
        <div className="w-6 h-6 border-2 border-border border-t-ink rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return null;

  // Only redirect to onboarding if explicitly not onboarded (false), not if undefined/null
  if (requireOnboarded && user && user.onboarded === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}