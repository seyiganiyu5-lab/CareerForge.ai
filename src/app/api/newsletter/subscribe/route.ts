import { NextRequest, NextResponse } from 'next/server';
import { subscribeSchema } from '@/lib/validation/newsletter';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { subscribe } from '@/lib/newsletter/subscribe';
import type { NewsletterSource, SubscriberLanguage } from '@/types/newsletter';

/**
 * POST /api/newsletter/subscribe
 *
 * Subscribe an email to the newsletter.
 *
 * Rate limit: 3 requests per IP per minute.
 *
 * Request body (JSON):
 *   { email: string, language?: 'en' | 'fr', source?: NewsletterSource }
 *
 * Responses:
 *   200 — Subscribed successfully (or reactivated)
 *   409 — Email already subscribed
 *   429 — Rate limit exceeded
 *   400 — Invalid request body
 *   500 — Server error
 */
export async function POST(request: NextRequest) {
  try {
    // ── Rate Limiting ──────────────────────────────────────────────
    const ip = getClientIp(request);
    const rateResult = rateLimit(ip, {
      maxRequests: 3,
      windowMs: 60 * 1000,
    });

    if (!rateResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'rate_limited',
          retryAfter: Math.ceil((rateResult.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              Math.ceil((rateResult.resetAt - Date.now()) / 1000)
            ),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // ── Parse & Validate ──────────────────────────────────────────
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'invalid_json' },
        { status: 400 }
      );
    }

    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          message: 'validation_error',
          details: firstError?.message ?? 'Invalid input',
        },
        { status: 400 }
      );
    }

    const { email, language, source } = parsed.data;

    // ── Sanitize source ───────────────────────────────────────────
    const validSources: NewsletterSource[] = [
      'landing',
      'blog',
      'help-center',
      'footer',
    ];
    const safeSource = validSources.includes(source) ? source : 'landing';
    const safeLanguage: SubscriberLanguage =
      language === 'fr' ? 'fr' : 'en';

    // ── Subscribe ─────────────────────────────────────────────────
    const result = await subscribe({
      email,
      language: safeLanguage,
      source: safeSource,
    });

    // ── Response ──────────────────────────────────────────────────
    const status = result.statusCode;
    const responseBody = {
      success: result.success,
      message: result.message,
    };

    return NextResponse.json(responseBody, {
      status,
      headers: {
        'X-RateLimit-Remaining': String(rateResult.remaining),
      },
    });
  } catch (error) {
    console.error('[Newsletter API] Unexpected error:', error);

    // Don't leak internal error details
    return NextResponse.json(
      { success: false, message: 'server_error' },
      { status: 500 }
    );
  }
}