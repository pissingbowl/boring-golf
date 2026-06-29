import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Express, RequestHandler, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { db } from '../db';
import { users } from '@shared/models/auth';
import { eq } from 'drizzle-orm';

let supabase: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('Supabase env vars missing at runtime');
    }

    supabase = createClient(url, key);
  }

  return supabase;
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: 'sessions',
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
      maxAge: sessionTtl,
    },
  });
}

declare module 'express-session' {
  interface SessionData {
    userId: string;
    email: string;
    accessToken: string;
    refreshToken: string;
  }
}

export async function setupSupabaseAuth(app: Express) {
  app.set('trust proxy', 1);
  app.use(getSession());
}

export const isAuthenticated: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

export async function upsertUser(userData: {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}) {
  const [user] = await db
    .insert(users)
    .values({
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: userData.email,
        firstName: userData.firstName || undefined,
        lastName: userData.lastName || undefined,
        updatedAt: new Date(),
      },
    })
    .returning();
  return user;
}

export async function getUser(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function updateUserProfile(id: string, data: Partial<typeof users.$inferInsert>) {
  const [user] = await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();
  return user;
}
