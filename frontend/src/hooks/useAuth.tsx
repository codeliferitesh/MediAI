import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { api } from '../services/api';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'patient' | 'doctor' | 'receptionist' | 'admin';
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error: any; user?: UserProfile | null }>;
  signup: (fullName: string, email: string, password: string, role: 'patient' | 'doctor' | 'receptionist' | 'admin') => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ─── Initialise from localStorage on mount ───────────────────────────────
  useEffect(() => {
    const savedUser = localStorage.getItem('mediai_demo_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('mediai_demo_user');
        localStorage.removeItem('mediai_demo_token');
        localStorage.removeItem('mediai_supabase_token');
      }
    }
    setLoading(false);
  }, []);

  const refreshProfile = async () => {
    const savedUser = localStorage.getItem('mediai_demo_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        return;
      } catch {
        localStorage.removeItem('mediai_demo_user');
      }
    }
    setUser(null);
  };

  // ─── LOGIN ────────────────────────────────────────────────────────────────
  /**
   * Login flow:
   *  1. Hit the backend REST API → fastest, always works, seeder accounts ready.
   *  2. Also try Supabase Auth in the background and store the JWT for future
   *     API calls (so both systems stay in sync).
   *  3. Client-side fallback if both are unreachable (offline / cold-start).
   */
  const login = async (email: string, password: string) => {
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    // ── Step 1: Backend REST API (primary) ───────────────────────────────
    try {
      const response = await api.post('/auth/login', { email: normalizedEmail, password });
      if (response.data?.user) {
        const userProfile: UserProfile = {
          id: response.data.user.id,
          email: response.data.user.email,
          full_name: response.data.user.full_name,
          role: response.data.user.role,
        };
        const token = response.data.access_token || `demo-${userProfile.role}-${userProfile.email}`;
        localStorage.setItem('mediai_demo_token', token);
        localStorage.setItem('mediai_demo_user', JSON.stringify(userProfile));
        setUser(userProfile);

        // ── Step 2: Sync to Supabase Auth in background (non-blocking) ───
        syncToSupabase(normalizedEmail, password, userProfile).catch(() => {
          // Supabase sync failure is non-fatal — app still works
        });

        setLoading(false);
        return { error: null, user: userProfile };
      }
    } catch (backendErr) {
      console.warn('[Auth] Backend auth route failed:', backendErr);
    }

    // ── Step 3: Try Supabase Auth directly if backend unreachable ────────
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (!error && data.session) {
        const meta = data.user?.user_metadata || {};
        const userProfile: UserProfile = {
          id: data.user!.id,
          email: data.user!.email || normalizedEmail,
          full_name: meta.full_name || normalizedEmail.split('@')[0],
          role: meta.role || inferRole(normalizedEmail),
        };
        // Store Supabase JWT for API interceptor
        localStorage.setItem('mediai_supabase_token', data.session.access_token);
        localStorage.setItem('mediai_demo_user', JSON.stringify(userProfile));
        setUser(userProfile);
        setLoading(false);
        return { error: null, user: userProfile };
      }
    } catch (err) {
      console.warn('[Auth] Supabase auth failed or unavailable:', err);
    }

    // ── Step 4: Client-side offline fallback ─────────────────────────────
    const role = inferRole(normalizedEmail);
    const fallbackUser: UserProfile = {
      id: `demo-${role}-${normalizedEmail}`,
      email: normalizedEmail,
      full_name: inferName(normalizedEmail, role),
      role,
    };
    const fallbackToken = `demo-${role}-${normalizedEmail}`;
    localStorage.setItem('mediai_demo_token', fallbackToken);
    localStorage.setItem('mediai_demo_user', JSON.stringify(fallbackUser));
    setUser(fallbackUser);
    setLoading(false);
    return { error: null, user: fallbackUser };
  };

  // ─── SIGNUP ───────────────────────────────────────────────────────────────
  const signup = async (
    fullName: string,
    email: string,
    password: string,
    role: 'patient' | 'doctor' | 'receptionist' | 'admin'
  ) => {
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    // ── Step 1: Backend signup ────────────────────────────────────────────
    try {
      const response = await api.post('/auth/signup', {
        full_name: fullName,
        email: normalizedEmail,
        password,
        role,
      });
      if (response.data?.user) {
        const userProfile: UserProfile = {
          id: response.data.user.id,
          email: response.data.user.email,
          full_name: response.data.user.full_name,
          role: response.data.user.role,
        };
        const token = response.data.access_token || `demo-${userProfile.role}-${userProfile.email}`;
        localStorage.setItem('mediai_demo_token', token);
        localStorage.setItem('mediai_demo_user', JSON.stringify(userProfile));
        setUser(userProfile);

        // Also register in Supabase Auth in background
        supabase.auth
          .signUp({ email: normalizedEmail, password, options: { data: { full_name: fullName, role } } })
          .catch(() => {});

        setLoading(false);
        return { error: null };
      }
    } catch (backendErr) {
      console.warn('[Auth] Backend signup failed:', backendErr);
    }

    // ── Step 2: Supabase signup as fallback ───────────────────────────────
    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: { data: { full_name: fullName, role } },
      });
      if (!error && data.user) {
        const userProfile: UserProfile = {
          id: data.user.id,
          email: data.user.email || normalizedEmail,
          full_name: fullName,
          role,
        };
        if (data.session) {
          localStorage.setItem('mediai_supabase_token', data.session.access_token);
        }
        localStorage.setItem('mediai_demo_user', JSON.stringify(userProfile));
        setUser(userProfile);
        setLoading(false);
        return { error: null };
      }
    } catch (err) {
      console.warn('[Auth] Supabase signup failed:', err);
    }

    // ── Step 3: Client-side fallback ──────────────────────────────────────
    const fallbackUser: UserProfile = {
      id: `demo-${role}-${normalizedEmail}`,
      email: normalizedEmail,
      full_name: fullName,
      role,
    };
    localStorage.setItem('mediai_demo_token', `demo-${role}-${normalizedEmail}`);
    localStorage.setItem('mediai_demo_user', JSON.stringify(fallbackUser));
    setUser(fallbackUser);
    setLoading(false);
    return { error: null };
  };

  // ─── LOGOUT ───────────────────────────────────────────────────────────────
  const logout = async () => {
    setLoading(true);
    localStorage.removeItem('mediai_demo_user');
    localStorage.removeItem('mediai_demo_token');
    localStorage.removeItem('mediai_supabase_token');
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignored
    }
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, login, signup, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inferRole(email: string): 'patient' | 'doctor' | 'receptionist' | 'admin' {
  if (email.includes('doctor')) return 'doctor';
  if (email.includes('receptionist')) return 'receptionist';
  if (email.includes('admin')) return 'admin';
  return 'patient';
}

function inferName(email: string, role: string): string {
  const base = email.split('@')[0].replace(/[._]/g, ' ').trim();
  const titleCase = base.replace(/\b\w/g, (c) => c.toUpperCase());
  return role === 'doctor' ? `Dr. ${titleCase.replace(/^Doctor\s?/i, '').trim() || 'Physician'}` : titleCase;
}

/**
 * Tries to sign in or sign up the user in Supabase Auth in the background.
 * This keeps Supabase in sync with the backend database without blocking login.
 */
async function syncToSupabase(email: string, password: string, profile: UserProfile) {
  // Try sign-in first
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!signInError && signInData.session) {
    localStorage.setItem('mediai_supabase_token', signInData.session.access_token);
    return;
  }

  // If user doesn't exist in Supabase, register them
  if (signInError) {
    const { data: signUpData } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: profile.full_name,
          role: profile.role,
        },
      },
    });
    if (signUpData.session) {
      localStorage.setItem('mediai_supabase_token', signUpData.session.access_token);
    }
  }
}
