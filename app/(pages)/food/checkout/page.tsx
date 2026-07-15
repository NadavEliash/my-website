'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Check } from 'lucide-react'
import type { OrderItem, Settings } from '@/app/food/types'

type CartData = { items: OrderItem[]; timeSlot: string }
type SuccessData = { id: string; customerName: string; timeSlot: string; total: number }

export default function CheckoutPage() {
  const router = useRouter()
  const [cartData, setCartData] = useState<CartData | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<SuccessData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem('food-cart')
    if (!raw) { router.push('/food'); return }
    setCartData(JSON.parse(raw))
    fetch('/api/food/settings').then(r => r.json()).then(setSettings)
  }, [router])

  if (!cartData) return null

  const total = cartData.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  async function handlePlaceOrder() {
    if (!customerName.trim() || !phone.trim()) { setError('יש למלא שם וטלפון.'); return }
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
      const res = await fetch('/api/food/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) })
      if (!res.ok) throw new Error()
      localStorage.removeItem('food-cart')
      setSuccess({ id: order.id, customerName: order.customerName, timeSlot: order.timeSlot, total })
    } catch {
      setError('משהו השתבש. נסה שוב.')
    } finally {
      setSubmitting(false)
    }
  }

  function buildBitLink(t: number) {
    if (!settings?.bitPhone) return null
    return `https://www.bitpay.co.il/app/me/send-money/${settings.bitPhone}?sum=${t.toFixed(2)}&description=${encodeURIComponent('הזמנת אוכל')}`
  }

  function buildPayboxLink() {
    if (!settings?.payboxPhone) return null
    return `https://payboxapp.page.link/?link=https://paybox.co.il/qpay/${settings.payboxPhone}&apn=com.paybox.android&ibi=com.paybox.paybox`
  }

  if (success) {
    const bitLink = buildBitLink(success.total)
    const payboxLink = buildPayboxLink()
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4" dir="rtl">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-sm">
          <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center mb-5">
            <Check size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">ההזמנה התקבלה</h1>
          <p className="text-gray-400 text-sm mb-6">תודה, {success.customerName}. ההזמנה שלך נקלטה במערכת.</p>

          <div className="border border-gray-100 rounded-xl divide-y divide-gray-50 mb-6 text-sm">
            <div className="flex justify-between px-4 py-3">
              <span className="text-gray-500">שעת איסוף</span>
              <span className="font-medium text-gray-800">{success.timeSlot}</span>
            </div>
            <div className="flex justify-between px-4 py-3">
              <span className="text-gray-500">סה״כ לתשלום</span>
              <span className="font-bold text-gray-900">₪{success.total.toFixed(2)}</span>
            </div>
          </div>

          {(bitLink || payboxLink) && (
            <div className="space-y-2 mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2">תשלום</p>
              {bitLink && (
                <a href={bitLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between w-full border border-blue-200 bg-blue-50 text-blue-800 font-semibold px-4 py-3.5 rounded-xl text-sm transition hover:bg-blue-100">
                  <span>שלם עם Bit</span>
                  <span className="text-xs font-mono text-blue-400">₪{success.total.toFixed(2)}</span>
                </a>
              )}
              {payboxLink && (
                <a href={payboxLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between w-full border border-green-200 bg-green-50 text-green-800 font-semibold px-4 py-3.5 rounded-xl text-sm transition hover:bg-green-100">
                  <span>שלם עם Paybox</span>
                  <span className="text-xs font-mono text-green-400">₪{success.total.toFixed(2)}</span>
                </a>
              )}
              <div className="flex items-center justify-between w-full border border-gray-100 bg-gray-50 text-gray-300 font-semibold px-4 py-3.5 rounded-xl text-sm select-none">
                <span>Google Pay</span>
                <span className="text-xs">בקרוב</span>
              </div>
            </div>
          )}

          <button onClick={() => router.push('/food')}
            className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition">
            חזרה לתפריט
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-gray-900 text-white px-4 pt-10 pb-6">
        <button onClick={() => router.push('/food')} className="flex items-center gap-1 text-gray-400 text-sm mb-4 hover:text-white transition">
          <ChevronRight size={16} />
          <span>תפריט</span>
        </button>
        <h1 className="text-2xl font-bold tracking-tight">סיום הזמנה</h1>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">סיכום</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {cartData.items.map(item => (
              <div key={item.productId} className="px-4 py-3">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-gray-900 text-sm">₪{(item.price * item.quantity).toFixed(2)}</span>
                  <div className="text-right">
                    <span className="text-sm text-gray-800">{item.productName}</span>
                    <span className="text-gray-400 text-xs mr-1">× {item.quantity}</span>
                  </div>
                </div>
                {item.selectedOptions && item.selectedOptions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5 justify-end">
                    {item.selectedOptions.map(sel => (
                      <span key={sel.optionId} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">
                        {sel.label}: {sel.choice}{sel.priceAdd > 0 ? ` (+₪${sel.priceAdd % 1 === 0 ? sel.priceAdd : sel.priceAdd.toFixed(2)})` : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
            <span className="font-bold text-gray-900">₪{total.toFixed(2)}</span>
            <div className="text-right">
              <span className="text-xs text-gray-400">שעת איסוף: </span>
              <span className="text-sm font-medium text-gray-700">{cartData.timeSlot}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">פרטים אישיים</h2>
          </div>
          <div className="px-4 py-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">שם מלא</label>
              <input
                type="text"
                dir="rtl"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="ישראל ישראלי"
                className="w-full border border-gray-200 rounded-lg px-3 py-3 text-gray-800 text-right text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">מספר טלפון</label>
              <input
                type="tel"
                dir="rtl"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="050-1234567"
                className="w-full border border-gray-200 rounded-lg px-3 py-3 text-gray-800 text-right text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
              />
            </div>
            {error && <p className="text-red-500 text-xs text-right">{error}</p>}
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={submitting}
          className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-4 rounded-xl transition text-sm"
        >
          {submitting ? 'שולח...' : 'אישור הזמנה'}
        </button>
      </main>
    </div>
  )
}
