import { createClient } from '@supabase/supabase-js';

/**
 * Supabase server-side client for API routes.
 *
 * Uses the anon key directly (no cookie-based auth) since newsletter
 * subscriptions are public operations that don't require user auth.
 *
 * For authenticated user operations, use the cookie-based client from @supabase/ssr.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});