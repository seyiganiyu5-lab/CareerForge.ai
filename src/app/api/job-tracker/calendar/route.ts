import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { db } from '@/lib/db';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  completed: boolean;
  applicationId?: string;
  applicationTitle?: string;
  companyName?: string;
}

/**
 * GET /api/job-tracker/calendar — All calendar events across applications
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Fetch all applications with relevant date fields
    const applications = await db.jobApplication.findMany({
      where: { user_id: auth.userId, is_archived: false },
      select: {
        id: true,
        company_name: true,
        job_title: true,
        interview_date: true,
        follow_up_date: true,
        deadline_date: true,
        offer_expiry: true,
        calendar_events: true,
      },
    });

    const events: CalendarEvent[] = [];

    for (const app of applications) {
      // Add built-in date fields as calendar events
      if (app.interview_date) {
        events.push({
          id: `interview-${app.id}`,
          title: `Interview: ${app.job_title} at ${app.company_name}`,
          date: app.interview_date.toISOString(),
          type: 'interview',
          completed: false,
          applicationId: app.id,
          applicationTitle: app.job_title,
          companyName: app.company_name,
        });
      }

      if (app.follow_up_date) {
        events.push({
          id: `followup-${app.id}`,
          title: `Follow-up: ${app.job_title} at ${app.company_name}`,
          date: app.follow_up_date.toISOString(),
          type: 'follow_up',
          completed: false,
          applicationId: app.id,
          applicationTitle: app.job_title,
          companyName: app.company_name,
        });
      }

      if (app.deadline_date) {
        events.push({
          id: `deadline-${app.id}`,
          title: `Deadline: ${app.job_title} at ${app.company_name}`,
          date: app.deadline_date.toISOString(),
          type: 'deadline',
          completed: false,
          applicationId: app.id,
          applicationTitle: app.job_title,
          companyName: app.company_name,
        });
      }

      if (app.offer_expiry) {
        events.push({
          id: `offer-expiry-${app.id}`,
          title: `Offer Expiry: ${app.job_title} at ${app.company_name}`,
          date: app.offer_expiry.toISOString(),
          type: 'offer_expiry',
          completed: false,
          applicationId: app.id,
          applicationTitle: app.job_title,
          companyName: app.company_name,
        });
      }

      // Parse custom calendar_events JSON
      try {
        const customEvents = JSON.parse(app.calendar_events || '[]') as Array<{
          id: string;
          title: string;
          date: string;
          type: string;
          completed: boolean;
        }>;

        for (const ce of customEvents) {
          events.push({
            ...ce,
            applicationId: app.id,
            applicationTitle: app.job_title,
            companyName: app.company_name,
          });
        }
      } catch {
        // Ignore malformed JSON
      }
    }

    // Sort by date
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Filter by date range if provided
    let filtered = events;
    if (from) {
      const fromDate = new Date(from);
      filtered = filtered.filter(e => new Date(e.date) >= fromDate);
    }
    if (to) {
      const toDate = new Date(to);
      filtered = filtered.filter(e => new Date(e.date) <= toDate);
    }

    return NextResponse.json({ success: true, events: filtered, total: filtered.length });
  } catch (error) {
    console.error('Job tracker calendar error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch calendar events' }, { status: 500 });
  }
}
