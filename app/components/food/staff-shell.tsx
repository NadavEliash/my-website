'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut } from 'lucide-react'

const LINKS = [
  { href: '/food/dashboard', label: 'ניהול' },
  { href: '/food/waitress', label: 'מלצרים' },
  { href: '/food/orders', label: 'הזמנות' },
]

// Wraps every staff page: guards it behind the login (redirects to /food/login
// when there's no valid session) and renders the shared top navigation bar.
export default function StaffShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    let alive = true
    fetch('/api/food/auth')
      .then(r => r.json())
      .then(d => {
        if (!alive) return
        if (d.authed) setAuthed(true)
        else { setAuthed(false); router.replace('/food/login') }
      })
      .catch(() => { if (alive) { setAuthed(false); router.replace('/food/login') } })
    return () => { alive = false }
  }, [router])

  async function logout() {
    await fetch('/api/food/auth', { method: 'DELETE' }).catch(() => {})
    router.replace('/food/login')
  }

  // while verifying (or when unauthorized, before the redirect lands) render nothing
  if (authed !== true) return null

  return (
    <>
      <nav className="bg-gray-900 text-white sticky top-0 z-40 px-4 pt-8 pb-3" dir="rtl">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          <div className="flex gap-1">
            {LINKS.map(l => {
              const active = pathname === l.href
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    active ? 'bg-white text-gray-900' : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {l.label}
                </Link>
              )
            })}
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition"
          >
            <LogOut size={15} />
            <span>יציאה</span>
          </button>
        </div>
      </nav>
      {children}
    </>
  )
}
