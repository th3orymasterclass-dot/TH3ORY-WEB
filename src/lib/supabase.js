import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qngzfcpnjpabaornddau.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Helper to check connection status
 */
export async function testSupabaseConnection() {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, message: 'Supabase URL or Anon Key is missing in environment.' };
  }
  try {
    const { error } = await supabase.from('enrollments').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected to Supabase project!' };
  } catch (err) {
    return { success: false, message: err.message || 'Connection failed.' };
  }
}
