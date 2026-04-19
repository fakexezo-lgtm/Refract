import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('refract_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('refract_user'));
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(true);
  const [appPublicSettings, setAppPublicSettings] = useState({ id: 'local', public_settings: {} });


  const login = async (email, password) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        email: email,
        full_name: email.split('@')[0],
        onboarded: true
      };
      
      localStorage.setItem('refract_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      setAuthError({ message: 'Invalid credentials' });
      return false;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const register = async (name, email, password) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const mockUser = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        email: email,
        full_name: name,
        onboarded: false
      };
      
      localStorage.setItem('refract_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      setAuthError({ message: 'Registration failed' });
      return false;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const forgotPassword = async (email) => {
    setIsLoadingAuth(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (e) {
      return false;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const resetPassword = async (password) => {
    setIsLoadingAuth(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return true;
    } catch (e) {
      return false;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const verifyEmail = async () => {
    setIsLoadingAuth(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const stored = localStorage.getItem('refract_user');
      if (stored) {
        const u = JSON.parse(stored);
        u.email_verified = true;
        localStorage.setItem('refract_user', JSON.stringify(u));
        setUser(u);
      }
      return true;
    } catch (e) {
      return false;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = (shouldRedirect = true) => {
    localStorage.removeItem('refract_user');
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) window.location.href = '/';
  };

  const navigateToLogin = () => {
    window.location.href = '/';
  };

  const checkUserAuth = async () => {
    const stored = localStorage.getItem('refract_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const checkAppState = async () => {};

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      login,
      register,
      forgotPassword,
      resetPassword,
      verifyEmail,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState
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