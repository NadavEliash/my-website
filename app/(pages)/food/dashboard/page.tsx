'use client'

import { useEffect, useRef, useState } from 'react'
import { Upload, Trash2, Plus, X, ChevronDown, ChevronUp } from 'lucide-react'
import type { Product, ProductOption, Settings, ScheduleDay } from '@/app/food/types'
import { generateSlots } from '@/app/food/utils'

const EMPTY_PRODUCT: Omit<Product, 'id'> = {
  name: '', description: '', price: 0, image: '', available: true, options: [],
}
type Tab = 'products' | 'settings'
type FormState = Omit<Product, 'id'>

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

async function uploadToCloudinary(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', UPLOAD_PRESET!)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: form })
  const data = await res.json()
  if (!data.secure_url) throw new Error(data.error?.message ?? 'העלאה נכשלה')
  return data.secure_url
}

// ── ImageDropZone ────────────────────────────────────────────────────────────
type DropZoneProps = {
  image: string
  uploading: boolean
  uploadError: string
  dragOver: boolean
  fileInputRef: React.RefObject<HTMLInputElement>
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
  onClick: () => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

function ImageDropZone({ image, uploading, uploadError, dragOver, fileInputRef, onDragOver, onDragLeave, onDrop, onClick, onFileChange }: DropZoneProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">תמונה</label>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onClick}
        className={`border border-dashed rounded-lg p-4 text-center cursor-pointer transition ${dragOver ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
      >
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        {uploading ? (
          <p className="text-gray-400 text-xs animate-pulse">מעלה...</p>
        ) : image ? (
          <div className="space-y-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" className="h-20 mx-auto object-cover rounded" />
            <p className="text-xs text-gray-400">לחץ או גרור להחלפה</p>
          </div>
        ) : (
          <div className="py-3 flex flex-col items-center gap-1.5">
            <Upload size={18} className="text-gray-300" />
            <p className="text-xs text-gray-400">גרור תמונה לכאן או לחץ לבחירה</p>
          </div>
        )}
      </div>
      {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
    </div>
  )
}

// ── OptionsEditor ────────────────────────────────────────────────────────────
type OptionsEditorProps = {
  options: ProductOption[]
  onChange: (options: ProductOption[]) => void
}

function OptionsEditor({ options, onChange }: OptionsEditorProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  function addOption() {
    const newOpt: ProductOption = { id: crypto.randomUUID(), label: '', choices: [{ label: '', priceAdd: 0 }], required: false }
    onChange([...options, newOpt])
    setExpanded(newOpt.id)
  }

  function removeOption(id: string) {
    onChange(options.filter(o => o.id !== id))
    if (expanded === id) setExpanded(null)
  }

  function patchOption(id: string, patch: Partial<ProductOption>) {
    onChange(options.map(o => o.id === id ? { ...o, ...patch } : o))
  }

  function addChoice(optId: string) {
    const opt = options.find(o => o.id === optId)!
    patchOption(optId, { choices: [...opt.choices, { label: '', priceAdd: 0 }] })
  }

  function patchChoice(optId: string, idx: number, patch: Partial<{ label: string; priceAdd: number }>) {
    const opt = options.find(o => o.id === optId)!
    patchOption(optId, { choices: opt.choices.map((c, i) => i === idx ? { ...c, ...patch } : c) })
  }

  function removeChoice(optId: string, idx: number) {
    const opt = options.find(o => o.id === optId)!
    patchOption(optId, { choices: opt.choices.filter((_, i) => i !== idx) })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">אפשרויות בחירה</span>
        <button
          type="button"
          onClick={addOption}
          className="flex items-center gap-1 text-xs text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-gray-400 transition"
        >
          <Plus size={11} />
          הוסף אפשרות
        </button>
      </div>

      {options.length === 0 && (
        <p className="text-xs text-gray-300 text-center py-2">לא הוגדרו אפשרויות בחירה</p>
      )}

      {options.map(opt => (
        <div key={opt.id} className="border border-gray-200 rounded-lg overflow-hidden">
          {/* header row */}
          <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50">
            <button type="button" onClick={() => setExpanded(expanded === opt.id ? null : opt.id)} className="flex-1 flex items-center justify-between min-w-0">
              <span className="text-xs font-medium text-gray-700 truncate">{opt.label || 'אפשרות ללא שם'}</span>
              {expanded === opt.id ? <ChevronUp size={13} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={13} className="text-gray-400 flex-shrink-0" />}
            </button>
            <button type="button" onClick={() => removeOption(opt.id)} className="p-1 text-gray-300 hover:text-red-400 transition flex-shrink-0">
              <Trash2 size={13} />
            </button>
          </div>

          {/* expanded body */}
          {expanded === opt.id && (
            <div className="px-3 pb-3 pt-2 space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">שם האפשרות (מוצג ללקוח)</label>
                <input
                  type="text"
                  value={opt.label}
                  onChange={e => patchOption(opt.id, { label: e.target.value })}
                  placeholder="למשל: סוג בצק"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 text-sm text-right focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-400">בחירות</span>
                  <span className="text-xs text-gray-300">תוספת מחיר (₪)</span>
                </div>
                <div className="space-y-1.5">
                  {opt.choices.map((choice, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={choice.label}
                        onChange={e => patchChoice(opt.id, idx, { label: e.target.value })}
                        placeholder={`בחירה ${idx + 1}`}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-gray-800 text-sm text-right focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                      <div className="relative w-20 flex-shrink-0">
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">₪</span>
                        <input
                          type="number"
                          min={0}
                          step={0.5}
                          value={choice.priceAdd || ''}
                          placeholder="0"
                          onChange={e => patchChoice(opt.id, idx, { priceAdd: parseFloat(e.target.value) || 0 })}
                          className="w-full border border-gray-200 rounded-lg pr-6 pl-2 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                      </div>
                      {opt.choices.length > 1 && (
                        <button type="button" onClick={() => removeChoice(opt.id, idx)} className="p-1.5 text-gray-300 hover:text-red-400 transition flex-shrink-0">
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addChoice(opt.id)}
                  className="mt-2 text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition"
                >
                  <Plus size={11} />
                  הוסף בחירה
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => patchOption(opt.id, { required: !opt.required })}
                    className={`relative w-8 h-4 rounded-full transition ${opt.required ? 'bg-gray-900' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${opt.required ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                  <span className="text-xs text-gray-500">חובה לבחור</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => patchOption(opt.id, { multiple: !opt.multiple })}
                    className={`relative w-8 h-4 rounded-full transition ${opt.multiple ? 'bg-gray-900' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${opt.multiple ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                  <span className="text-xs text-gray-500">בחירה מרובה</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── ProductForm ──────────────────────────────────────────────────────────────
type ProductFormProps = {
  form: FormState
  editingId: string | null
  saving: boolean
  uploading: boolean
  uploadError: string
  dragOver: boolean
  fileInputRef: React.RefObject<HTMLInputElement>
  onChange: (patch: Partial<FormState>) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
  onImageClick: () => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSave: () => void
  onCancel: () => void
}

function ProductForm({ form, editingId, saving, uploading, uploadError, dragOver, fileInputRef, onChange, onDragOver, onDragLeave, onDrop, onImageClick, onFileChange, onSave, onCancel }: ProductFormProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex justify-between items-center mb-1">
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition"><X size={16} /></button>
        <span className="text-sm font-semibold text-gray-700">{editingId ? 'עריכת מוצר' : 'מוצר חדש'}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">שם</label>
          <input
            type="text"
            value={form.name}
            onChange={e => onChange({ name: e.target.value })}
            placeholder="שם המוצר"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-right text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">מחיר (₪)</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={form.price}
            onChange={e => onChange({ price: parseFloat(e.target.value) || 0 })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">תיאור</label>
        <input
          type="text"
          value={form.description}
          onChange={e => onChange({ description: e.target.value })}
          placeholder="תיאור קצר"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-right text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      <ImageDropZone
        image={form.image}
        uploading={uploading}
        uploadError={uploadError}
        dragOver={dragOver}
        fileInputRef={fileInputRef}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onImageClick}
        onFileChange={onFileChange}
      />

      <div className="border-t border-gray-100 pt-3">
        <OptionsEditor
          options={form.options ?? []}
          onChange={opts => onChange({ options: opts })}
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange({ available: !form.available })}
            className={`relative w-10 h-5 rounded-full transition ${form.available ? 'bg-gray-900' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.available ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
          <span className="text-xs text-gray-500">זמין למכירה</span>
        </div>
        <button
          onClick={onSave}
          disabled={!form.name.trim() || saving || uploading}
          className="bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium px-4 py-2 rounded-lg text-sm transition"
        >
          {saving ? 'שומר...' : 'שמור'}
        </button>
      </div>
    </div>
  )
}

// ── DashboardPage ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_PRODUCT)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [productMsg, setProductMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [settings, setSettings] = useState<Settings>({
    open: false, bitPhone: '', payboxPhone: '', scheduleDays: [],
  })
  const [newDay, setNewDay] = useState<Omit<ScheduleDay, 'id'>>({
    date: '', start: '12:00', end: '20:00', slotMinutes: 30,
  })
  const [settingsMsg, setSettingsMsg] = useState('')

  useEffect(() => {
    fetch('/api/food/products').then(r => r.json()).then(setProducts)
    fetch('/api/food/settings').then(r => r.json()).then(s => setSettings(prev => ({ ...prev, ...s })))
  }, [])

  async function saveProducts(updated: Product[]) {
    setSaving(true)
    await fetch('/api/food/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ products: updated }) })
    setProducts(updated)
    setSaving(false)
    setProductMsg('נשמר')
    setTimeout(() => setProductMsg(''), 2000)
  }

  function handleAddProduct() {
    saveProducts([...products, { ...form, id: crypto.randomUUID() }])
    setForm(EMPTY_PRODUCT)
    setShowAddForm(false)
  }

  function handleUpdateProduct() {
    if (!editingId) return
    saveProducts(products.map(p => p.id === editingId ? { ...form, id: editingId } : p))
    setEditingId(null)
    setForm(EMPTY_PRODUCT)
  }

  function startEdit(p: Product) {
    setEditingId(p.id)
    setForm({ name: p.name, description: p.description, price: p.price, image: p.image, available: p.available, options: p.options ?? [] })
    setShowAddForm(false)
  }

  async function handleImageFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    setUploadError('')
    try {
      const url = await uploadToCloudinary(file)
      setForm(f => ({ ...f, image: url }))
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'שגיאה בהעלאת התמונה')
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleImageFile(file)
  }

  async function saveSettings() {
    // flush a date typed into the form but not yet added, so it isn't silently lost on save
    let toSave = settings
    if (newDay.date && newDay.start && newDay.end) {
      const day: ScheduleDay = { ...newDay, id: crypto.randomUUID() }
      const scheduleDays = [...(settings.scheduleDays ?? []), day].sort((a, b) => a.date.localeCompare(b.date))
      toSave = { ...settings, scheduleDays }
      setSettings(toSave)
      setNewDay(d => ({ ...d, date: '' }))
    }
    await fetch('/api/food/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(toSave) })
    setSettingsMsg('נשמר')
    setTimeout(() => setSettingsMsg(''), 2000)
  }

  function addScheduleDay() {
    if (!newDay.date || !newDay.start || !newDay.end) return
    const day: ScheduleDay = { ...newDay, id: crypto.randomUUID() }
    setSettings(s => ({ ...s, scheduleDays: [...(s.scheduleDays ?? []), day].sort((a, b) => a.date.localeCompare(b.date)) }))
    setNewDay(d => ({ ...d, date: '' }))
  }

  function removeScheduleDay(id: string) {
    setSettings(s => ({ ...s, scheduleDays: (s.scheduleDays ?? []).filter(d => d.id !== id) }))
  }

  function formatDisplayDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'numeric' })
  }

  const formProps = {
    form, editingId, saving, uploading, uploadError, dragOver, fileInputRef,
    onChange: (patch: Partial<FormState>) => setForm(f => ({ ...f, ...patch })),
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setDragOver(true) },
    onDragLeave: () => setDragOver(false),
    onDrop: handleDrop,
    onImageClick: () => fileInputRef.current?.click(),
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) handleImageFile(f) },
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-gray-900 text-white px-4 pt-10 pb-6">
        <h1 className="text-2xl font-bold tracking-tight">ניהול</h1>
        <p className="text-gray-400 text-sm mt-1">ניהול החנות ומוצרים</p>
      </header>

      <div className="px-4 pt-4 max-w-2xl mx-auto">
        <div className="flex border-b border-gray-200 mb-5">
          {(['products', 'settings'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition ${tab === t ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              {t === 'products' ? 'מוצרים' : 'הגדרות'}
            </button>
          ))}
        </div>

        {tab === 'products' && (
          <div className="space-y-3 pb-10">
            <div className="flex items-center justify-between">
              {productMsg && <span className="text-xs text-green-600 font-medium">{productMsg}</span>}
              {!showAddForm && editingId === null && (
                <button
                  onClick={() => { setShowAddForm(true); setEditingId(null); setForm(EMPTY_PRODUCT) }}
                  className="mr-auto flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
                >
                  <Plus size={14} />
                  הוסף מוצר
                </button>
              )}
            </div>

            {showAddForm && editingId === null && (
              <ProductForm
                {...formProps}
                onSave={handleAddProduct}
                onCancel={() => { setShowAddForm(false); setForm(EMPTY_PRODUCT) }}
              />
            )}

            {products.length === 0 && !showAddForm && (
              <div className="text-center py-20">
                <p className="text-gray-400 text-sm">אין מוצרים עדיין</p>
              </div>
            )}

            {products.length > 0 && products.map(product => (
              <div key={product.id}>
                {editingId === product.id ? (
                  <ProductForm
                    {...formProps}
                    onSave={handleUpdateProduct}
                    onCancel={() => { setEditingId(null); setForm(EMPTY_PRODUCT) }}
                  />
                ) : (
                  <div
                    onClick={() => startEdit(product)}
                    className="bg-white rounded-xl border border-gray-100 flex items-stretch overflow-hidden cursor-pointer hover:border-gray-300 transition"
                  >
                    {product.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image} alt={product.name} className="w-20 h-20 object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 px-3 py-3 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{product.name}</p>
                          <p className="text-gray-400 text-xs truncate">{product.description}</p>
                          {product.options && product.options.length > 0 && (
                            <p className="text-gray-300 text-xs mt-0.5">{product.options.length} אפשרויות בחירה</p>
                          )}
                          <p className="text-gray-800 font-bold text-sm mt-1">₪{product.price.toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${product.available ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                            {product.available ? 'זמין' : 'מוסתר'}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteId(product.id) }}
                            className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'settings' && (
          <div className="space-y-5 pb-10">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">סטטוס חנות</p>
                  <p className="text-xs text-gray-400 mt-0.5">{settings.open ? 'מקבלים הזמנות' : 'החנות סגורה'}</p>
                </div>
                <button
                  onClick={() => setSettings(s => ({ ...s, open: !s.open }))}
                  className={`relative w-12 h-6 rounded-full transition ${settings.open ? 'bg-gray-900' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.open ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
              <p className="text-sm font-semibold text-gray-800">מועדי הזמנות</p>
              <p className="text-xs text-gray-400">הוסף תאריכים ושעות שבהם לקוחות יוכלו לבחור מועד איסוף.</p>

              {/* existing days */}
              {(settings.scheduleDays ?? []).length > 0 && (
                <div className="space-y-2">
                  {(settings.scheduleDays ?? []).map(day => {
                    const slots = generateSlots(day.start, day.end, day.slotMinutes)
                    return (
                      <div key={day.id} className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800">{formatDisplayDate(day.date)}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{day.start}–{day.end} · {slots.length} חלונות</p>
                        </div>
                        <button onClick={() => removeScheduleDay(day.id)} className="p-1.5 text-gray-300 hover:text-red-400 transition flex-shrink-0 mr-2">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* add new day form */}
              <div className="border border-dashed border-gray-200 rounded-lg p-3 space-y-3">
                <p className="text-xs font-medium text-gray-500">הוסף תאריך</p>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">תאריך</label>
                  <input
                    type="date"
                    value={newDay.date}
                    onChange={e => setNewDay(d => ({ ...d, date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">שעת התחלה</label>
                    <input type="time" value={newDay.start} onChange={e => setNewDay(d => ({ ...d, start: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">שעת סיום</label>
                    <input type="time" value={newDay.end} onChange={e => setNewDay(d => ({ ...d, end: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">גודל חלון זמן</label>
                  <select value={newDay.slotMinutes} onChange={e => setNewDay(d => ({ ...d, slotMinutes: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                    <option value={15}>15 דקות</option>
                    <option value={30}>30 דקות</option>
                    <option value={60}>שעה</option>
                  </select>
                </div>
                {newDay.date && newDay.start && newDay.end && (() => {
                  const preview = generateSlots(newDay.start, newDay.end, newDay.slotMinutes)
                  return preview.length > 0 ? (
                    <div>
                      <p className="text-xs text-gray-400 mb-1.5">{preview.length} חלונות זמן</p>
                      <div className="flex flex-wrap gap-1">
                        {preview.map(s => <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-medium">{s}</span>)}
                      </div>
                    </div>
                  ) : null
                })()}
                <button
                  onClick={addScheduleDay}
                  disabled={!newDay.date || !newDay.start || !newDay.end}
                  className="w-full flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-100 disabled:text-gray-300 text-white text-xs font-medium py-2.5 rounded-lg transition"
                >
                  <Plus size={12} />
                  הוסף תאריך
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-800">תשלום</p>
              <p className="text-xs text-gray-400">הכנס מספר טלפון לכל שירות. לקוחות יקבלו קישור לתשלום לאחר ביצוע הזמנה.</p>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Bit — מספר טלפון</label>
                <input type="tel" value={settings.bitPhone ?? ''} onChange={e => setSettings(s => ({ ...s, bitPhone: e.target.value }))} placeholder="0501234567" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Paybox — מספר טלפון</label>
                <input type="tel" value={settings.payboxPhone ?? ''} onChange={e => setSettings(s => ({ ...s, payboxPhone: e.target.value }))} placeholder="0501234567" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-400 text-right">
                Google Pay — דורש שילוב עם מעבד תשלומים (Stripe / Tranzila).
              </div>
            </div>

            <div className="flex items-center justify-between">
              {settingsMsg && <span className="text-xs text-green-600 font-medium">{settingsMsg}</span>}
              <button onClick={saveSettings} className="mr-auto bg-gray-900 hover:bg-gray-700 text-white font-medium px-5 py-3 rounded-xl text-sm transition">
                שמור הגדרות
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 px-4 pb-6 sm:pb-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <p className="text-gray-900 font-semibold mb-1">מחיקת מוצר</p>
            <p className="text-gray-400 text-sm mb-5">פעולה זו אינה ניתנת לביטול.</p>
            <div className="flex gap-3">
              <button
                onClick={() => { saveProducts(products.filter(p => p.id !== deleteId)); setDeleteId(null) }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl text-sm transition"
              >
                מחק
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
