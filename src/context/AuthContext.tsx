import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  getActiveUserId,
  getStoredProfiles,
  INITIAL_PROFILES,
  setActiveUserId,
} from '../lib/mockData';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isMod: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSupabaseConnected: boolean;
  signInWithDiscord: () => Promise<void>;
  signOut: () => Promise<void>;
  switchDemoUser: (userId: string) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user profile from Supabase
  const fetchSupabaseProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
      }

      if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Exception fetching profile:', err);
    }
  };

  const refreshProfile = async () => {
    if (isSupabaseConfigured && user) {
      await fetchSupabaseProfile(user.id);
    } else {
      const currentId = getActiveUserId();
      const profiles = getStoredProfiles();
      const found = profiles.find((p) => p.id === currentId) || profiles[0];
      setProfile(found);
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured) {
      // Supabase Auth listener
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchSupabaseProfile(session.user.id);
        }
        setIsLoading(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchSupabaseProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Mock / Offline / Preview Mode
      const currentId = getActiveUserId();
      const profiles = getStoredProfiles();
      const current = profiles.find((p) => p.id === currentId) || INITIAL_PROFILES[0];
      setProfile(current);
      setIsLoading(false);
    }
  }, []);

  const signInWithDiscord = async () => {
    if (isSupabaseConfigured) {
      // Calculate redirect URL to maintain GitHub Pages subpath
      const redirectUrl = window.location.origin + window.location.pathname;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: redirectUrl,
          scopes: 'identify email guilds',
        },
      });
      if (error) {
        console.error('Error with Discord OAuth:', error);
        throw error;
      }
    } else {
      // Simulate OAuth login with the first mock user
      const profiles = getStoredProfiles();
      setProfile(profiles[0]);
      setActiveUserId(profiles[0].id);
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  };

  const switchDemoUser = (userId: string) => {
    const profiles = getStoredProfiles();
    const target = profiles.find((p) => p.id === userId);
    if (target) {
      setActiveUserId(target.id);
      setProfile(target);
    }
  };

  const role: UserRole = profile?.role || 'usuario';
  const isMod = role === 'moderador' || role === 'administrador';
  const isAdmin = role === 'administrador';
  const isAuthenticated = Boolean(profile || user);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isMod,
        isAdmin,
        isAuthenticated,
        isLoading,
        isSupabaseConnected: isSupabaseConfigured,
        signInWithDiscord,
        signOut,
        switchDemoUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
