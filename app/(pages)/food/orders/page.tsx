'use client'

import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { Trash2, Clock } from 'lucide-react'
import type { Order, OrderStatus } from '@/app/food/types'
import { normalizeStatus } from '@/app/food/types'

type Tab = 'orders' | 'timeline'

const STATUS_LABELS: Record<OrderStatus, string> = {
  waiting: 'בהמתנה',
  approved: 'מאושרת',
  sent: 'בוצעה',
}
// order-card background per status (matches the reference design)
const CARD_BG: Record<OrderStatus, string> = {
  waiting: 'bg-amber-50 border-amber-200',
  approved: 'bg-purple-100 border-purple-200',
  sent: 'bg-gray-50 border-gray-200',
}
// order-card status pill per status
const CARD_BADGE: Record<OrderStatus, string> = {
  waiting: 'border border-amber-300 text-amber-700',
  approved: 'bg-green-400 text-white',
  sent: 'bg-gray-200 text-gray-500',
}

function priceLabel(total: number) {
  return `${total % 1 === 0 ? total : total.toFixed(2)} שח`
}

// "פיצה מרגריטה + בצק מחמצת + זיתים"
function itemLine(it: Order['items'][number]) {
  const opts = (it.selectedOptions ?? []).map(o => o.choice.replace(/, /g, ' + ')).filter(Boolean)
  const line = [it.productName, ...opts].join(' + ')
  return it.quantity > 1 ? `${it.quantity} × ${line}` : line
}

// orders only carry a display timeSlot (e.g. "ד׳ 15.7 · 18:00") — pull the HH:MM out of it
function slotTime(o: Order): string {
  const m = o.timeSlot?.match(/(\d{1,2}:\d{2})/)
  return m ? m[1] : (o.timeSlot ?? '')
}
function slotMinutes(o: Order): number {
  const m = o.timeSlot?.match(/(\d{1,2}):(\d{2})/)
  return m ? Number(m[1]) * 60 + Number(m[2]) : Infinity
}

function pickupDateTime(o: Order): Date | null {
  if (!o.pickupDate || !o.pickupTime) return null
  const d = new Date(`${o.pickupDate}T${o.pickupTime}:00`)
  return isNaN(d.getTime()) ? null : d
}

// an approved order is "happening now" from its slot start until an hour after
function isNow(o: Order, now: Date | null): boolean {
  if (!now || o.status !== 'approved') return false
  const dt = pickupDateTime(o)
  if (!dt) return false
  const diff = now.getTime() - dt.getTime()
  return diff >= 0 && diff < 60 * 60 * 1000
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('orders')
  const [updating, setUpdating] = useState<string | null>(null)
  const [liveStatus, setLiveStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [now, setNow] = useState<Date | null>(null)
  const [loadingDots, setLoadingDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingDots(prev => (prev.length < 3 ? prev + '.' : ''))
    }, 200)
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = useCallback(async () => {
    const res = await fetch('/api/food/orders')
    const data = await res.json()
    const list: Order[] = (Array.isArray(data) ? data : []).map((o: Order) => ({ ...o, status: normalizeStatus(o.status) }))
    setOrders(list)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchOrders()
    setNow(new Date())
    const clock = setInterval(() => setNow(new Date()), 30_000)

    let connected = false
    let socket: Socket
    try {
      socket = io('http://localhost:3001', { transports: ['websocket', 'polling'] })
      socket.on('connect', () => { connected = true; setLiveStatus('connected'); socket.emit('join-food-orders') })
      socket.on('disconnect', () => { connected = false; setLiveStatus('disconnected') })
      socket.on('food-update', () => fetchOrders())
    } catch {
      setLiveStatus('disconnected')
    }

    const poll = setInterval(() => { if (!connected) fetchOrders() }, 30_000)

    return () => { clearInterval(poll); clearInterval(clock); socket?.disconnect() }
  }, [fetchOrders])

  async function saveOrders(updated: Order[]) {
    await fetch('/api/food/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orders: updated }) })
    setOrders(updated)
  }

  async function setStatus(id: string, status: OrderStatus) {
    setUpdating(id)
    await saveOrders(orders.map(o => o.id === id ? { ...o, status } : o))
    setUpdating(null)
  }

  async function removeOrder(id: string) {
    setUpdating(id)
    await saveOrders(orders.filter(o => o.id !== id))
    setUpdating(null)
  }

  // flat list of order cards, earliest pickup first
  const sortedOrders = [...orders].sort((a, b) => {
    const da = pickupDateTime(a)?.getTime() ?? new Date(a.createdAt).getTime()
    const db = pickupDateTime(b)?.getTime() ?? new Date(b.createdAt).getTime()
    return da - db
  })

  function dayLabel(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    if (isNaN(d.getTime())) return ''
    if (now) {
      const midnight = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
      const diff = Math.round((midnight(d) - midnight(now)) / 86_400_000)
      if (diff === 0) return 'היום'
      if (diff === 1) return 'מחר'
    }
    return d.toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'numeric' })
  }

  function slotLabel(o: Order) {
    if (o.pickupDate && o.pickupTime) return `${dayLabel(o.pickupDate)} ${o.pickupTime}`.trim()
    return o.timeSlot
  }

  const waitingCount = orders.filter(o => o.status === 'waiting').length
  const totalRevenue = orders.filter(o => o.status !== 'waiting').reduce((sum, o) => sum + o.total, 0)

  // timeline: only approved (not yet done) orders, sorted by their time slot
  const timelineOrders = orders
    .filter(o => o.status === 'approved')
    .sort((a, b) => slotMinutes(a) - slotMinutes(b))

  const nowHHMM = now ? `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}` : ''

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
        <div className="w-32 flex flex-row">
        <p className="text-gray-500 text-xl tracking-wide">טוען הזמנות</p>
        <span className="text-gray-500 text-xl tracking-wide">{loadingDots}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-gray-900 text-white px-4 pt-10 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">הזמנות</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {liveStatus === 'connected' ? 'עדכונים חיים' : liveStatus === 'connecting' ? 'מתחבר...' : 'עדכון כל 30 שניות'}
            </p>
          </div>
          <div className={`w-2 h-2 rounded-full ${liveStatus === 'connected' ? 'bg-green-400' : liveStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'}`} />
        </div>
      </header>

      <div className="px-4 pt-4 max-w-2xl mx-auto">
        <div className="flex border-b border-gray-200 mb-5">
          {(['orders', 'timeline'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition ${tab === t ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              {t === 'orders' ? 'הזמנות' : 'ציר זמן'}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 pb-10 max-w-2xl mx-auto">
        {tab === 'orders' ? (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                <p className="text-xs text-gray-400 mt-1">הזמנות</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{waitingCount}</p>
                <p className="text-xs text-gray-400 mt-1">ממתינות</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">₪{totalRevenue.toFixed(0)}</p>
                <p className="text-xs text-gray-400 mt-1">מאושרות</p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-24"><p className="text-gray-400 text-sm">אין הזמנות עדיין.</p></div>
            ) : (
              <div className="space-y-3">
                {sortedOrders.map(order => {
                  const nowBadge = isNow(order, now)
                  return (
                    <div key={order.id} className={`rounded-2xl border p-4 ${CARD_BG[order.status]}`}>
                      {/* header: name (right) · time (left) */}
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-bold text-gray-900 text-lg truncate">{order.customerName}</h3>
                        <p className="text-xs text-gray-400 mt-1 text-center" dir="ltr">{order.phone}</p>
                        <span className="font-bold text-gray-600 flex-shrink-0">{slotLabel(order)}</span>
                      </div>

                      {/* items, centered, with their options inline */}
                      <div className="space-y-0.5 mt-3">
                        {order.items.map(item => (
                          <p key={item.productId} className="text-sm text-emerald-700/80">{itemLine(item)}</p>
                        ))}
                      </div>

                      {order.delivery && (
                        <p className="text-xs text-gray-500 text-center mt-1">{order.delivery.label}{order.delivery.price > 0 ? ` · ₪${order.delivery.price.toFixed(2)}` : ''}</p>
                      )}
                      <p className="font-bold text-left text-gray-900 mt-2">{priceLabel(order.total)}</p>

                      {/* actions: status pill (right) · controls (left) */}
                      <div className="flex items-center justify-between gap-2 mt-3">
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${nowBadge ? 'bg-green-600 text-white' : CARD_BADGE[order.status]}`}>
                          {nowBadge ? 'הגיע הזמן' : STATUS_LABELS[order.status]}
                        </span>

                        <div className="flex items-center gap-2">
                          <button onClick={() => removeOrder(order.id)} disabled={updating === order.id}
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-100 hover:bg-red-200 text-red-500 transition disabled:opacity-50"
                            aria-label="הסר הזמנה">
                            <Trash2 size={16} />
                          </button>

                          {order.status === 'waiting' && (
                            <button onClick={() => setStatus(order.id, 'approved')} disabled={updating === order.id}
                              className="text-sm bg-green-500 hover:bg-green-600 disabled:bg-gray-200 text-white font-semibold px-4 py-2 rounded-lg transition">
                              אשר הזמנה
                            </button>
                          )}
                          {order.status === 'approved' && (
                            <>
                              <button onClick={() => setStatus(order.id, 'waiting')} disabled={updating === order.id}
                                className="text-xs text-gray-500 hover:text-gray-800 font-medium px-1.5 py-2 transition">
                                בטל אישור
                              </button>
                              <button onClick={() => setStatus(order.id, 'sent')} disabled={updating === order.id}
                                className="text-sm bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 text-white font-semibold px-4 py-2 rounded-lg transition">
                                אשר ביצוע
                              </button>
                            </>
                          )}
                          {order.status === 'sent' && (
                            <button onClick={() => setStatus(order.id, 'approved')} disabled={updating === order.id}
                              className="text-sm border border-gray-300 text-gray-600 hover:bg-gray-100 font-semibold px-4 py-2 rounded-lg transition">
                              בטל ביצוע
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="bg-gray-900 text-white rounded-2xl p-2 mb-6 flex flex-col items-center justify-between h-36">
                <p className="text-lg text-gray-400 mt-0.5">
                  {now ? now.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}
                </p>
                <p className="text-7xl font-bold tracking-tight tabular-nums" dir="ltr">{nowHHMM || '--:--'}</p>
            </div>

            {timelineOrders.length === 0 ? (
              <div className="text-center py-20"><p className="text-gray-400 text-sm">אין הזמנות מאושרות בציר הזמן.</p></div>
            ) : (
              <div className="space-y-2">
                {timelineOrders.map(order => {
                  const nowBadge = isNow(order, now)
                  return (
                    <div key={order.id} className={`bg-white rounded-xl border p-4 flex items-start justify-between gap-3 transition ${nowBadge ? 'border-green-300 ring-2 ring-green-100' : 'border-gray-100'}`}>
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`text-center flex-shrink-0 w-14 ${nowBadge ? 'text-green-600' : 'text-gray-800'}`}>
                          <p className="text-lg font-bold leading-none tabular-nums" dir="ltr">{slotTime(order)}</p>
                          {nowBadge && <p className="text-[10px] font-medium mt-1">עכשיו</p>}
                        </div>
                        <div className="min-w-0 border-r border-gray-100 pr-3">
                          <p className="font-semibold text-gray-900 text-sm">{order.customerName}</p>
                          {order.items.map(item => (
                            <p key={item.productId} className="text-xs text-emerald-700/80">{itemLine(item)}</p>
                          ))}
                          {order.delivery && <p className="text-xs text-gray-400 mt-0.5">{order.delivery.label}</p>}
                        </div>
                      </div>
                      <button
                        onClick={() => setStatus(order.id, 'sent')}
                        disabled={updating === order.id}
                        className="text-sm bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-4 py-2 rounded-lg transition flex-shrink-0"
                      >
                        הזמנה בוצעה
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
