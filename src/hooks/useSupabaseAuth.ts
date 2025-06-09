// src/hooks/useSupabaseAuth.ts
import { useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase'; // Ensure this path is correct

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  // Add other profile fields as needed, e.g., wallet_address, username
  role: string; // Example: 'user', 'admin'
  created_at: string;
  updated_at: string;
}

export function useSupabaseAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSessionAndProfile = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        setLoading(false);
        return;
      }

      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false); // Ensure loading is false when user logs out
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error, status } = await supabase
        .from('users') // Make sure 'users' is your public user profile table name
        .select('*')
        .eq('id', userId)
        .single();

      if (error && status !== 406) { // 406: No rows found, which is okay if profile not yet created
        console.error('Error fetching profile:', error.message);
        setProfile(null);
      } else {
        setProfile(data as UserProfile | null);
      }
    } catch (err: any) {
      console.error('Exception fetching profile:', err.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { // This data is passed to the new user in auth.users
          full_name: fullName,
          // You can add other metadata here if needed by your triggers
        },
      },
    });

    if (error) {
      setLoading(false);
      throw error;
    }
    // Profile creation should be handled by a database trigger listening to auth.users insertions
    // The onAuthStateChange listener will then pick up the new user and fetch their profile
    setLoading(false);
    return data;
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      throw error;
    }
    // onAuthStateChange will handle setting user and profile
    setLoading(false);
    return data;
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setLoading(false);
      throw error;
    }
    // onAuthStateChange will handle clearing user and profile
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    setLoading(true);

    const { data, error } = await supabase
      .from('users') // Your public user profile table
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      setLoading(false);
      throw error;
    }
    setProfile(data as UserProfile | null); // Update local profile state
    setLoading(false);
    return data;
  };

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };
}
