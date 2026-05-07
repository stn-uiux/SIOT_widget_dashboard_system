import { useState, useEffect } from 'react';
import { supabase, getProfile, Profile } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

/**
 * useAuth Hook
 * Handles Supabase authentication state, profile fetching, and logout logic.
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        getProfile(currentUser.id).then(setProfile);
      }
      setLoading(false);
    });

    // 2. Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        const p = await getProfile(currentUser.id);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Enhanced Logout Logic
   * Includes forced local state reset and a timeout fallback for the Supabase network call.
   */
  const logout = async () => {
    try {
      // 모든 Supabase 관련 인증 키 삭제 (sb-xxxx-auth-token 형태 등)
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase.auth.token') || (key.startsWith('sb-') && key.endsWith('-auth-token'))) {
          localStorage.removeItem(key);
        }
      });
      
      // Attempt signOut with a timeout fallback
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 3000)
      );
      
      await Promise.race([signOutPromise, timeoutPromise]).catch(err => {
        console.warn("[useAuth] SignOut timed out or failed, forcing local state reset:", err);
      });

      // Clear local state regardless of server response
      setUser(null);
      setProfile(null);
      
      return { success: true };
    } catch (error) {
      console.error("[useAuth] Logout error:", error);
      // Fallback: Ensure state is cleared even on error
      setUser(null);
      setProfile(null);
      return { success: false, error };
    }
  };

  return {
    user,
    profile,
    loading,
    logout,
    setUser,
    setProfile
  };
};
