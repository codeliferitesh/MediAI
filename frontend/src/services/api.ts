import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor — attaches the auth token to every API request.
 *
 * Token priority:
 *  1. Supabase JWT (stored by useAuth when Supabase login succeeds)
 *  2. Demo/local token (stored by useAuth when backend login is used)
 *
 * We read from localStorage synchronously here instead of calling
 * supabase.auth.getSession() to avoid an async roundtrip on every request,
 * which was causing slowness and auth failures on Render.
 */
api.interceptors.request.use(
  (config) => {
    // Check for Supabase JWT first (set by useAuth on Supabase login)
    const supabaseToken = localStorage.getItem('mediai_supabase_token');
    if (supabaseToken) {
      config.headers.Authorization = `Bearer ${supabaseToken}`;
      return config;
    }

    // Fallback: demo/local token (set by useAuth on backend login)
    const demoToken = localStorage.getItem('mediai_demo_token');
    if (demoToken) {
      config.headers.Authorization = `Bearer ${demoToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
