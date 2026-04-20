import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from './supabaseClient'
import { useNavigate } from 'react-router-dom'

interface AuthContextType {
  user: any | null
  isAuthenticated: boolean
  isLoadingAuth: boolean
  authError: any | null
  login: (email: string, password: string) => Promise<{success: boolean, error?: string}>
  register: (name: string, email: string, password: string) => Promise<{success: boolean, error?: string}>
  forgotPassword: (email: string) => Promise<{success: boolean, error?: string}>
  resetPassword: (password: string) => Promise<{success: boolean, error?: string}>
  logout: () => Promise<void>
  navigateToLogin: () => void
  checkUserAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [authError, setAuthError] = useState<any | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        
        if (user) {
          setUser(user)
          setIsAuthenticated(true)
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setAuthError(error)
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoadingAuth(false)
      }
    }

    checkUser()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user || null)
        setIsAuthenticated(true)
        setAuthError(null)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsAuthenticated(false)
        setAuthError(null)
      } else if (event === 'PASSWORD_RECOVERY') {
        // Handle password recovery
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string): Promise<{success: boolean, error?: string}> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setAuthError(error)
        return { success: false, error: error.message }
      }

      if (data.user) {
        setUser(data.user)
        setIsAuthenticated(true)
        setAuthError(null)
        return { success: true }
      }
      return { success: false, error: "An unknown error occurred" }
    } catch (error: any) {
      setAuthError(error)
      return { success: false, error: error?.message || "An unknown error occurred" }
    }
  }

  const register = async (name: string, email: string, password: string): Promise<{success: boolean, error?: string}> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) {
        setAuthError(error)
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Create user profile in database
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: name,
          email: email,
          created_at: new Date().toISOString()
        })

        if (profileError) {
          console.error('Error creating profile:', profileError)
        }

        setAuthError(null)
        return { success: true }
      }
      return { success: false, error: "An unknown error occurred" }
    } catch (error: any) {
      setAuthError(error)
      return { success: false, error: error?.message || "An unknown error occurred" }
    }
  }

  const forgotPassword = async (email: string): Promise<{success: boolean, error?: string}> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) return { success: false, error: error.message }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error?.message || "An unknown error occurred" }
    }
  }

  const resetPassword = async (password: string): Promise<{success: boolean, error?: string}> => {
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) return { success: false, error: error.message }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error?.message || "An unknown error occurred" }
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setIsAuthenticated(false)
      setAuthError(null)
    } catch (error) {
      console.error('Error logging out:', error)
      setAuthError(error)
    }
  }

  const navigateToLogin = () => {
    navigate('/login')
  }

  const checkUserAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      
      if (user) {
        setUser(user)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      setAuthError(error)
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const value = {
    user,
    isAuthenticated,
    isLoadingAuth,
    authError,
    login,
    register,
    forgotPassword,
    resetPassword,
    logout,
    navigateToLogin,
    checkUserAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}