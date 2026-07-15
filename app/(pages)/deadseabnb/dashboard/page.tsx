'use client'

import { useState, useEffect } from 'react'
import LoginGate, { getSession } from '@/app/components/bnb/dashboard/login-gate'
import DashboardView from '@/app/components/bnb/dashboard/dashboard-view'

export default function DashboardPage() {
  const [session, setSession] = useState<{ hostId: string; token: string } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setSession(getSession())
    setMounted(true)
  }, [])

  if (!mounted || !session) {
    return <LoginGate onAuth={(hostId, token) => setSession({ hostId, token })} />
  }

  return (
    <DashboardView
      hostId={session.hostId}
      token={session.token}
      onLogout={() => setSession(null)}
    />
  )
}
