import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { db } from '@/lib/db';
import { z } from 'zod';

interface Reminder {
  id: string;
  title: string;
  date: string;
  type: string;
  completed: boolean;
}

const createReminderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  type: z.string().default('custom'),
  completed: z.boolean().default(false),
});

const updateReminderSchema = z.object({
  id: z.string().min(1),
  title: z.string().optional(),
  date: z.string().optional(),
  type: z.string().optional(),
  completed: z.boolean().optional(),
});

const deleteReminderSchema = z.object({
  id: z.string().min(1),
});

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/job-tracker/[id]/reminders
 */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(_request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const application = await db.jobApplication.findFirst({
      where: { id, user_id: auth.userId },
      select: { reminders: true },
    });
    if (!application) {
      return NextResponse.json({ success: false, error: 'Job application not found' }, { status: 404 });
    }

    let reminders: Reminder[] = [];
    try {
      reminders = JSON.parse(application.reminders || '[]');
    } catch {
      // Malformed JSON, return empty
    }

    return NextResponse.json({ success: true, reminders });
  } catch (error) {
    console.error('Reminders fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch reminders' }, { status: 500 });
  }
}

/**
 * POST /api/job-tracker/[id]/reminders — Add a reminder
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const application = await db.jobApplication.findFirst({
      where: { id, user_id: auth.userId },
      select: { reminders: true },
    });
    if (!application) {
      return NextResponse.json({ success: false, error: 'Job application not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = createReminderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    let reminders: Reminder[] = [];
    try {
      reminders = JSON.parse(application.reminders || '[]');
    } catch {
      reminders = [];
    }

    const newReminder: Reminder = {
      id: `rem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: parsed.data.title,
      date: parsed.data.date,
      type: parsed.data.type,
      completed: parsed.data.completed,
    };

    reminders.push(newReminder);

    await db.jobApplication.update({
      where: { id },
      data: { reminders: JSON.stringify(reminders) },
    });

    return NextResponse.json({ success: true, reminder: newReminder }, { status: 201 });
  } catch (error) {
    console.error('Reminder create error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create reminder' }, { status: 500 });
  }
}

/**
 * PUT /api/job-tracker/[id]/reminders — Update a reminder (e.g. mark completed)
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const application = await db.jobApplication.findFirst({
      where: { id, user_id: auth.userId },
      select: { reminders: true },
    });
    if (!application) {
      return NextResponse.json({ success: false, error: 'Job application not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateReminderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    let reminders: Reminder[] = [];
    try {
      reminders = JSON.parse(application.reminders || '[]');
    } catch {
      reminders = [];
    }

    const idx = reminders.findIndex(r => r.id === parsed.data.id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Reminder not found' }, { status: 404 });
    }

    // Merge updates
    reminders[idx] = { ...reminders[idx], ...parsed.data };

    await db.jobApplication.update({
      where: { id },
      data: { reminders: JSON.stringify(reminders) },
    });

    return NextResponse.json({ success: true, reminder: reminders[idx] });
  } catch (error) {
    console.error('Reminder update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update reminder' }, { status: 500 });
  }
}

/**
 * DELETE /api/job-tracker/[id]/reminders — Delete a reminder
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const application = await db.jobApplication.findFirst({
      where: { id, user_id: auth.userId },
      select: { reminders: true },
    });
    if (!application) {
      return NextResponse.json({ success: false, error: 'Job application not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = deleteReminderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    let reminders: Reminder[] = [];
    try {
      reminders = JSON.parse(application.reminders || '[]');
    } catch {
      reminders = [];
    }

    const filtered = reminders.filter(r => r.id !== parsed.data.id);
    if (filtered.length === reminders.length) {
      return NextResponse.json({ success: false, error: 'Reminder not found' }, { status: 404 });
    }

    await db.jobApplication.update({
      where: { id },
      data: { reminders: JSON.stringify(filtered) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reminder delete error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete reminder' }, { status: 500 });
  }
}
