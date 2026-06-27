'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Product, Settings, OrderItem } from '@/app/food/types'
import { generateSlots } from '@/app/food/utils'

type CartMap = Record<string, number>

export default function FoodStorePage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [cart, setCart] = useState<CartMap>({})
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [pRes, sRes] = await Promise.all([
        fetch('/api/food/products'),
        fetch('/api/food/settings'),
      ])
      const [prods, sett] = await Promise.all([pRes.json(), sRes.json()])
      setProducts(prods)
      setSettings(sett)
      setLoading(false)
    }
    load()
  }, [])

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0)
  const slots = settings
    ? generateSlots(settings.availabilityStart, settings.availabilityEnd, settings.slotMinutes)
    : []

  function setQty(productId: string, delta: number) {
    setCart(prev => {
      const cur = prev[productId] ?? 0
      const next = Math.max(0, cur + delta)
      if (next === 0) {
        const copy = { ...prev }
        delete copy[productId]
        return copy
      }
      return { ...prev, [productId]: next }
    })
  }

  function handleProceed() {
    const items: OrderItem[] = Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([productId, quantity]) => {
        const p = products.find(p => p.id === productId)!
        return {
          productId,
          productName: p.name,
          quantity,
          price: p.price,
        }
      })
    localStorage.setItem('food-cart', JSON.stringify({ items, timeSlot: selectedSlot }))
    router.push('/food/checkout')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-amber-600 text-xl animate-pulse">Loading menu... 🍽️</div>
      </div>
    )
  }

  if (!settings?.open) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-6xl">🔒</div>
        <h1 className="text-3xl font-bold text-amber-800">Shop is Closed</h1>
        <p className="text-amber-600 text-center max-w-sm">
          We&apos;re not taking orders right now. Please check back later!
        </p>
      </div>
    )
  }

  const availableProducts = products.filter(p => p.available)

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-8 px-4 text-center shadow-lg">
        <h1 className="text-4xl font-bold mb-1">🍕 Food Store</h1>
        <p className="text-amber-100 text-sm">Fresh, made to order</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {availableProducts.length === 0 ? (
          <div className="text-center py-20 text-amber-600">
            <div className="text-5xl mb-4">🥺</div>
            <p className="text-xl">No items available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableProducts.map(product => {
              const qty = cart[product.id] ?? 0
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-200"
                >
                  {product.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-44 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h2 className="text-lg font-bold text-gray-800">{product.name}</h2>
                    <p className="text-gray-500 text-sm mt-1 min-h-[40px]">{product.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-amber-600 font-bold text-lg">
                        ₪{product.price.toFixed(2)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQty(product.id, -1)}
                          disabled={qty === 0}
                          className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold text-lg flex items-center justify-center hover:bg-amber-200 disabled:opacity-30 transition"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-semibold text-gray-800">{qty}</span>
                        <button
                          onClick={() => setQty(product.id, 1)}
                          className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-lg flex items-center justify-center hover:bg-amber-600 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Time slot picker */}
        {totalItems > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4">⏰ Pick a Time Slot</h2>
            <div className="flex flex-wrap gap-2">
              {slots.map(slot => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`px-4 py-2 rounded-full border-2 font-medium text-sm transition ${
                    selectedSlot === slot
                      ? 'bg-amber-500 border-amber-500 text-white'
                      : 'bg-white border-amber-300 text-amber-700 hover:border-amber-500'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Proceed button */}
        {totalItems > 0 && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleProceed}
              disabled={!selectedSlot}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-full text-lg shadow-md transition"
            >
              🛒 Proceed to Checkout ({totalItems} item{totalItems !== 1 ? 's' : ''})
            </button>
          </div>
        )}
        {totalItems > 0 && !selectedSlot && (
          <p className="text-right text-amber-500 text-sm mt-2">Please select a time slot to continue</p>
        )}
      </div>
    </div>
  )
}
