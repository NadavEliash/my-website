'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Product, ProductOption, OptionChoice, SelectedOption, OrderItem } from '@/app/food/types'

// a single ordered unit: optionId -> chosen choices
type Unit = Record<string, OptionChoice[]>
// cart: productId -> list of ordered units (one options section each)
type CartMap = Record<string, Unit[]>

export type CartResult = {
  items: OrderItem[]         // grouped order items, ready to send
  total: number
  count: number              // number of ordered units
  hasUnmetRequired: boolean  // any unit still missing a required option?
}

export const EMPTY_CART: CartResult = { items: [], total: 0, count: 0, hasUnmetRequired: false }

// ── cart → order helpers ──────────────────────────────────────────────────────
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

// group identical units so the summary reads e.g. "2 ×"
function buildItems(cart: CartMap, products: Product[]): OrderItem[] {
  const items: OrderItem[] = []
  for (const [productId, units] of Object.entries(cart)) {
    const p = products.find(x => x.id === productId)
    if (!p) continue
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
  return items
}

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

// ── MenuSelector — the shared menu + cart used by customer and waitress pages ──
export default function MenuSelector({
  products,
  onChange,
}: {
  products: Product[]
  onChange: (result: CartResult) => void
}) {
  const [cart, setCart] = useState<CartMap>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  // product whose + button is currently nudging (hint to add another)
  const [hintId, setHintId] = useState<string | null>(null)

  // recompute the order result and notify the parent whenever the cart changes
  useEffect(() => {
    const items = buildItems(cart, products)
    const total = items.reduce((s, it) => s + it.price * it.quantity, 0)
    const count = Object.values(cart).reduce((a, units) => a + units.length, 0)
    const hasUnmetRequired = Object.entries(cart).some(([id, units]) => {
      const p = products.find(x => x.id === id)
      if (!p) return false
      const required = (p.options ?? []).filter(o => o.required)
      return units.some(u => required.some(o => (u[o.id] ?? []).length === 0))
    })
    onChange({ items, total, count, hasUnmetRequired })
    // onChange is expected to be stable (e.g. a useState setter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, products])

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

  const availableProducts = products.filter(p => p.available)

  if (availableProducts.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-400">אין פריטים זמינים כרגע.</p>
      </div>
    )
  }

  return (
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
  )
}
