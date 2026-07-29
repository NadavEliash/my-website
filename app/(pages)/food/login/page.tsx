'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

export default function StaffLoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // already logged in? skip straight to the dashboard
  useEffect(() => {
    fetch('/api/food/auth')
      .then(r => r.json())
      .then(d => { if (d.authed) router.replace('/food/dashboard') })
      .catch(() => {})
  }, [router])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/food/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'שם משתמש או סיסמה שגויים')
        setSubmitting(false)
        return
      }
      router.replace('/food/dashboard')
    } catch {
      setError('שגיאה בהתחברות, נסו שוב.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" dir="rtl">
      <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-sm">
        <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center mb-5">
          <Lock size={18} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">כניסת צוות</h1>
        <p className="text-gray-400 text-sm mb-6">התחברו כדי לנהל את החנות.</p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">שם משתמש</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-3 text-gray-800 text-right text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">סיסמה</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-3 text-gray-800 text-right text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
            />
          </div>
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting || !name.trim() || !password}
          className="w-full mt-6 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-xl transition text-sm"
        >
          {submitting ? 'מתחבר...' : 'כניסה'}
        </button>
      </form>
    </div>
  )
}
