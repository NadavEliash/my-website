'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, ChevronRight, Check } from 'lucide-react'
import type { Product, Order } from '@/app/food/types'
import StaffShell from '@/app/components/food/staff-shell'
import MenuSelector, { EMPTY_CART, type CartResult } from '@/app/components/food/menu-selector'

const WAITRESS_KEY = 'food-waitress-name'

export default function WaitressPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartResult>(EMPTY_CART)
  const [step, setStep] = useState<'menu' | 'details'>('menu')
  const [customerName, setCustomerName] = useState('')
  const [waitressName, setWaitressName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetch('/api/food/products').then(r => r.json()).then(setProducts).catch(() => {})
    // remember the waitress across orders so she doesn't retype her name each time
    try { setWaitressName(localStorage.getItem(WAITRESS_KEY) ?? '') } catch {}
  }, [])

  async function submit() {
    if (!customerName.trim()) { setError('יש להזין שם לקוח.'); return }
    if (!waitressName.trim()) { setError('יש להזין שם מלצר/ית.'); return }
    setError('')
    setSubmitting(true)
    const order: Order = {
      id: crypto.randomUUID(),
      customerName: customerName.trim(),
      phone: '',
      waitress: waitressName.trim(),
      items: cart.items,
      timeSlot: '',
      total: cart.total,
      status: 'waiting',
      createdAt: new Date().toISOString(),
    }
    try {
      const res = await fetch('/api/food/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      })
      if (!res.ok) throw new Error()
      try { localStorage.setItem(WAITRESS_KEY, waitressName.trim()) } catch {}
      setDone(true)
    } catch {
      setError('שליחת ההזמנה נכשלה, נסו שוב.')
      setSubmitting(false)
    }
  }

  function newOrder() {
    setDone(false)
    setSubmitting(false)
    setCart(EMPTY_CART)
    setCustomerName('')
    setStep('menu')
    // keep waitressName for the next customer
  }

  // ── success screen ───────────────────────────────────────────────────────────
  if (done) {
    return (
      <StaffShell>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4" dir="rtl">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-sm text-center">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
              <Check size={22} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">ההזמנה נשלחה</h1>
            <p className="text-gray-400 text-sm mb-6">ההזמנה של {customerName.trim()} נקלטה במערכת.</p>
            <button onClick={newOrder} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3.5 rounded-xl transition text-sm">
              הזמנה חדשה
            </button>
          </div>
        </div>
      </StaffShell>
    )
  }

  return (
    <StaffShell>
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <header className="bg-gray-900 text-white px-4 pt-4 pb-6">
          {step === 'details' && (
            <button onClick={() => setStep('menu')} className="flex items-center gap-1 text-gray-400 text-sm mb-4 hover:text-white transition">
              <ChevronRight size={16} />
              <span>חזרה לתפריט</span>
            </button>
          )}
          <h1 className="text-2xl font-bold tracking-wide">{step === 'menu' ? 'הזמנה חדשה' : 'פרטי ההזמנה'}</h1>
          <p className="text-gray-400 text-lg mt-1">{step === 'menu' ? 'בחרו את הפריטים עבור הלקוח' : 'מי הלקוח ומי רושם/ת את ההזמנה'}</p>
        </header>

        <main className="px-4 py-6 max-w-2xl mx-auto">
          {step === 'menu' && (
            <MenuSelector products={products} onChange={setCart} />
          )}

          {step === 'details' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">סה״כ</p>
                <p className="text-4xl font-bold text-gray-900" dir="ltr">₪{cart.total.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">שם הלקוח</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="שם הלקוח"
                    className="w-full border border-gray-200 rounded-lg px-3 py-3 text-gray-800 text-right text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">שם המלצר/ית</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={waitressName}
                    onChange={e => setWaitressName(e.target.value)}
                    placeholder="שמך"
                    className="w-full border border-gray-200 rounded-lg px-3 py-3 text-gray-800 text-right text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                  />
                </div>
                {error && <p className="text-red-500 text-xs text-right">{error}</p>}
              </div>

              <button
                onClick={submit}
                disabled={submitting}
                className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-4 rounded-xl transition text-sm"
              >
                {submitting ? 'שולח...' : 'שליחת הזמנה'}
              </button>
            </div>
          )}
        </main>

        {step === 'menu' && cart.count > 0 && (
          <>
            <div className="fixed bottom-0 inset-x-0 p-4 bg-white border-t border-gray-100 safe-area-bottom">
              {cart.hasUnmetRequired && (
                <p className="text-xs text-center text-amber-600 mb-2">יש להשלים בחירות חובה בכל ההזמנות</p>
              )}
              {/* total is the centerpiece of the footer, in a large font */}
              <p className="text-center text-4xl font-bold text-gray-900 mb-3" dir="ltr">₪{cart.total.toFixed(2)}</p>
              <button
                onClick={() => setStep('details')}
                disabled={cart.hasUnmetRequired}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-5 py-4 rounded-xl transition"
              >
                <span>{cart.count} פריטים · המשך לפרטי הלקוח</span>
                <ArrowLeft size={16} />
              </button>
            </div>
            <div className="h-32" />
          </>
        )}
      </div>
    </StaffShell>
  )
}
