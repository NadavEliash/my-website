import type { Host } from './types'

function serverUrl() {
  if (typeof window === 'undefined') return 'http://localhost:3001'
  return window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://pizza-game-server.onrender.com'
}

export async function fetchAllHosts(): Promise<Host[]> {
  const res = await fetch(`${serverUrl()}/api/bnb/hosts`)
  if (!res.ok) throw new Error('Failed to load listings')
  return res.json()
}

export async function fetchHost(hostId: string): Promise<Host> {
  const res = await fetch(`${serverUrl()}/api/bnb/host/${hostId}`)
  if (!res.ok) throw new Error(`Host not found: ${hostId}`)
  return res.json()
}

export async function login(username: string, password: string): Promise<{ token: string; hostId: string }> {
  const res = await fetch(`${serverUrl()}/api/bnb/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const { error } = await res.json()
    throw new Error(error || 'Login failed')
  }
  return res.json()
}

export async function registerHost(
  hostId: string, username: string, name: string, password: string
): Promise<{ token: string; hostId: string }> {
  const res = await fetch(`${serverUrl()}/api/bnb/hosts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostId, username, name, password }),
  })
  if (!res.ok) {
    const { error } = await res.json()
    throw new Error(error || 'Registration failed')
  }
  return res.json()
}

export async function updateHost(hostId: string, token: string, data: Partial<Host>): Promise<Host> {
  const res = await fetch(`${serverUrl()}/api/bnb/host/${hostId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Save failed')
  return res.json()
}
