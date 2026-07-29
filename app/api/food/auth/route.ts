import { NextRequest, NextResponse } from 'next/server'
import type { Db } from 'mongodb'
import { getFoodDb } from '@/lib/food-db'
import { createToken, verifyToken, AUTH_COOKIE, AUTH_MAX_AGE } from '@/lib/food-auth'

// Credentials live in the settings collection under a dedicated doc so they are
// never exposed by the public GET /api/food/settings (which reads only _id:'main').
const AUTH_ID = 'auth'
const DEFAULT_USER = 'admin'
const DEFAULT_PASS = 'admin'

type AuthDoc = { user: string; password: string }

async function getAuthDoc(db: Db): Promise<AuthDoc> {
  const doc = await db.collection('settings').findOne({ _id: AUTH_ID as unknown as never })
  if (doc && typeof doc.user === 'string') return { user: doc.user, password: doc.password }
  // seed a default credential on first use so the owner can log in and then change it
  const seeded: AuthDoc = { user: DEFAULT_USER, password: DEFAULT_PASS }
  await db.collection('settings').updateOne(
    { _id: AUTH_ID as unknown as never },
    { $set: seeded },
    { upsert: true }
  )
  return seeded
}

function sessionCookie(user: string) {
  return {
    name: AUTH_COOKIE,
    value: createToken(user),
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: AUTH_MAX_AGE,
  }
}

// GET → current session status ({ authed, user })
export async function GET(req: NextRequest) {
  const user = verifyToken(req.cookies.get(AUTH_COOKIE)?.value)
  return NextResponse.json(user ? { authed: true, user } : { authed: false })
}

// POST → log in with { name, password }
export async function POST(req: NextRequest) {
  try {
    const { name, password } = await req.json()
    const db = await getFoodDb()
    const auth = await getAuthDoc(db)
    if ((name ?? '').trim() !== auth.user || (password ?? '') !== auth.password) {
      return NextResponse.json({ error: 'שם משתמש או סיסמה שגויים' }, { status: 401 })
    }
    const res = NextResponse.json({ ok: true, user: auth.user })
    res.cookies.set(sessionCookie(auth.user))
    return res
  } catch (e) {
    console.error('[food/auth POST]', e)
    return NextResponse.json({ error: 'שגיאה בהתחברות' }, { status: 500 })
  }
}

// PUT → change credentials (must already be logged in) with { name, password }
export async function PUT(req: NextRequest) {
  try {
    if (!verifyToken(req.cookies.get(AUTH_COOKIE)?.value)) {
      return NextResponse.json({ error: 'לא מורשה' }, { status: 401 })
    }
    const { name, password } = await req.json()
    if (!name?.trim() || !password) {
      return NextResponse.json({ error: 'יש להזין שם וסיסמה' }, { status: 400 })
    }
    const db = await getFoodDb()
    await db.collection('settings').updateOne(
      { _id: AUTH_ID as unknown as never },
      { $set: { user: name.trim(), password } },
      { upsert: true }
    )
    const res = NextResponse.json({ ok: true, user: name.trim() })
    res.cookies.set(sessionCookie(name.trim())) // refresh the cookie for the new username
    return res
  } catch (e) {
    console.error('[food/auth PUT]', e)
    return NextResponse.json({ error: 'שגיאה בעדכון פרטי הכניסה' }, { status: 500 })
  }
}

// DELETE → log out
export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set({ name: AUTH_COOKIE, value: '', httpOnly: true, path: '/', maxAge: 0 })
  return res
}
