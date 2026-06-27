'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { OrderItem } from '@/app/food/types'

type CartData = {
  items: OrderItem[]
  timeSlot: string
}

type SuccessData = {
  id: string
  customerName: string
  timeSlot: string
  total: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cartData, setCartData] = useState<CartData | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<SuccessData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem('food-cart')
    if (!raw) {
      router.push('/food')
      return
    }
    setCartData(JSON.parse(raw))
  }, [router])

  if (!cartData) return null

  const total = cartData.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  async function handlePlaceOrder() {
    if (!customerName.trim() || !phone.trim()) {
      setError('Please fill in your name and phone number.')
      return
    }
    setError('')
    setSubmitting(true)

    const order = {
      id: crypto.randomUUID(),
      customerName: customerName.trim(),
      phone: phone.trim(),
      items: cartData!.items,
      timeSlot: cartData!.timeSlot,
      total,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    }

    try {
      const res = await fetch('/api/food/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      })

      if (!res.ok) throw new Error('Failed to place order')

      localStorage.removeItem('food-cart')
      setSuccess({
        id: order.id,
        customerName: order.customerName,
        timeSlot: order.timeSlot,
        total,
      })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Placed!</h1>
          <p className="text-gray-500 mb-6">
            Thanks, <span className="font-semibold text-amber-600">{success.customerName}</span>! Your order is confirmed.
          </p>
          <div className="bg-amber-50 rounded-xl p-4 text-left space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Order ID</span>
              <span className="font-mono text-xs text-gray-700">{success.id.slice(0, 8)}…</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">⏰ Time Slot</span>
              <span className="font-semibold text-gray-800">{success.timeSlot}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-amber-600">₪{success.total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={() => router.push('/food')}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-full transition"
          >
            Back to Menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-8 px-4 text-center shadow-lg">
        <h1 className="text-3xl font-bold">🛒 Checkout</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📋 Order Summary</h2>
          <div className="space-y-3">
            {cartData.items.map(item => (
              <div key={item.productId} className="flex justify-between items-center">
                <div>
                  <span className="font-medium text-gray-800">{item.productName}</span>
                  <span className="text-gray-400 text-sm ml-2">× {item.quantity}</span>
                </div>
                <span className="text-amber-600 font-semibold">
                  ₪{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
            <div className="text-gray-500 text-sm">
              ⏰ <span className="font-medium text-gray-700">{cartData.timeSlot}</span>
            </div>
            <div className="text-xl font-bold text-gray-800">
              Total: <span className="text-amber-600">₪{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Your Details</h2>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="e.g. 050-1234567"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/food')}
            className="flex-1 border-2 border-amber-300 text-amber-700 font-semibold py-3 rounded-full hover:bg-amber-50 transition"
          >
            ← Back
          </button>
          <button
            onClick={handlePlaceOrder}
            disabled={submitting}
            className="flex-2 flex-grow-[2] bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 text-white font-bold py-3 rounded-full transition shadow-md"
          >
            {submitting ? 'Placing…' : 'Place Order ✓'}
          </button>
        </div>
      </div>
    </div>
  )
}
