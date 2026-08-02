'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, ArrowLeft, ChevronRight } from 'lucide-react'
import type { Product, Settings, Order } from '@/app/food/types'
import { MAX_PER_SLOT } from '@/app/food/types'
import { generateSlots, ORDER_DRAFT_KEYS } from '@/app/food/utils'
import AnalogClock, { type ClockSlot } from '@/app/components/food/analog-clock'
import MenuSelector, { EMPTY_CART, type CartResult } from '@/app/components/food/menu-selector'

// ── FoodStorePage ────────────────────────────────────────────────────────────
export default function FoodStorePage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [cart, setCart] = useState<CartResult>(EMPTY_CART)
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  // two-step flow: pick products, then pick a pickup time window (take-away only)
  const [step, setStep] = useState<'menu' | 'time'>('menu')
  const [loading, setLoading] = useState(true)
  const [loadingDots, setLoadingDots] = useState('')
  // gate persistence until the saved draft is restored, so the initial empty
  // values don't overwrite it on mount
  const [draftRestored, setDraftRestored] = useState(false)

  useEffect(() => {
    async function load() {
      const [pRes, sRes, oRes] = await Promise.all([
        fetch('/api/food/products'),
        fetch('/api/food/settings'),
        fetch('/api/food/orders'),
      ])
      const [prods, sett, ords] = await Promise.all([pRes.json(), sRes.json(), oRes.json()])
      setProducts(prods)
      setSettings(sett)
      setOrders(Array.isArray(ords) ? ords : [])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingDots(prev => (prev.length < 3 ? prev + '.' : ''))
    }, 200)
    return () => clearInterval(interval)
  }, [])

  // in-house service = served on the spot, no pickup-time selection at all
  const inHouse = settings?.serviceMode === 'in-house'
  const scheduleDays = settings?.scheduleDays ?? []
  const selectedDayConfig = scheduleDays.find(d => d.date === selectedDate)
  const slots = selectedDayConfig
    ? generateSlots(selectedDayConfig.start, selectedDayConfig.end, selectedDayConfig.slotMinutes)
    : []

  // count orders already booked per slot on the selected day, to cap each slot
  const slotCounts: Record<string, number> = {}
  for (const o of orders) {
    if (o.pickupDate === selectedDate && o.pickupTime) {
      slotCounts[o.pickupTime] = (slotCounts[o.pickupTime] ?? 0) + 1
    }
  }
  const clockSlots: ClockSlot[] = slots.map(t => ({ time: t, disabled: (slotCounts[t] ?? 0) >= MAX_PER_SLOT }))
  const selectedSlotFull = !!selectedSlot && (slotCounts[selectedSlot] ?? 0) >= MAX_PER_SLOT

  // default the time picker to the earliest available window instead of leaving it empty
  useEffect(() => {
    if (selectedSlot) return
    const firstEnabled = clockSlots.find(s => !s.disabled)
    if (firstEnabled) setSelectedSlot(firstEnabled.time)
  }, [clockSlots, selectedSlot])

  function formatDisplayDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'numeric' })
  }

  // restore an in-progress order draft (date / slot / step) once on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(ORDER_DRAFT_KEYS.time)
      if (raw) {
        const d = JSON.parse(raw)
        if (d.selectedDate) setSelectedDate(d.selectedDate)
        if (d.selectedSlot) setSelectedSlot(d.selectedSlot)
        if (d.step === 'time') setStep('time')
      }
    } catch { /* ignore malformed / unavailable storage */ }
    setDraftRestored(true)
  }, [])

  // keep the draft in sync with the current selections (after restore)
  useEffect(() => {
    if (!draftRestored) return
    try {
      sessionStorage.setItem(ORDER_DRAFT_KEYS.time, JSON.stringify({ selectedDate, selectedSlot, step }))
    } catch { /* ignore unavailable storage */ }
  }, [selectedDate, selectedSlot, step, draftRestored])

  // if the cart empties (e.g. all orders removed), fall back to the menu step —
  // but only on a genuine >0 → 0 transition, never during the restore where the
  // cart momentarily reads empty before MenuSelector rehydrates it
  const prevCount = useRef(cart.count)
  useEffect(() => {
    if (prevCount.current > 0 && cart.count === 0 && step === 'time') setStep('menu')
    prevCount.current = cart.count
  }, [cart.count, step])

  function handleProceed() {
    const timeSlot = inHouse
      ? ''
      : selectedDate ? `${formatDisplayDate(selectedDate)} · ${selectedSlot}` : selectedSlot
    localStorage.setItem('food-cart', JSON.stringify({
      items: cart.items,
      timeSlot,
      pickupDate: inHouse ? undefined : selectedDate,
      pickupTime: inHouse ? undefined : selectedSlot,
    }))
    router.push('/food/checkout')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
        <div className="w-32 flex flex-row">
        <p className="text-gray-500 text-xl tracking-wide">טוען תפריט</p>
        <span className="text-gray-500 text-xl tracking-wide">{loadingDots}</span>
        </div>
      </div>
    )
  }

  if (!settings?.open) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 px-6" dir="rtl">
        <div className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center mb-2">
          <div className="w-3 h-3 rounded-full bg-gray-300" />
        </div>
        <h1 className="text-xl font-semibold text-gray-800">החנות סגורה כרגע</h1>
        <p className="text-gray-400 text-sm text-center max-w-xs">לא מקבלים הזמנות בשלב זה. בדקו שוב מאוחר יותר.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-gray-900 text-white px-4 pt-10 pb-6">
        {step === 'time' && (
          <button onClick={() => setStep('menu')} className="flex items-center gap-1 text-gray-400 text-sm mb-4 hover:text-white transition">
            <ChevronRight size={16} />
            <span>חזרה לתפריט</span>
          </button>
        )}
        <h1 className="text-2xl font-bold tracking-wide">{step === 'menu' ? 'התפריט' : 'בחירת מועד איסוף'}</h1>
        <p className="text-gray-400 text-lg mt-1">{step === 'menu' ? 'מה בא לכם לאכול' : 'מתי תרצו את ההזמנה?'}</p>
      </header>

      <main className="px-4 py-6 max-w-2xl mx-auto">
        {step === 'menu' && (
          <MenuSelector products={products} onChange={setCart} persistKey={ORDER_DRAFT_KEYS.cart} />
        )}

        {step === 'time' && scheduleDays.length > 0 && (
          <div className="space-y-4">
            {/* step 1: pick a date */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={14} className="text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-700">בחר תאריך</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {scheduleDays.map(day => (
                  <button
                    key={day.id}
                    onClick={() => { setSelectedDate(day.date); setSelectedSlot('') }}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition ${
                      selectedDate === day.date
                        ? 'bg-gray-900 border-gray-900 text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {formatDisplayDate(day.date)}
                  </button>
                ))}
              </div>
            </div>

            {/* step 2: pick a time slot on the clock (drag the hand; full slots are greyed out) */}
            {selectedDate && slots.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-1">בחרו שעה</h2>
                <p className="text-xs text-gray-400 mb-1">גררו את מחוג השעון לשעה הרצויה. שעות מלאות מסומנות באפור.</p>
                <AnalogClock slots={clockSlots} value={selectedSlot} onChange={setSelectedSlot} />
                {clockSlots.length > 0 && clockSlots.every(s => s.disabled) ? (
                  <p className="text-xs text-amber-600 text-center mt-1">כל החלונות ביום זה מלאים</p>
                ) : selectedSlotFull ? (
                  <p className="text-xs text-amber-600 text-center mt-1">החלון מלא, בחרו שעה אחרת</p>
                ) : null}
              </div>
            )}
          </div>
        )}

        {step === 'time' && scheduleDays.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-12">אין מועדי איסוף זמינים כרגע.</p>
        )}

        {step === 'time' && scheduleDays.length > 0 && (!selectedDate || !selectedSlot) && (
          <p className="text-xs text-gray-400 mt-3">יש לבחור תאריך ושעה כדי להמשיך</p>
        )}
      </main>

      {cart.count > 0 && (
        <div className="fixed bottom-0 inset-x-0 p-4 bg-white border-t border-gray-100 safe-area-bottom">
          {step === 'menu' ? (
            <>
              {cart.hasUnmetRequired && (
                <p className="text-xs text-center text-amber-600 mb-2">יש להשלים בחירות חובה בכל ההזמנות</p>
              )}
              <button
                onClick={() => (inHouse ? handleProceed() : setStep('time'))}
                disabled={cart.hasUnmetRequired}
                className="w-full flex items-center justify-between bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-5 py-4 rounded-xl transition"
              >
                <span className="text-2xl font-bold" dir="ltr">₪{cart.total.toFixed(2)}</span>
                <div className="flex items-center gap-2 text-sm">
                  <span>{inHouse ? 'המשך לתשלום' : 'המשך לבחירת חלון זמן'}</span>
                  <ArrowLeft size={16} />
                </div>
              </button>
            </>
          ) : (
            <button
              onClick={handleProceed}
              disabled={!selectedSlot || !selectedDate || cart.hasUnmetRequired || selectedSlotFull}
              className="w-full flex items-center justify-between bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-5 py-4 rounded-xl transition"
            >
              <span className="text-2xl font-bold" dir="ltr">₪{cart.total.toFixed(2)}</span>
              <div className="flex items-center gap-2 text-sm">
                <span>המשך לתשלום</span>
                <ArrowLeft size={16} />
              </div>
            </button>
          )}
        </div>
      )}

      {cart.count > 0 && <div className="h-24" />}
    </div>
  )
}
