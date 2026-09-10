import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables or fallback
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;
  if (supabaseUrl && supabaseAnonKey) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
      return supabaseInstance;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
    }
  }
  return null;
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
