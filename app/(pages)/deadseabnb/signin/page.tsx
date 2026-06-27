'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerHost } from '@/app/components/bnb/api'
import { saveSession } from '@/app/components/bnb/dashboard/login-gate'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

function toSlug(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function onlyAscii(s: string) {
  return s.replace(/[^\x20-\x7E]/g, '')
}

function validatePassword(pw: string): boolean {
  if (pw.length < 6) return false
  const kinds = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(r => r.test(pw))
  return kinds.length >= 2
}

export default function SignInPage() {
  const router = useRouter()
  const [name, setName]         = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [pwBlurred, setPwBlurred] = useState(false)
  const [confirm, setConfirm]   = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const pwInvalid  = !validatePassword(password)
  const matchError = confirm && confirm !== password ? 'הסיסמאות אינן תואמות' : null
  const canSubmit  = name.trim() && username.trim() && !pwInvalid && !matchError && confirm

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setError('')
    setLoading(true)
    try {
      const hostId = toSlug(username) || toSlug(name) || username.trim()
      const { token, hostId: returnedId } = await registerHost(
        hostId, username.trim(), name.trim(), password
      )
      saveSession(returnedId, token)
      router.push('/deadseabnb/dashboard')
    } catch (err: any) {
      setError(err.message || 'שגיאה ברישום')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E05A3A]/30 focus:border-[#E05A3A] transition-colors'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="mt-3 text-xl font-bold text-gray-900">רישום מארח חדש</h1>
          <p className="text-sm text-gray-500 mt-1">צור חשבון לניהול הנכס שלך</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">שם הנכס</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className={inputCls} placeholder="השם שיוצג לאורחים" autoComplete="name" autoFocus />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">שם משתמש <span className="text-gray-400 font-normal text-xs">(לכניסה בלבד)</span></label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              className={inputCls} placeholder="זכור את השם" autoComplete="username" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">סיסמה</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPassword(onlyAscii(e.target.value))}
                onBlur={() => setPwBlurred(true)}
                className={`${inputCls} pe-10 ${pwBlurred && pwInvalid ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''}`}
                placeholder="לפחות 6 תווים, 2 סוגים" autoComplete="new-password" />
              <button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}
                className="absolute inset-y-0 end-3 flex items-center text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {pwBlurred && pwInvalid && (
              <p className="text-xs text-red-500 mt-1.5">סיסמה חייבת להכיל 6 תווים, משני סוגי סימנים לפחות</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">אשר סיסמה</label>
            <input type={showPw ? 'text' : 'password'} value={confirm}
              onChange={e => setConfirm(onlyAscii(e.target.value))}
              className={`${inputCls} ${matchError ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''}`}
              placeholder="הזן את הסיסמה שוב" autoComplete="new-password" />
            {matchError && <p className="text-xs text-red-500 mt-1.5">{matchError}</p>}
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button type="submit" disabled={!canSubmit || loading}
            className="w-full bg-[#E05A3A] hover:bg-[#c44428] disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            צור חשבון
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          <a href="/deadseabnb/dashboard" className="hover:text-gray-600 transition-colors">כבר יש לי חשבון</a>
          {' · '}
          <a href="/deadseabnb" className="hover:text-gray-600 transition-colors">חזרה לרשימה</a>
        </p>
      </div>
    </div>
  )
}
