import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/subscription/auth-helpers';
import { docWhere } from '@/lib/subscription/documents';

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

    const resume = await db.resume.findFirst({
      where: { id, ...(await docWhere(auth.userId)) },
    });

    if (!resume) {
      return NextResponse.json({ success: false, error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      resume: {
        id: resume.id,
        title: resume.title,
        data_json: resume.data_json,
        template: resume.template,
        customization_json: resume.customization_json,
        status: resume.status,
        created_at: resume.created_at,
        updated_at: resume.updated_at,
      },
    });
  } catch (error) {
    console.error('Resume fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch resume' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, data_json, template, customization_json, status } = body as {
      title?: string;
      data_json?: string;
      template?: string;
      customization_json?: string;
      status?: string;
    };

    const existing = await db.resume.findFirst({
      where: { id, ...(await docWhere(auth.userId)) },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Resume not found' }, { status: 404 });
    }

    const updated = await db.resume.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(data_json !== undefined && { data_json }),
        ...(template !== undefined && { template }),
        ...(customization_json !== undefined && { customization_json }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json({
      success: true,
      resume: {
        id: updated.id,
        title: updated.title,
        template: updated.template,
        customization_json: updated.customization_json,
        status: updated.status,
        created_at: updated.created_at,
        updated_at: updated.updated_at,
      },
    });
  } catch (error) {
    console.error('Resume update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update resume' }, { status: 500 });
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

    const existing = await db.resume.findFirst({
      where: { id, ...(await docWhere(auth.userId)) },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Resume not found' }, { status: 404 });
    }

    await db.resume.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Resume delete error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete resume' }, { status: 500 });
  }
}