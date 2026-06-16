import { verify } from 'argon2';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

/**
 * Page-context auth gate. Throws NEXT_REDIRECT to /login on failure.
 * Use this in page components and server components.
 */
export async function requireAuth(): Promise<{ userId: string }> {
  const session = await getSession();
  if (!session.userId) {
    redirect('/login');
  }
  return { userId: session.userId };
}

/**
 * Route-handler auth gate. Returns a 401 NextResponse on failure, or null on success.
 * Use this at the top of every protected API route. Callers must early-return
 * the response if it is non-null:
 *
 *   const unauthorized = await requireApiAuth();
 *   if (unauthorized) return unauthorized;
 */
export async function requireApiAuth(): Promise<NextResponse | null> {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = process.env.AUTH_PASSWORD_HASH;
  if (!hash) throw new Error('AUTH_PASSWORD_HASH not set');
  return verify(hash, password);
}

export async function isAuthed(): Promise<boolean> {
  const session = await getSession();
  return !!session.userId;
}
