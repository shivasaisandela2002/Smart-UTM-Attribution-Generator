import { NextResponse } from 'next/server';
import { getLinks, saveLink } from '@/lib/db';

export async function GET() {
  try {
    const links = await getLinks();
    return NextResponse.json(links);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (Array.isArray(body)) {
      const savedLinks = [];
      for (const link of body) {
        savedLinks.push(await saveLink(link));
      }
      return NextResponse.json(savedLinks, { status: 201 });
    } else {
      const newLink = await saveLink(body);
      return NextResponse.json(newLink, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save link' }, { status: 500 });
  }
}
