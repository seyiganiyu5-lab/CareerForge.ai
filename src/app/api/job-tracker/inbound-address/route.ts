import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { db } from '@/lib/db';
import { inboundAddress, inboundDomain, newInboundToken } from '@/lib/job-tracker/inbound';

async function issueToken(userId: string): Promise<string> {
  // Retry on the (very unlikely) chance of a token collision
  for (let i = 0; i < 3; i++) {
    const token = newInboundToken();
    try {
      await db.user.update({ where: { id: userId }, data: { inbound_email_token: token } });
      return token;
    } catch (err) {
      if (i === 2) throw err;
    }
  }
  throw new Error('unreachable');
}

/**
 * GET /api/job-tracker/inbound-address — the user's personal forwarding address
 * (created on first use). `enabled` is false until the site has an email domain set up.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const domain = inboundDomain();
    if (!domain) return NextResponse.json({ success: true, enabled: false });

    const user = await db.user.findUnique({ where: { id: auth.userId }, select: { inbound_email_token: true } });
    const token = user?.inbound_email_token || (await issueToken(auth.userId));
    return NextResponse.json({ success: true, enabled: true, address: inboundAddress(token, domain) });
  } catch (error) {
    console.error('Inbound address error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load your address' }, { status: 500 });
  }
}

/**
 * POST /api/job-tracker/inbound-address — make a new address (the old one stops working)
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const domain = inboundDomain();
    if (!domain) return NextResponse.json({ success: true, enabled: false });

    const token = await issueToken(auth.userId);
    return NextResponse.json({ success: true, enabled: true, address: inboundAddress(token, domain) });
  } catch (error) {
    console.error('Inbound address reset error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create a new address' }, { status: 500 });
  }
}
