import type { createClient } from '@/lib/supabase/server';
import { adminMfaRequired } from '@/lib/admin-auth';

type Supabase = Awaited<ReturnType<typeof createClient>>;

/**
 * Where an admin stands with two-step verification in this session:
 * off (not required), verified (code entered), needs_code (set up, code
 * not entered yet) or not_enrolled (authenticator app not set up yet).
 */
export type AdminMfaState = 'off' | 'verified' | 'needs_code' | 'not_enrolled';

export async function adminMfaState(supabase: Supabase): Promise<AdminMfaState> {
  if (!adminMfaRequired()) return 'off';
  // Code entered in this session? (from the session token)
  const { data: level } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (level?.currentLevel === 'aal2') return 'verified';
  // Set up already? Asked fresh from Supabase, not from the saved session
  const { data: factors } = await supabase.auth.mfa.listFactors();
  return factors?.totp?.length ? 'needs_code' : 'not_enrolled';
}
