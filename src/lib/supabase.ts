import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Update the testSupabaseConnection function in src/lib/supabase.ts
export const testSupabaseConnection = async () => {
  try {
    // Test connection by fetching database time
    const { data, error } = await supabase.rpc('now');
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection successful. Database time:', data);
    return true;
  } catch (err) {
    console.error('Supabase connection error:', err);
    return false;
  }
}