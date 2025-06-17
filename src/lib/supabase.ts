import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Extract project reference from Supabase URL
const projectRef = supabaseUrl.match(/(?:\/\/|\.)(.*?)\.supabase/)?.[1] || '';
// Cookie name that Supabase uses, including project reference
const SUPABASE_COOKIE_NAME = `sb-${projectRef}-auth-token`;

export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey
); 