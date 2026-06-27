'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Order } from '@/app/food/types'

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: '🕐 Pending',
  confirmed: '✅ Confirmed',
  done: '🎉 Done',
}

const STATUS_COLORS: Record<Order['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  done: 'bg-green-100 text-green-700 border-green-200',
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

  const fetchOrders = useCallback(async () => {
    const res = await fetch('/api/food/orders')
    const data = await res.json()
    setOrders(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 30_000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  async function advanceStatus(orderId: string) {
    const order = orders.find(o => o.id === orderId)
    if (!order) return
    const next = NEXT_STATUS[order.status]
    if (!next) return

    setUpdating(orderId)
    const updated = orders.map(o => o.id === orderId ? { ...o, status: next } : o)
    await fetch('/api/food/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders: updated }),
    })
    setOrders(updated)
    setUpdating(null)
  }

  // Group by time slot
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
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-amber-600 text-xl animate-pulse">Loading orders... 📋</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-8 px-4 text-center shadow-lg">
        <h1 className="text-3xl font-bold">📋 Orders</h1>
        <p className="text-amber-100 text-sm mt-1">Auto-refreshes every 30s</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-amber-600">{orders.length}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium uppercase">Total Orders</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-yellow-500">{pendingCount}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium uppercase">Pending</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-green-600">₪{totalRevenue.toFixed(0)}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium uppercase">Revenue</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-xl">No orders yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedSlots.map(slot => (
              <div key={slot}>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-lg font-bold text-gray-700">⏰ {slot}</h2>
                  <span className="text-sm text-gray-400">{grouped[slot].length} order{grouped[slot].length !== 1 ? 's' : ''}</span>
                </div>
                <div className="space-y-3">
                  {grouped[slot].map(order => {
                    const nextStatus = NEXT_STATUS[order.status]
                    return (
                      <div key={order.id} className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-gray-800 text-lg">{order.customerName}</span>
                              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_COLORS[order.status]}`}>
                                {STATUS_LABELS[order.status]}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm mt-0.5">📱 {order.phone}</p>
                            <p className="text-gray-300 text-xs mt-0.5 font-mono">{order.id.slice(0, 8)}…</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-amber-600">₪{order.total.toFixed(2)}</p>
                            {nextStatus && (
                              <button
                                onClick={() => advanceStatus(order.id)}
                                disabled={updating === order.id}
                                className="mt-1 text-xs bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 text-white font-semibold px-3 py-1.5 rounded-full transition"
                              >
                                {updating === order.id ? '…' : `→ ${STATUS_LABELS[nextStatus]}`}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 border-t border-gray-50 pt-3 space-y-1">
                          {order.items.map(item => (
                            <div key={item.productId} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {item.productName} <span className="text-gray-400">× {item.quantity}</span>
                              </span>
                              <span className="text-gray-700 font-medium">₪{(item.price * item.quantity).toFixed(2)}</span>
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
      </div>
    </div>
  )
}
