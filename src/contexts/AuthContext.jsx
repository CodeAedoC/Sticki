import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { supabase } from '../supabaseClient.js';

// Create the Auth context
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // If loading hasn't finished yet, set it now
      if (loading) setLoading(false);
    })

    // Cleanup subscription on unmount
    return () => subscription?.unsubscribe();
  }, [loading]); // Depend on loading to potentially update loading state

  // Memoized value to provide to consumers
  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    loading,
    signOut: () => supabase.auth.signOut(),
    // Add other methods like signIn, signUp as needed
    signInWithPassword: (credentials) => supabase.auth.signInWithPassword(credentials),
    signUp: (credentials) => supabase.auth.signUp(credentials),
  }), [session, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 