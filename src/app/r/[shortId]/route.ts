import { NextResponse } from 'next/server';
import { incrementClick } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ shortId: string }> }) {
  try {
    const { shortId } = await params;
    const fullUrl = await incrementClick(shortId);

    if (fullUrl) {
      return NextResponse.redirect(fullUrl);
    } else {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
