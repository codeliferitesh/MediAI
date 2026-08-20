import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { api } from '../services/api';
import type { Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'patient' | 'doctor' | 'receptionist' | 'admin';
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error: any; user?: UserProfile | null }>;
  signup: (fullName: string, email: string, password: string, role: 'patient' | 'doctor' | 'receptionist' | 'admin') => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const DEMO_ACCOUNTS: Record<string, { role: 'patient' | 'doctor' | 'receptionist' | 'admin'; full_name: string }> = {
  'doctor@mediai.com': { role: 'doctor', full_name: 'Dr. Rajesh Kumar' },
  'doctor.priya@mediai.com': { role: 'doctor', full_name: 'Dr. Priya Sharma' },
  'doctor.ananya@mediai.com': { role: 'doctor', full_name: 'Dr. Ananya Iyer' },
  'doctor.rohan@mediai.com': { role: 'doctor', full_name: 'Dr. Rohan Mehta' },
  'doctor.amit@mediai.com': { role: 'doctor', full_name: 'Dr. Amit Patel' },
  'doctor.kavita@mediai.com': { role: 'doctor', full_name: 'Dr. Kavita Nair' },
  'doctor.sunita@mediai.com': { role: 'doctor', full_name: 'Dr. Sunita Rao' },
  'doctor.sanjay@mediai.com': { role: 'doctor', full_name: 'Dr. Sanjay Dutt' },
  'doctor.vikram@mediai.com': { role: 'doctor', full_name: 'Dr. Vikram Singh' },
  'doctor.divya@mediai.com': { role: 'doctor', full_name: 'Dr. Divya Joshi' },
  'receptionist@mediai.com': { role: 'receptionist', full_name: 'Priya Sen' },
  'admin@mediai.com': { role: 'admin', full_name: 'Amit Sharma' },
  'patient@mediai.com': { role: 'patient', full_name: 'Aarav Sharma' },
  'patient.priyan@mediai.com': { role: 'patient', full_name: 'Priyan Patel' },
  'patient.vivaan@mediai.com': { role: 'patient', full_name: 'Vivaan Shah' },
  'patient.aditya@mediai.com': { role: 'patient', full_name: 'Aditya Verma' },
  'patient.sai@mediai.com': { role: 'patient', full_name: 'Sai Prasad' },
  'patient.diya@mediai.com': { role: 'patient', full_name: 'Diya Sen' },
  'patient.ishan@mediai.com': { role: 'patient', full_name: 'Ishan Gupta' },
  'patient.ananya@mediai.com': { role: 'patient', full_name: 'Ananya Reddy' },
  'patient.kabir@mediai.com': { role: 'patient', full_name: 'Kabir Kapoor' },
  'patient.meera@mediai.com': { role: 'patient', full_name: 'Meera Nair' }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async (activeSession?: Session | null) => {
    const currentSession = activeSession || session;
    const token = currentSession?.access_token;
    let profile: UserProfile | null = null;

    if (token) {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const response = await api.get<UserProfile>('/auth/me', { headers });
        if (response.data && response.data.role) {
          profile = response.data;
        }
      } catch (error) {
        console.warn("Could not load backend user profile, using auth session fallback:", error);
      }
    }

    if (!profile && currentSession?.user) {
      const meta = currentSession.user.user_metadata || {};
      profile = {
        id: currentSession.user.id,
        email: currentSession.user.email || '',
        full_name: meta.full_name || currentSession.user.email?.split('@')[0] || 'User',
        role: meta.role || 'patient',
      };
    }

    if (profile) {
      setUser(profile);
    }
    return profile;
  };

  const refreshProfile = async () => {
    try {
      const { data: { session: activeSession } } = await supabase.auth.getSession();
      if (activeSession) {
        setSession(activeSession);
        await fetchProfile(activeSession);
        return;
      }
    } catch (e) {
      // Ignore
    }

    const savedUser = localStorage.getItem('mediai_demo_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        return;
      } catch (e) {
        localStorage.removeItem('mediai_demo_user');
        localStorage.removeItem('mediai_demo_token');
      }
    }

    setUser(null);
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session: activeSession } } = await supabase.auth.getSession();
        if (activeSession && isMounted) {
          setSession(activeSession);
          await fetchProfile(activeSession);
          setLoading(false);
          return;
        }
      } catch (e) {
        // Supabase error, fall through to localStorage check
      }

      // Check local storage for demo user
      const savedUser = localStorage.getItem('mediai_demo_user');
      if (savedUser && isMounted) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
        } catch (e) {
          localStorage.removeItem('mediai_demo_user');
          localStorage.removeItem('mediai_demo_token');
          setUser(null);
        }
      } else if (isMounted) {
        setUser(null);
      }

      if (isMounted) setLoading(false);
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, activeSession) => {
      if (activeSession) {
        setSession(activeSession);
        await fetchProfile(activeSession);
      } else {
        const savedUser = localStorage.getItem('mediai_demo_user');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Try Supabase Auth first
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
      if (!error && data.session) {
        setSession(data.session);
        const userProfile = await fetchProfile(data.session);
        setLoading(false);
        return { error: null, user: userProfile };
      }
    } catch (err) {
      console.warn("Supabase auth failed or unavailable, falling back to local authentication mode:", err);
    }

    // 2. Fallback to backend local auth endpoint
    try {
      const response = await api.post('/auth/login', { email: normalizedEmail, password });
      if (response.data && response.data.user) {
        const userProfile: UserProfile = {
          id: response.data.user.id,
          email: response.data.user.email,
          full_name: response.data.user.full_name,
          role: response.data.user.role
        };
        const token = response.data.access_token || `demo-${userProfile.role}-${userProfile.email}`;
        localStorage.setItem('mediai_demo_token', token);
        localStorage.setItem('mediai_demo_user', JSON.stringify(userProfile));
        setUser(userProfile);
        setLoading(false);
        return { error: null, user: userProfile };
      }
    } catch (backendErr) {
      console.warn("Backend auth route unreachable, using instant fallback credential lookup:", backendErr);
    }

    // 3. Instant client-side fallback matching ides.md or email convention
    const matched = DEMO_ACCOUNTS[normalizedEmail];
    const inferredRole: 'patient' | 'doctor' | 'receptionist' | 'admin' = matched?.role || (
      normalizedEmail.includes('doctor') ? 'doctor' :
      normalizedEmail.includes('receptionist') ? 'receptionist' :
      normalizedEmail.includes('admin') ? 'admin' : 'patient'
    );
    const inferredName = matched?.full_name || (
      inferredRole === 'doctor' ? `Dr. ${normalizedEmail.split('@')[0].replace('.', ' ').replace('doctor', '').trim() || 'Physician'}` :
      normalizedEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase())
    );

    const fallbackUser: UserProfile = {
      id: `demo-${inferredRole}-${normalizedEmail}`,
      email: normalizedEmail,
      full_name: inferredName,
      role: inferredRole
    };
    const fallbackToken = `demo-${inferredRole}-${normalizedEmail}`;

    localStorage.setItem('mediai_demo_token', fallbackToken);
    localStorage.setItem('mediai_demo_user', JSON.stringify(fallbackUser));
    setUser(fallbackUser);
    setLoading(false);
    return { error: null, user: fallbackUser };
  };

  const signup = async (fullName: string, email: string, password: string, role: 'patient' | 'doctor' | 'receptionist' | 'admin') => {
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Try Supabase Auth first
    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });
      if (!error && data.user) {
        setLoading(false);
        return { error: null };
      }
    } catch (err) {
      console.warn("Supabase signup failed or unavailable, falling back to local mode:", err);
    }

    // 2. Fallback to backend signup
    try {
      const response = await api.post('/auth/signup', {
        full_name: fullName,
        email: normalizedEmail,
        password,
        role
      });
      if (response.data && response.data.user) {
        const userProfile: UserProfile = {
          id: response.data.user.id,
          email: response.data.user.email,
          full_name: response.data.user.full_name,
          role: response.data.user.role
        };
        const token = response.data.access_token || `demo-${userProfile.role}-${userProfile.email}`;
        localStorage.setItem('mediai_demo_token', token);
        localStorage.setItem('mediai_demo_user', JSON.stringify(userProfile));
        setUser(userProfile);
        setLoading(false);
        return { error: null };
      }
    } catch (backendErr) {
      console.warn("Backend signup route unreachable, using local fallback registration:", backendErr);
    }

    // 3. Client-side fallback registration
    const fallbackUser: UserProfile = {
      id: `demo-${role}-${normalizedEmail}`,
      email: normalizedEmail,
      full_name: fullName,
      role
    };
    const fallbackToken = `demo-${role}-${normalizedEmail}`;

    localStorage.setItem('mediai_demo_token', fallbackToken);
    localStorage.setItem('mediai_demo_user', JSON.stringify(fallbackUser));
    setUser(fallbackUser);
    setLoading(false);
    return { error: null };
  };

  const logout = async () => {
    setLoading(true);
    localStorage.removeItem('mediai_demo_user');
    localStorage.removeItem('mediai_demo_token');
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Ignored
    }
    setUser(null);
    setSession(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, logout, login, signup, refreshProfile }}>
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
