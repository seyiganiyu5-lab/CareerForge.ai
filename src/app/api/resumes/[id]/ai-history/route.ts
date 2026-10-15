import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { docWhere } from '@/lib/subscription/documents';

async function verifyOwnership(id: string, userId: string) {
  const resume = await db.resume.findFirst({ where: { id, ...(await docWhere(userId)) } });
  if (!resume) {
    return { ok: false, response: NextResponse.json({ success: false, error: 'Resume not found' }, { status: 404 }) };
  }
  return { ok: true, resume };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const ownership = await verifyOwnership(id, auth.userId);
    if (!ownership.ok) return ownership.response;

    const history = await db.aiHistory.findMany({
      where: { resume_id: id },
      orderBy: { created_at: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      history: history.map((item) => ({
        id: item.id,
        section: item.section,
        action: item.action,
        result: item.result,
        original_text: item.original_text,
        is_applied: item.is_applied,
        created_at: item.created_at,
      })),
    });
  } catch (error) {
    console.error('AI history fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch AI history' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const ownership = await verifyOwnership(id, auth.userId);
    if (!ownership.ok) return ownership.response;

    await db.aiHistory.deleteMany({ where: { resume_id: id } });

    return NextResponse.json({ success: true, message: 'History cleared' });
  } catch (error) {
    console.error('AI history clear error:', error);
    return NextResponse.json({ success: false, error: 'Failed to clear AI history' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const ownership = await verifyOwnership(id, auth.userId);
    if (!ownership.ok) return ownership.response;

    const body = await request.json();
    const { historyId } = body as { historyId?: string };

    if (!historyId) {
      return NextResponse.json({ success: false, error: 'historyId is required' }, { status: 400 });
    }

    await db.aiHistory.update({
      where: { id: historyId },
      data: { is_applied: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('AI history update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update AI history' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const ownership = await verifyOwnership(id, auth.userId);
    if (!ownership.ok) return ownership.response;

    const body = await request.json();
    const { historyId } = body as { historyId?: string };

    if (!historyId) {
      return NextResponse.json({ success: false, error: 'historyId is required' }, { status: 400 });
    }

    const historyItem = await db.aiHistory.findUnique({ where: { id: historyId } });

    if (!historyItem || historyItem.resume_id !== id) {
      return NextResponse.json({ success: false, error: 'History item not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      result: historyItem.result,
      section: historyItem.section,
      action: historyItem.action,
    });
  } catch (error) {
    console.error('AI history restore error:', error);
    return NextResponse.json({ success: false, error: 'Failed to restore from AI history' }, { status: 500 });
  }
}