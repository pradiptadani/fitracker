import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { getSession } from '@/lib/session';

export async function GET() {
  const authed = await isAuthed();
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const session = await getSession();
  return NextResponse.json({ data: { userId: session.userId, email: session.email } });
}
