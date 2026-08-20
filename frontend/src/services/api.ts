import axios from 'axios';
import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to dynamically inject the Supabase JWT token or Local Demo Token
api.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
        return config;
      }
    } catch (e) {
      // Ignored if offline or uninitialized
    }

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
