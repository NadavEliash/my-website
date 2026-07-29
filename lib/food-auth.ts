import crypto from 'node:crypto'
import type { NextRequest } from 'next/server'

// Simple, stateless staff session for the food dashboard. A login issues an
// HMAC-signed cookie ("<user>.<exp>.<sig>"); we verify the signature + expiry
// on each request. Not fancy — no session store — but tamper-proof given a
// secret. Set FOOD_AUTH_SECRET in the environment for production.
const SECRET = process.env.FOOD_AUTH_SECRET || '';

export const AUTH_COOKIE = 'food_staff'
export const AUTH_MAX_AGE = 60 * 60 * 24 * 7 // 7 days, in seconds

function sign(payload: string): string {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('base64url')
}

export function createToken(user: string): string {
  const exp = Date.now() + AUTH_MAX_AGE * 1000
  const payload = `${Buffer.from(user).toString('base64url')}.${exp}`
  return `${payload}.${sign(payload)}`
}

// Returns the signed-in username, or null if the token is missing/invalid/expired.
export function verifyToken(token: string | undefined): string | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [u, exp, sig] = parts
  const payload = `${u}.${exp}`
  // constant-time compare to avoid leaking signature via timing
  const expected = sign(payload)
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  if (!Number(exp) || Number(exp) < Date.now()) return null
  try {
    return Buffer.from(u, 'base64url').toString('utf8')
  } catch {
    return null
  }
}

// Convenience for route handlers: returns the signed-in staff username from the
// request's session cookie, or null if there's no valid session.
export function staffFromRequest(req: NextRequest): string | null {
  return verifyToken(req.cookies.get(AUTH_COOKIE)?.value)
}
