import { NextResponse } from 'next/server';
import { z } from 'zod';
import argon2 from 'argon2';
import { getSession } from '@/lib/session';
import { checkLoginRateLimit } from '@/lib/auth-rate-limit';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown-ip';

    const { allowed, retryAfterMs } = checkLoginRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.', retryAfterMs },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = LoginSchema.parse(body);

    // Check against env vars
    const authEmail = process.env.AUTH_EMAIL;
    const authPasswordHash = process.env.AUTH_PASSWORD_HASH;

    if (!authEmail || !authPasswordHash) {
      return NextResponse.json(
        { error: 'Server misconfigured: missing auth environment variables' },
        { status: 500 }
      );
    }

    if (email !== authEmail) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify argon2 hash
    const isValid = await argon2.verify(authPasswordHash, password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session
    const session = await getSession();
    session.userId = 'single-user';
    session.email = email;
    await session.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.issues }, { status: 400 });
    }
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
