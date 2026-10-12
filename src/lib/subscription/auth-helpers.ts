/**
 * Server-side auth helper: get the signed-in user for an API route.
 */
import { createClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/auth/profile';

export async function getAuthUser(_request?: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  await ensureProfile(user);
  return { userId: user.id, email: user.email! };
}
