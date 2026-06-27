'use client'

import { useEffect, useState } from 'react'
import type { Product, Settings } from '@/app/food/types'
import { generateSlots } from '@/app/food/utils'

const EMPTY_PRODUCT: Omit<Product, 'id'> = {
  name: '',
  description: '',
  price: 0,
  image: '',
  available: true,
}

type Tab = 'products' | 'settings'

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('products')

  // Products state
  const [products, setProducts] = useState<Product[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Product, 'id'>>(EMPTY_PRODUCT)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [productMsg, setProductMsg] = useState('')

  // Settings state
  const [settings, setSettings] = useState<Settings>({
    availabilityStart: '12:00',
    availabilityEnd: '20:00',
    slotMinutes: 30,
    open: false,
  })
  const [settingsMsg, setSettingsMsg] = useState('')

  useEffect(() => {
    fetch('/api/food/products').then(r => r.json()).then(setProducts)
    fetch('/api/food/settings').then(r => r.json()).then(setSettings)
  }, [])

  async function saveProducts(updated: Product[]) {
    setSaving(true)
    await fetch('/api/food/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: updated }),
    })
    setProducts(updated)
    setSaving(false)
    setProductMsg('Saved!')
    setTimeout(() => setProductMsg(''), 2000)
  }

  function handleAddProduct() {
    const newProduct: Product = { ...form, id: crypto.randomUUID() }
    saveProducts([...products, newProduct])
    setForm(EMPTY_PRODUCT)
    setShowAddForm(false)
  }

  function handleUpdateProduct() {
    if (!editingId) return
    const updated = products.map(p => p.id === editingId ? { ...form, id: editingId } : p)
    saveProducts(updated)
    setEditingId(null)
    setForm(EMPTY_PRODUCT)
  }

  function handleDeleteProduct(id: string) {
    if (!confirm('Delete this product?')) return
    saveProducts(products.filter(p => p.id !== id))
  }

  function startEdit(p: Product) {
    setEditingId(p.id)
    setForm({ name: p.name, description: p.description, price: p.price, image: p.image, available: p.available })
    setShowAddForm(false)
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(EMPTY_PRODUCT)
  }

  async function saveSettings() {
    await fetch('/api/food/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSettingsMsg('Settings saved!')
    setTimeout(() => setSettingsMsg(''), 2000)
  }

  const slotPreview = generateSlots(settings.availabilityStart, settings.availabilityEnd, settings.slotMinutes)

  const ProductForm = ({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) => (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Product name"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Price (₪)</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={form.price}
            onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Description</label>
        <input
          type="text"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Short description"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Image URL</label>
        <input
          type="url"
          value={form.image}
          onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
          placeholder="https://..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Available</label>
        <button
          onClick={() => setForm(f => ({ ...f, available: !f.available }))}
          className={`relative w-11 h-6 rounded-full transition ${form.available ? 'bg-green-400' : 'bg-gray-300'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.available ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={onSave}
          disabled={!form.name.trim() || saving}
          className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 text-white font-semibold px-5 py-2 rounded-full text-sm transition"
        >
          {saving ? 'Saving…' : 'Save Product'}
        </button>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-full text-sm transition">
          Cancel
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-8 px-4 text-center shadow-lg">
        <h1 className="text-3xl font-bold">🍽️ Dashboard</h1>
        <p className="text-amber-100 text-sm mt-1">Manage your food store</p>
      </div>

      {/* Tabs */}
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm mb-6 w-fit">
          {(['products', 'settings'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm capitalize transition ${
                tab === t ? 'bg-amber-500 text-white shadow' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'products' ? '🍕 Products' : '⚙️ Settings'}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {tab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Products</h2>
              <div className="flex items-center gap-3">
                {productMsg && <span className="text-green-600 text-sm font-medium">{productMsg}</span>}
                {!showAddForm && editingId === null && (
                  <button
                    onClick={() => { setShowAddForm(true); setEditingId(null); setForm(EMPTY_PRODUCT) }}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-full text-sm transition shadow"
                  >
                    + Add Product
                  </button>
                )}
              </div>
            </div>

            {showAddForm && editingId === null && (
              <ProductForm onSave={handleAddProduct} onCancel={() => { setShowAddForm(false); setForm(EMPTY_PRODUCT) }} />
            )}

            {products.length === 0 && !showAddForm && (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-3">🍽️</div>
                <p>No products yet. Add your first item!</p>
              </div>
            )}

            <div className="space-y-3">
              {products.map(product => (
                <div key={product.id}>
                  {editingId === product.id ? (
                    <ProductForm onSave={handleUpdateProduct} onCancel={cancelEdit} />
                  ) : (
                    <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition">
                      {product.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800">{product.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                            {product.available ? 'Available' : 'Hidden'}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm truncate">{product.description}</p>
                        <p className="text-amber-600 font-semibold text-sm mt-0.5">₪{product.price.toFixed(2)}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => startEdit(product)}
                          className="text-amber-500 hover:text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-50 text-sm font-medium transition"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 text-sm font-medium transition"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {tab === 'settings' && (
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Store Settings</h2>
              {settingsMsg && <span className="text-green-600 text-sm font-medium">{settingsMsg}</span>}
            </div>

            {/* Open/Closed toggle */}
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-800">Store Status</p>
                <p className="text-sm text-gray-500">{settings.open ? 'Customers can place orders' : 'Store is closed to orders'}</p>
              </div>
              <button
                onClick={() => setSettings(s => ({ ...s, open: !s.open }))}
                className={`relative w-14 h-7 rounded-full transition ${settings.open ? 'bg-green-400' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.open ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Availability Start</label>
                <input
                  type="time"
                  value={settings.availabilityStart}
                  onChange={e => setSettings(s => ({ ...s, availabilityStart: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Availability End</label>
                <input
                  type="time"
                  value={settings.availabilityEnd}
                  onChange={e => setSettings(s => ({ ...s, availabilityEnd: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Slot Duration</label>
              <select
                value={settings.slotMinutes}
                onChange={e => setSettings(s => ({ ...s, slotMinutes: Number(e.target.value) }))}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>

            {/* Slot preview */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">⏰ Slot Preview ({slotPreview.length} slots)</p>
              <div className="flex flex-wrap gap-2">
                {slotPreview.length === 0 ? (
                  <span className="text-gray-400 text-sm">No slots — check your time range</span>
                ) : (
                  slotPreview.map(s => (
                    <span key={s} className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full font-medium">{s}</span>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={saveSettings}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-full transition shadow"
            >
              Save Settings
            </button>
          </div>
        )}

        <div className="h-10" />
      </div>
    </div>
  )
}
