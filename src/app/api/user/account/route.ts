import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { db } from '@/lib/db';

/**
 * DELETE /api/user/account — permanently delete the signed-in user's
 * login and all their data. Body must be { "confirm": true }.
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY (server-only) to remove the login from
 * Supabase Auth.
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    if (body?.confirm !== true) {
      return NextResponse.json({ success: false, error: 'Please confirm account deletion.' }, { status: 400 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      return NextResponse.json(
        { success: false, error: 'Account deletion is not set up yet. Add SUPABASE_SERVICE_ROLE_KEY to your .env file.' },
        { status: 503 }
      );
    }

    // Remove the login first, so a failure leaves the account fully intact
    const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await admin.auth.admin.deleteUser(auth.userId);
    if (error && error.status !== 404) {
      console.error('Delete account error:', error);
      return NextResponse.json({ success: false, error: 'Could not delete your account. Please try again.' }, { status: 500 });
    }

    // Resumes, cover letters, job applications, etc. are deleted with the profile.
    // (On Supabase a database trigger also does this when the login is removed.)
    await db.user.deleteMany({ where: { id: auth.userId } });

    // Clear the session cookies
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: 'local' });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
