'use client'

import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import type { Order } from '@/app/food/types'

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'ממתינה',
  confirmed: 'אושרה',
  done: 'הושלמה',
}

const STATUS_COLORS: Record<Order['status'], string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  done: 'bg-gray-100 text-gray-500 border-gray-200',
}

const NEXT_STATUS: Record<Order['status'], Order['status'] | null> = {
  pending: 'confirmed',
  confirmed: 'done',
  done: null,
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [liveStatus, setLiveStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')

  const fetchOrders = useCallback(async () => {
    const res = await fetch('/api/food/orders')
    const data = await res.json()
    setOrders(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchOrders()

    let connected = false
    let socket: Socket
    try {
      socket = io('http://localhost:3001', { transports: ['websocket', 'polling'] })
      socket.on('connect', () => {
        connected = true
        setLiveStatus('connected')
        socket.emit('join-food-orders')
      })
      socket.on('disconnect', () => {
        connected = false
        setLiveStatus('disconnected')
      })
      socket.on('food-update', () => fetchOrders())
    } catch {
      setLiveStatus('disconnected')
    }

    const interval = setInterval(() => {
      if (!connected) fetchOrders()
    }, 30_000)

    return () => {
      clearInterval(interval)
      socket?.disconnect()
    }
  }, [fetchOrders])

  async function advanceStatus(orderId: string) {
    const order = orders.find(o => o.id === orderId)
    if (!order) return
    const next = NEXT_STATUS[order.status]
    if (!next) return
    setUpdating(orderId)
    const updated = orders.map(o => o.id === orderId ? { ...o, status: next } : o)
    await fetch('/api/food/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orders: updated }) })
    setOrders(updated)
    setUpdating(null)
  }

  const grouped = orders.reduce<Record<string, Order[]>>((acc, order) => {
    if (!acc[order.timeSlot]) acc[order.timeSlot] = []
    acc[order.timeSlot].push(order)
    return acc
  }, {})

  const sortedSlots = Object.keys(grouped).sort()
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
  const pendingCount = orders.filter(o => o.status === 'pending').length

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400 text-sm">טוען הזמנות...</p>
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

      <main className="px-4 py-6 max-w-2xl mx-auto">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            <p className="text-xs text-gray-400 mt-1">הזמנות</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
            <p className="text-xs text-gray-400 mt-1">ממתינות</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">₪{totalRevenue.toFixed(0)}</p>
            <p className="text-xs text-gray-400 mt-1">הכנסות</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-sm">אין הזמנות עדיין.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedSlots.map(slot => (
              <div key={slot}>
                <div className="flex items-baseline gap-3 mb-2">
                  <h2 className="text-sm font-bold text-gray-800">{slot}</h2>
                  <span className="text-xs text-gray-400">{grouped[slot].length} הזמנות</span>
                </div>
                <div className="space-y-2">
                  {grouped[slot].map(order => {
                    const nextStatus = NEXT_STATUS[order.status]
                    return (
                      <div key={order.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <div className="px-4 py-3 flex items-start justify-between gap-3">
                          <div className="text-right min-w-0">
                            <div className="flex items-center gap-2 justify-end flex-wrap">
                              <span className={`text-xs px-2 py-0.5 rounded border font-medium ${STATUS_COLORS[order.status]}`}>
                                {STATUS_LABELS[order.status]}
                              </span>
                              <span className="font-semibold text-gray-900">{order.customerName}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{order.phone}</p>
                          </div>
                          <div className="text-left flex-shrink-0">
                            <p className="font-bold text-gray-900">₪{order.total.toFixed(2)}</p>
                            {nextStatus && (
                              <button
                                onClick={() => advanceStatus(order.id)}
                                disabled={updating === order.id}
                                className="mt-1 text-xs bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium px-3 py-1.5 rounded-lg transition"
                              >
                                {updating === order.id ? '...' : STATUS_LABELS[nextStatus]}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="border-t border-gray-50 divide-y divide-gray-50">
                          {order.items.map(item => (
                            <div key={item.productId} className="flex justify-between items-center px-4 py-2 text-xs">
                              <span className="text-gray-600">₪{(item.price * item.quantity).toFixed(2)}</span>
                              <span className="text-gray-500">
                                {item.productName} <span className="text-gray-300">× {item.quantity}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
