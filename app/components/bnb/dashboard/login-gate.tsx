'use client'

import { useState } from 'react'
import { login } from '../api'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const SESSION_KEY = 'bnb_session'

export function getSession(): { hostId: string; token: string } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function saveSession(hostId: string, token: string) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ hostId, token }))
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}

interface Props {
  onAuth: (hostId: string, token: string) => void
}

export default function LoginGate({ onAuth }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) return
    setError('')
    setLoading(true)
    try {
      const { token, hostId } = await login(username.trim(), password)
      saveSession(hostId, token)
      onAuth(hostId, token)
    } catch (err: any) {
      setError(err.message || 'שגיאה בכניסה')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm" dir="rtl">
        <div className="text-center mb-8">
          <h1 className="mt-3 text-xl font-bold text-gray-900">סוויטת ים המלח</h1>
          <p className="text-sm text-gray-500 mt-1">כניסה למארח</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">שם משתמש</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E05A3A]/30 focus:border-[#E05A3A] transition-colors"
              placeholder="הזן שם משתמש"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">סיסמה</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E05A3A]/30 focus:border-[#E05A3A] transition-colors pe-10"
                placeholder="הזן סיסמה"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}
                className="absolute inset-y-0 end-3 flex items-center text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button type="submit" disabled={loading || !username.trim() || !password}
            className="w-full bg-[#E05A3A] hover:bg-[#c44428] disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            כניסה
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          <a href="/deadseabnb/signin" className="hover:text-gray-600 transition-colors">מארח חדש? הרשם כאן</a>
        </p>
      </div>
    </div>
  )
}
