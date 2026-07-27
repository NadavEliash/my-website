'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronRight, Check, Copy } from 'lucide-react'
import type { OrderItem, Settings, Order } from '@/app/food/types'

type CartData = { items: OrderItem[]; timeSlot: string; pickupDate?: string; pickupTime?: string }

// Bit/Paybox have no public deep link that pre-fills recipient + amount (and Paybox's old
// page.link is dead since Firebase Dynamic Links shut down). So "קח אותי לתשלום" just opens
// the app (via its store link, which offers "Open" when installed) and the customer pastes
// the copied number manually. Verify these links match your region's listing if needed.
const PAY_APPS = {
  Bit: {
    label: 'ביט',
    icon: '/bit.svg',
    btnClass: 'bg-blue-500 hover:bg-blue-600',
    ios: 'https://apps.apple.com/app/id1182007739',
    android: 'https://play.google.com/store/apps/details?id=com.bnhp.payments.paymentsapp',
  },
  Paybox: {
    label: 'פייבוקס',
    icon: '/paybox.jpg',
    btnClass: 'bg-emerald-500 hover:bg-emerald-600',
    ios: 'https://apps.apple.com/il/app/paybox/id1499167765',
    android: 'https://play.google.com/store/apps/details?id=com.payboxapp',
  },
} as const
type PayApp = keyof typeof PAY_APPS

function openPayApp(app: PayApp) {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent || '')
  const url = isIOS ? PAY_APPS[app].ios : PAY_APPS[app].android
  window.open(url, '_blank', 'noopener,noreferrer')
}

function PaymentModal({ app, phone, total, onClose }: { app: PayApp; phone: string; total: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  function copyPhone() {
    navigator.clipboard?.writeText(phone).catch(() => {})
    setCopied(true)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" dir="rtl" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <Image src={PAY_APPS[app].icon} alt={PAY_APPS[app].label} width={48} height={48} className="rounded-xl mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900 text-center mb-5">מיד תועברו לאפליקציית {PAY_APPS[app].label}</h2>

        <button onClick={copyPhone} className="flex items-center justify-between w-full bg-gray-100 hover:bg-gray-200 rounded-xl px-4 py-3 mb-4 transition">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            {copied ? <><Check size={14} /> הועתק</> : <><Copy size={14} /> העתקת מספר</>}
          </span>
          <span className="font-mono font-semibold text-gray-900 text-base" dir="ltr">{phone}</span>
        </button>

        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 text-center">
          <p className="text-xs text-gray-400 mb-1">באפליקציה בחרו</p>
          <p className="text-sm font-medium text-gray-800">העברה ← העברה למס׳ טלפון ← הדבק</p>
        </div>
        
        <span className='text-3xl font-semibold text-gray-900 text-center mb-4 block'>סה״כ ₪{total}</span>

        {!copied && <p className="text-xs text-amber-600 text-center mb-2">יש להעתיק את המספר</p>}

        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition">
            ביטול
          </button>
          <button onClick={() => openPayApp(app)} disabled={!copied}
            className={`flex-1 text-white font-semibold py-3 rounded-xl text-sm transition ${copied ? PAY_APPS[app].btnClass : 'bg-gray-300 cursor-not-allowed'}`}>
            לתשלום באפליקציה
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cartData, setCartData] = useState<CartData | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [deliveryId, setDeliveryId] = useState('')
  const [step, setStep] = useState<'details' | 'pay'>('details')
  const [payApp, setPayApp] = useState<PayApp | null>(null)
  const [error, setError] = useState('')
  const [orderError, setOrderError] = useState('')
  const placedRef = useRef(false)

  useEffect(() => {
    const raw = localStorage.getItem('food-cart')
    if (!raw) { router.push('/food'); return }
    setCartData(JSON.parse(raw))
    fetch('/api/food/settings').then(r => r.json()).then(setSettings)
  }, [router])

  const deliveryOptions = settings?.deliveryOptions ?? []
  const selectedDelivery = deliveryOptions.find(o => o.id === deliveryId)
  const itemsTotal = cartData ? cartData.items.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0
  const total = itemsTotal + (selectedDelivery?.price ?? 0)

  // name must contain at least 3 letters; phone at least 9 digits
  const nameValid = (customerName.match(/\p{L}/gu)?.length ?? 0) >= 3
  const phoneValid = phone.replace(/\D/g, '').length >= 9
  const deliveryValid = deliveryOptions.length === 0 || !!selectedDelivery

  // create the order when the customer reaches the final (payment) step — never before
  async function placeOrder() {
    if (placedRef.current || !cartData) return
    placedRef.current = true
    const order: Order = {
      id: crypto.randomUUID(),
      customerName: customerName.trim(),
      phone: phone.trim(),
      items: cartData.items,
      timeSlot: cartData.timeSlot,
      pickupDate: cartData.pickupDate,
      pickupTime: cartData.pickupTime,
      delivery: selectedDelivery ? { label: selectedDelivery.label, price: selectedDelivery.price } : undefined,
      total,
      status: 'waiting',
      createdAt: new Date().toISOString(),
    }
    try {
      const res = await fetch('/api/food/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) })
      if (!res.ok) throw new Error()
      localStorage.removeItem('food-cart')
    } catch {
      placedRef.current = false
      setOrderError('שמירת ההזמנה נכשלה, נסו שוב.')
    }
  }

  useEffect(() => {
    if (step === 'pay') placeOrder()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  function goToPay() {
    if (!nameValid) { setError('יש להזין שם מלא (לפחות 3 אותיות).'); return }
    if (!phoneValid) { setError('יש להזין מספר טלפון תקין.'); return }
    if (!deliveryValid) { setError('יש לבחור אפשרות משלוח.'); return }
    setError('')
    setStep('pay')
  }

  if (!cartData) return null

  // ── final step: thank-you + payment ──────────────────────────────────────────
  if (step === 'pay') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4" dir="rtl">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-sm">
          <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center mb-5">
            <Check size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">תודה {customerName.trim()}!</h1>
          <p className="text-gray-400 text-sm mb-6">ההזמנה שלכם תיקלט לאחר ביצוע התשלום.</p>

          <div className="border border-gray-100 rounded-xl divide-y divide-gray-50 mb-6 text-sm">
            <div className="flex justify-between px-4 py-3">
              <span className="text-gray-500">שעת איסוף</span>
              <span className="font-medium text-gray-800">{cartData.timeSlot}</span>
            </div>
            {selectedDelivery && (
              <div className="flex justify-between px-4 py-3">
                <span className="text-gray-500">{selectedDelivery.label}</span>
                <span className="font-medium text-gray-800">{selectedDelivery.price > 0 ? `₪${selectedDelivery.price.toFixed(2)}` : 'חינם'}</span>
              </div>
            )}
            <div className="flex justify-between px-4 py-3">
              <span className="text-gray-500">סה״כ לתשלום</span>
              <span className="font-bold text-gray-900">₪{total.toFixed(0)}</span>
            </div>
          </div>

          {orderError && <p className="text-red-500 text-xs text-center mb-3">{orderError}</p>}

          {(settings?.bitPhone || settings?.payboxPhone) && (
            <div className="mb-4">
              <p className="text-xs text-gray-400 text-center mb-2">בחרו אמצעי תשלום</p>
              <div className="flex gap-2">
                {settings?.bitPhone && (
                  <button onClick={() => setPayApp('Bit')}
                    className="flex-1 flex items-center justify-around gap-2 border border-gray-200 hover:border-gray-400 bg-white text-gray-800 font-semibold py-3 rounded-xl text-lg transition">
                    {PAY_APPS.Bit.label}
                    <Image src={PAY_APPS.Bit.icon} alt="" width={48} height={48} className="rounded-md" />
                  </button>
                )}
                {settings?.payboxPhone && (
                  <button onClick={() => setPayApp('Paybox')}
                    className="flex-1 flex items-center justify-around gap-2 border border-gray-200 hover:border-gray-400 bg-white text-gray-800 font-semibold py-3 rounded-xl text-lg transition">
                    {PAY_APPS.Paybox.label}
                    <Image src={PAY_APPS.Paybox.icon} alt="" width={48} height={48} className="rounded-md" />
                  </button>
                )}
              </div>
            </div>
          )}

          <button onClick={() => setStep('details')}
            className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition">
            חזרה לעריכת הזמנה
          </button>
        </div>

        {payApp && (
          <PaymentModal
            app={payApp}
            phone={payApp === 'Bit' ? settings!.bitPhone! : settings!.payboxPhone!}
            total={total.toFixed(0)}
            onClose={() => setPayApp(null)}
          />
        )}
      </div>
    )
  }

  // ── details step: summary + personal details + delivery ──────────────────────
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
            {selectedDelivery && (
              <div className="flex justify-between items-center px-4 py-3">
                <span className="font-semibold text-gray-900 text-sm">{selectedDelivery.price > 0 ? `₪${selectedDelivery.price.toFixed(2)}` : 'חינם'}</span>
                <span className="text-sm text-gray-800">{selectedDelivery.label}</span>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
            <span className="font-bold text-gray-900">₪{total.toFixed(2)}</span>
            <div className="text-right">
              <span className="text-xs text-gray-400">שעת איסוף: </span>
              <span className="text-sm font-medium text-gray-700">{cartData.timeSlot}</span>
            </div>
          </div>
        </div>

        {deliveryOptions.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">אופן קבלת ההזמנה</h2>
            </div>
            <div className="px-4 py-4 flex flex-wrap gap-2">
              {deliveryOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setDeliveryId(opt.id)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition flex items-center gap-1.5 ${
                    deliveryId === opt.id
                      ? 'bg-gray-900 border-gray-900 text-white'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <span>{opt.label}</span>
                  {opt.price > 0 && (
                    <span className={deliveryId === opt.id ? 'text-gray-300 font-normal' : 'text-gray-400 font-normal'}>
                      +₪{opt.price % 1 === 0 ? opt.price : opt.price.toFixed(2)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

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
          onClick={goToPay}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 rounded-xl transition text-sm"
        >
          מעבר לתשלום
        </button>
      </main>
    </div>
  )
}
