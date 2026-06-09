/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error("⚠️ VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing! Supabase requests will fail.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
