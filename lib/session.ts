import { cookies } from 'next/headers';

const COOKIE_NAME = 'trip-os-bot-session';

export type BotSession = {
  userId: string;
  userKey: string;
  conversationId: string;
};

export async function getSession(): Promise<BotSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    return JSON.parse(sessionCookie.value) as BotSession;
  } catch (e) {
    return null;
  }
}

export async function saveSession(session: BotSession) {
  const cookieStore = await cookies();
  
  cookieStore.set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
