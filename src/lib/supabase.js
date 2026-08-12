import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
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
    return { success: false, message: 'Supabase URL or Anon Key is missing in .env file.' };
  }
  try {
    const { data, error } = await supabase.from('courses').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected to Supabase project!' };
  } catch (err) {
    return { success: false, message: err.message || 'Connection failed.' };
  }
}
