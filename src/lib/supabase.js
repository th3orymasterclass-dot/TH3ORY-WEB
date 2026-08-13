import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qngzfcpnjpabaornddau.supabase.co';

export function getSupabaseAnonKey() {
  try {
    const lsKey = typeof localStorage !== 'undefined' ? localStorage.getItem('th3ory_supabase_anon_key') : null;
    return (lsKey && lsKey.trim() !== '') ? lsKey.trim() : (import.meta.env.VITE_SUPABASE_ANON_KEY || '');
  } catch {
    return import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  }
}

export function setSupabaseAnonKey(key) {
  try {
    if (key && key.trim() !== '') {
      localStorage.setItem('th3ory_supabase_anon_key', key.trim());
    } else {
      localStorage.removeItem('th3ory_supabase_anon_key');
    }
    window.location.reload();
  } catch {}
}

const activeAnonKey = getSupabaseAnonKey();

export const isSupabaseConfigured = Boolean(supabaseUrl && activeAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, activeAnonKey)
  : null;

/**
 * Helper to check connection status
 */
export async function testSupabaseConnection(customKey) {
  const keyToTest = customKey || getSupabaseAnonKey();
  if (!keyToTest) {
    return { success: false, message: 'Supabase Anon Key is missing. Please add VITE_SUPABASE_ANON_KEY from your Supabase Dashboard.' };
  }
  try {
    const testClient = createClient(supabaseUrl, keyToTest);
    const { error } = await testClient.from('enrollments').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      return { success: false, message: `Supabase API Error (${error.code || '401'}): ${error.message}` };
    }
    return { success: true, message: '✅ Successfully connected to Supabase production project!' };
  } catch (err) {
    return { success: false, message: err.message || 'Connection failed.' };
  }
}
