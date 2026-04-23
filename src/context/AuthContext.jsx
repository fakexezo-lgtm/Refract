// @ts-nocheck
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/services/supabaseClient';
import { mapAuthError } from '@/constants/authErrorMap';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Map Supabase user to our app's user format
  const mapUser = (supabaseUser) => {
    if (!supabaseUser) return null;
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
      onboarded: supabaseUser.user_metadata?.onboarded || false,
      email_verified: !!supabaseUser.email_confirmed_at
    };
  };

  useEffect(() => {
    // Check active sessions and sets the user
    // Add a safety timeout to prevent infinite white screen if Supabase hangs
    const safetyTimeout = setTimeout(() => {
      if (isLoadingAuth) {
        console.warn("Auth initialization timed out, proceeding to guest state");
        setIsLoadingAuth(false);
      }
    }, 5000);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          setSession(session);
          setUser(mapUser(session.user));
        }
      })
      .catch(async (err) => {
        console.error("Auth session check failed:", err);
        // If the session is invalid because the user was deleted
        if (err.message?.includes("sub claim") || err.message?.includes("does not exist")) {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
        }
      })
      .finally(() => {
        setIsLoadingAuth(false);
        clearTimeout(safetyTimeout);
      });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(mapUser(session?.user));
      setIsLoadingAuth(false);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  const login = async (email, password) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      const mapped = mapAuthError(err, "login");
      setAuthError({ message: mapped.message, code: mapped.code });
      return { success: false, error: mapped.message, code: mapped.code, nextAction: mapped.nextAction };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const register = async (name, email, password) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            onboarded: false
          }
        }
      });

      if (error) throw error;

      // Ghost user check: email already registered but unconfirmed
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        const mapped = mapAuthError({ message: 'user already registered' }, 'signup');
        setAuthError({ message: mapped.message, code: mapped.code });
        return { success: false, error: mapped.message, code: mapped.code };
      }

      // If Supabase returned a session immediately (email confirmation is OFF),
      // sign out to ensure the user goes through the verification step.
      // The verify-email page will re-authenticate via verifyOtp.
      if (data.session) {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
      }

      return { 
        success: true, 
        status: data.session ? 'complete' : 'awaiting_verification',
      };
    } catch (err) {
      const mapped = mapAuthError(err, "signup");
      setAuthError({ message: mapped.message, code: mapped.code });
      return { success: false, error: mapped.message, code: mapped.code };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const verifyEmail = async (code, email) => {
    // We don't use setIsLoadingAuth(true) here because we handle local loading state in the component
    try {
      // Supabase email OTP codes can use type 'email' or 'signup'
      // We try 'email' first as it is the standard for numeric/alphanumeric OTPs
      let result = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email'
      });

      // Fallback: try 'signup' type which is sometimes used for the initial confirmation
      if (result.error) {
        result = await supabase.auth.verifyOtp({
          email,
          token: code,
          type: 'signup'
        });
      }

      if (result.error) throw result.error;
      return { success: true };
    } catch (err) {
      console.warn('[verifyEmail error]', err);
      const mapped = mapAuthError(err, "verify_email");
      return { success: false, error: mapped.message, code: mapped.code };
    }
  };

  const resendVerification = async (email) => {
    // In-page action, no global loader
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      const mapped = mapAuthError(err, "verify_email");
      return { success: false, error: mapped.message, code: mapped.code };
    }
  };

  const forgotPassword = async (email) => {
    setIsLoadingAuth(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      const mapped = mapAuthError(err, "forgot_password");
      return { success: false, error: mapped.message, code: mapped.code };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const resetPassword = async (password) => {
    setIsLoadingAuth(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      const mapped = mapAuthError(err, "reset_password");
      return { success: false, error: mapped.message, code: mapped.code };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const getRecoveryState = async () => {
    try {
      const hash = window.location.hash || '';
      const query = window.location.search || '';
      const tokenInUrl = hash.includes("type=recovery") || query.includes("type=recovery");
      const { data: { session } } = await supabase.auth.getSession();
      const hasRecoverySession = !!session?.user;
      return {
        valid: tokenInUrl || hasRecoverySession,
        reason: tokenInUrl || hasRecoverySession ? null : "INVALID_TOKEN"
      };
    } catch (_err) {
      return { valid: false, reason: "INVALID_TOKEN" };
    }
  };

  const updateUserMetadata = async (metadata) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: metadata
      });
      if (error) throw error;
      
      // Update local user state immediately
      if (data.user) {
        setUser(mapUser(data.user));
      }
      
      return { success: true };
    } catch (err) {
      console.error("updateUserMetadata error:", err);
      
      // If the user has been deleted from Supabase but still has a local session
      if (err.message?.includes("sub claim") || err.message?.includes("does not exist")) {
        console.warn("Session is stale (user likely deleted). Logging out...");
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        window.location.href = "/login";
        return { success: false, error: "Your session has expired. Please log in again." };
      }
      
      return { success: false, error: err.message || "Update failed" };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/app`
        }
      });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || "Google login failed" };
    }
  };

  const logout = async (shouldRedirect = true) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      if (shouldRedirect) window.location.href = '/';
      return { success: true };
    } catch (err) {
      return { success: false, error: mapAuthError(err, "login").message };
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoadingAuth,
      authError,
      authChecked: !isLoadingAuth,
      login,
      register,
      forgotPassword,
      resetPassword,
      verifyEmail,
      resendVerification,
      signInWithGoogle,
      updateUserMetadata,
      logout,
      getRecoveryState,
      navigateToLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};