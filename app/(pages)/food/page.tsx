'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Plus, ArrowLeft, Trash2, ChevronRight } from 'lucide-react'
import type { Product, ProductOption, OptionChoice, SelectedOption, Settings, OrderItem, Order } from '@/app/food/types'
import { MAX_PER_SLOT } from '@/app/food/types'
import { generateSlots } from '@/app/food/utils'
import AnalogClock, { type ClockSlot } from '@/app/components/food/analog-clock'

// a single ordered unit: optionId -> chosen choices
type Unit = Record<string, OptionChoice[]>
// cart: productId -> list of ordered units (one options section each)
type CartMap = Record<string, Unit[]>

// ── OptionsPicker — renders option groups for one order unit ──────────────────
type OptionsPickerProps = {
  product: Product
  selection: Unit
  onPick: (optId: string, choice: OptionChoice, multiple: boolean) => void
}

function OptionsPicker({ product, selection, onPick }: OptionsPickerProps) {
  const options = (product.options ?? []).filter(o => o.choices.some(c => c.label))
  if (options.length === 0) return null

  return (
    <div className="px-3 pb-3 pt-1 space-y-3">
      {options.map((opt: ProductOption) => {
        const selected = selection[opt.id] ?? []
        return (
          <div key={opt.id}>
            <div className="flex items-center gap-1 mb-1.5">
              {opt.required && <span className="text-red-400 text-xs font-bold leading-none">*</span>}
              <span className="text-xs font-semibold text-gray-700">{opt.label}</span>
              {opt.multiple && <span className="text-xs text-gray-400">בחירה מרובה</span>}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {opt.choices.filter(c => c.label).map((choice, i) => {
                const isSelected = opt.multiple
                  ? selected.some(c => c.label === choice.label)
                  : selected[0]?.label === choice.label
                return (
                  <button
                    key={i}
                    onClick={() => onPick(opt.id, choice, !!opt.multiple)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-gray-900 border-gray-900 text-white'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <span>{choice.label}</span>
                    {choice.priceAdd > 0 && (
                      <span className="font-normal text-gray-400">
                        + ₪{choice.priceAdd % 1 === 0 ? choice.priceAdd : choice.priceAdd.toFixed(2)}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── FoodStorePage ────────────────────────────────────────────────────────────
export default function FoodStorePage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [cart, setCart] = useState<CartMap>({})
  const [orders, setOrders] = useState<Order[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  // product whose + button is currently nudging (hint to add another)
  const [hintId, setHintId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  // two-step flow: pick products, then pick a pickup time window
  const [step, setStep] = useState<'menu' | 'time'>('menu')
  const [loading, setLoading] = useState(true)
  const [loadingDots, setLoadingDots] = useState('')

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

  function formatDisplayDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'numeric' })
  }

  function buildSelectedOptions(product: Product, unit: Unit): SelectedOption[] {
    return (product.options ?? [])
      .filter(o => (unit[o.id] ?? []).length > 0)
      .map(o => {
        const sel = unit[o.id]
        return {
          optionId: o.id,
          label: o.label,
          choice: sel.map(c => c.label).join(', '),
          priceAdd: sel.reduce((s, c) => s + (c.priceAdd ?? 0), 0),
        }
      })
  }

  function unitTotal(product: Product, unit: Unit): number {
    return product.price + Object.values(unit).reduce((s, choices) => s + choices.reduce((t, c) => t + c.priceAdd, 0), 0)
  }

  const totalItems = Object.values(cart).reduce((a, units) => a + units.length, 0)
  const cartTotal = Object.entries(cart).reduce((sum, [id, units]) => {
    const p = products.find(x => x.id === id)
    if (!p) return sum
    return sum + units.reduce((s, u) => s + unitTotal(p, u), 0)
  }, 0)

  // any ordered unit still missing a required option?
  const hasUnmetRequired = Object.entries(cart).some(([id, units]) => {
    const p = products.find(x => x.id === id)
    if (!p) return false
    const required = (p.options ?? []).filter(o => o.required)
    return units.some(u => required.some(o => (u[o.id] ?? []).length === 0))
  })

  // clicking a card expands it for exploration (accordion — one open at a time)
  function toggleExpand(product: Product) {
    setExpandedId(cur => (cur === product.id ? null : product.id))
  }

  function pickOption(productId: string, unitIdx: number, optId: string, choice: OptionChoice, multiple: boolean) {
    setCart(prev => {
      const units = prev[productId] ?? []
      const unit = units[unitIdx] ?? {}
      const existing = unit[optId] ?? []
      const already = existing.some(c => c.label === choice.label)
      const next = multiple
        ? already ? existing.filter(c => c.label !== choice.label) : [...existing, choice]
        : already ? [] : [choice]
      const nextUnits = units.map((u, i) => (i === unitIdx ? { ...u, [optId]: next } : u))
      return { ...prev, [productId]: nextUnits }
    })
  }

  // while a product is expanded, repeatedly nudge its + button to hint the user can add another
  useEffect(() => {
    if (!expandedId) { setHintId(null); return }
    let clearBurst: ReturnType<typeof setTimeout>
    const burst = () => {
      setHintId(expandedId)
      clearBurst = setTimeout(() => setHintId(null), 1400) // ~2 pulses, then a pause
    }
    burst()
    const interval = setInterval(burst, 3200)
    return () => { clearInterval(interval); clearTimeout(clearBurst); setHintId(null) }
  }, [expandedId])

  // if the cart empties (e.g. all orders removed), fall back to the menu step
  useEffect(() => {
    if (totalItems === 0 && step === 'time') setStep('menu')
  }, [totalItems, step])

  // clicking + expands the product and appends another order section
  function addToCart(product: Product) {
    setExpandedId(product.id)
    setCart(prev => ({ ...prev, [product.id]: [...(prev[product.id] ?? []), {}] }))
  }

  // selecting an option while nothing is in the cart yet counts as pressing +:
  // it creates the first order unit with that choice
  function pickFirstOption(product: Product, optId: string, choice: OptionChoice) {
    setExpandedId(product.id)
    setCart(prev => ({ ...prev, [product.id]: [{ [optId]: [choice] }] }))
  }

  // header trash (collapsed) removes the most recent order for this product
  function removeFromCart(product: Product) {
    setCart(prev => {
      const units = prev[product.id] ?? []
      if (units.length <= 1) {
        const copy = { ...prev }
        delete copy[product.id]
        return copy
      }
      return { ...prev, [product.id]: units.slice(0, -1) }
    })
  }

  // per-order trash (expanded) removes that specific order
  function removeUnit(product: Product, idx: number) {
    setCart(prev => {
      const units = (prev[product.id] ?? []).filter((_, i) => i !== idx)
      if (units.length === 0) {
        const copy = { ...prev }
        delete copy[product.id]
        return copy
      }
      return { ...prev, [product.id]: units }
    })
  }

  function handleProceed() {
    const items: OrderItem[] = []
    for (const [productId, units] of Object.entries(cart)) {
      const p = products.find(x => x.id === productId)!
      // group identical orders so the summary reads e.g. "2 ×"
      const groups = new Map<string, { count: number; opts: SelectedOption[] }>()
      for (const u of units) {
        const opts = buildSelectedOptions(p, u)
        const key = JSON.stringify(opts.map(o => `${o.optionId}:${o.choice}`).sort())
        const g = groups.get(key)
        if (g) g.count++
        else groups.set(key, { count: 1, opts })
      }
      for (const { count, opts } of groups.values()) {
        items.push({
          productId,
          productName: p.name,
          quantity: count,
          price: p.price + opts.reduce((s, o) => s + o.priceAdd, 0),
          selectedOptions: opts.length > 0 ? opts : undefined,
        })
      }
    }
    const timeSlot = selectedDate ? `${formatDisplayDate(selectedDate)} · ${selectedSlot}` : selectedSlot
    localStorage.setItem('food-cart', JSON.stringify({
      items,
      timeSlot,
      pickupDate: selectedDate,
      pickupTime: selectedSlot,
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

  const availableProducts = products.filter(p => p.available)

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
        {step === 'menu' && (availableProducts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400">אין פריטים זמינים כרגע.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableProducts.map(product => {
              const units = cart[product.id] ?? []
              const qty = units.length
              const isInCart = qty > 0
              const isExpanded = expandedId === product.id
              const hasOpts = (product.options ?? []).some(o => o.choices.some(c => c.label))
              // price shown in the expanded corner: total of all this product's orders (or base while exploring)
              const displayPrice = qty === 0 ? product.price : units.reduce((s, u) => s + unitTotal(product, u), 0)

              return (
                <div
                  key={product.id}
                  className={`rounded-xl border overflow-hidden transition-all 
                    ${isInCart ? 'bg-amber-50 border-amber-200' : 'bg-white shadow-[0px_0px_17px_-3px_rgba(0,_0,_0,_0.3)]'}`}
                >
                  {/* header row — click to expand/collapse for exploring details */}
                  <div className="flex items-center cursor-pointer" onClick={() => toggleExpand(product)}>
                    {product.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image} alt={product.name} className="w-24 h-24 object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 p-3 min-w-0">
                      <h2 className="font-semibold text-gray-900 text-xl leading-tight">{product.name}</h2>
                      <p className={`text-gray-500 text-md mt-0.5 ${isExpanded ? '' : 'line-clamp-2'}`}>{product.description}</p>
                    </div>
                    {/* add / remove controls (plus on the left, trash to its right) */}
                    <div dir="ltr" className="flex items-center gap-2 px-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => addToCart(product)}
                        className={`w-11 h-11 rounded-full bg-gray-900 hover:bg-gray-700 flex items-center justify-center text-white transition ${hintId === product.id ? 'animate-nudge' : ''}`}
                        aria-label="הוסף"
                      >
                        <Plus size={22} />
                      </button>
                      {isInCart && !isExpanded && (
                        <button
                          onClick={() => removeFromCart(product)}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition"
                          aria-label="הסר הזמנה"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* expanded details — one options section per order, price in the bottom-left corner */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      {/* not selected yet — show the options; picking one adds it like pressing + */}
                      {qty === 0 && hasOpts && (
                        <OptionsPicker
                          product={product}
                          selection={{}}
                          onPick={(optId, choice) => pickFirstOption(product, optId, choice)}
                        />
                      )}
                      {units.map((unit, idx) => (
                        <div key={idx} className={idx > 0 ? 'border-t border-gray-100' : ''}>
                          <div className="flex items-center justify-between gap-2 px-3 pt-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-700">{product.name}</span>
                              <span className="w-5 h-5 flex items-center justify-center rounded-full border border-gray-300 text-xs font-semibold text-gray-500">{idx + 1}</span>
                            </div>
                            <button
                              onClick={() => removeUnit(product, idx)}
                              className="p-1.5 text-red-400 hover:text-red-600 transition"
                              aria-label="הסר הזמנה"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          {hasOpts && (
                            <OptionsPicker
                              product={product}
                              selection={unit}
                              onPick={(optId, choice, multiple) => pickOption(product.id, idx, optId, choice, multiple)}
                            />
                          )}
                        </div>
                      ))}
                      <div dir="ltr" className="px-3 pb-3 pt-2 border-t border-gray-100">
                        <span className="font-bold text-gray-900 text-lg">₪{displayPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}

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

      {totalItems > 0 && (
        <div className="fixed bottom-0 inset-x-0 p-4 bg-white border-t border-gray-100 safe-area-bottom">
          {step === 'menu' ? (
            <>
              {hasUnmetRequired && (
                <p className="text-xs text-center text-amber-600 mb-2">יש להשלים בחירות חובה בכל ההזמנות</p>
              )}
              <button
                onClick={() => setStep('time')}
                disabled={hasUnmetRequired}
                className="w-full flex items-center justify-between bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-5 py-4 rounded-xl transition"
              >
                <div className="flex flex-col items-start">
                  <span className="text-sm">{totalItems} פריטים נבחרו</span>
                  {cartTotal > 0 && <span className="text-xs text-gray-400">₪{cartTotal.toFixed(2)}</span>}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span>המשך לבחירת חלון זמן</span>
                  <ArrowLeft size={16} />
                </div>
              </button>
            </>
          ) : (
            <button
              onClick={handleProceed}
              disabled={!selectedSlot || !selectedDate || hasUnmetRequired || selectedSlotFull}
              className="w-full flex items-center justify-between bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-5 py-4 rounded-xl transition"
            >
              <div className="flex flex-col items-start">
                <span className="text-sm">{totalItems} פריטים</span>
                {cartTotal > 0 && <span className="text-xs text-gray-400">₪{cartTotal.toFixed(2)}</span>}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>המשך לתשלום</span>
                <ArrowLeft size={16} />
              </div>
            </button>
          )}
        </div>
      )}

      {totalItems > 0 && <div className="h-24" />}
    </div>
  )
}
