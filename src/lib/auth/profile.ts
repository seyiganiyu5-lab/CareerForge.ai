import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User as DbUser } from '@prisma/client';
import { db } from '@/lib/db';
import { initializeUsage } from '@/lib/subscription/service';
import type { User } from './types';

/**
 * Make sure a Supabase Auth user has a matching profile row (and a free plan).
 * Profiles are created on first sign-in, so this covers email sign-ups,
 * Google sign-ins and users added from the Supabase dashboard.
 */
export async function ensureProfile(authUser: SupabaseUser): Promise<DbUser> {
  const emailVerified = Boolean(authUser.email_confirmed_at);
  const existing = await db.user.findUnique({ where: { id: authUser.id } });

  if (existing) {
    if (existing.email_verified !== emailVerified || existing.email !== authUser.email) {
      return db.user.update({
        where: { id: authUser.id },
        data: { email_verified: emailVerified, email: authUser.email ?? existing.email },
      });
    }
    return existing;
  }

  const meta = authUser.user_metadata ?? {};
  const fullName: string = meta.full_name || meta.name || '';
  const [givenName, ...rest] = fullName.split(' ');
  const provider = authUser.app_metadata?.provider ?? 'email';

  let profile: DbUser;
  try {
    profile = await db.user.create({
      data: {
        id: authUser.id,
        email: authUser.email!.toLowerCase(),
        first_name: meta.first_name || meta.given_name || givenName || null,
        last_name: meta.last_name || meta.family_name || rest.join(' ') || null,
        auth_provider: provider,
        google_id: provider === 'google' ? (meta.provider_id ?? meta.sub ?? null) : null,
        google_picture_url: meta.avatar_url || meta.picture || null,
        email_verified: emailVerified,
      },
    });
  } catch (err) {
    // Another request created the profile at the same time
    const created = await db.user.findUnique({ where: { id: authUser.id } });
    if (created) return created;
    throw err;
  }

  await initializeUsage(profile.id).catch((err) => {
    console.error('Failed to initialize usage for user:', err);
  });

  return profile;
}

/** Shape a profile row for the client. */
export function toPublicUser(profile: DbUser): User {
  return {
    ...profile,
    created_at: profile.created_at.toISOString(),
    updated_at: profile.updated_at.toISOString(),
  } as unknown as User;
}

/** The site's public URL, used in email and OAuth redirect links. */
export function getSiteUrl(request: Request): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || new URL(request.url).origin;
}
