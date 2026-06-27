'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchHost, updateHost } from '../api'
import { clearSession } from './login-gate'
import type { Host } from '../types'
import { AmenityKey } from '../types'
import CalendarPicker from '../calendar-picker'
import {
  Home, Image, Settings, MapPin, ScrollText, CalendarDays,
  Plus, Trash2, Loader2, Check, ExternalLink, LogOut, Save, Upload, X,
} from 'lucide-react'
import { uploadImage } from '../cloudinary'

type Tab = 'general' | 'images' | 'details' | 'rules' | 'location' | 'calendar'

const ALL_AMENITIES = Object.values(AmenityKey)
const AMENITY_LABELS: Record<AmenityKey, string> = {
  [AmenityKey.Wifi]:    'Wi-Fi',
  [AmenityKey.Ac]:      'מיזוג אוויר',
  [AmenityKey.Kitchen]: 'מטבח',
  [AmenityKey.Parking]: 'חניה',
  [AmenityKey.Sea]:     'גישה לים',
  [AmenityKey.View]:    'נוף לים',
  [AmenityKey.Pool]:    'בריכה',
  [AmenityKey.Spa]:     'ספא',
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'general',  label: 'כללי',      icon: <Home className="w-4 h-4" /> },
  { id: 'images',   label: 'תמונות',    icon: <Image className="w-4 h-4" /> },
  { id: 'details',  label: 'פרטים',     icon: <Settings className="w-4 h-4" /> },
  { id: 'rules',    label: 'כללי בית',  icon: <ScrollText className="w-4 h-4" /> },
  { id: 'location', label: 'מיקום',     icon: <MapPin className="w-4 h-4" /> },
  { id: 'calendar', label: 'יומן',      icon: <CalendarDays className="w-4 h-4" /> },
]

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface Props { hostId: string; token: string; onLogout: () => void }

export default function DashboardView({ hostId, token, onLogout }: Props) {
  const [edited, setEdited]       = useState<Host | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'ok' | 'error'>('loading')
  const [dirty, setDirty]         = useState(false)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [toast, setToast]         = useState<string | null>(null)
  const [tab, setTab]             = useState<Tab>('general')
  const [leaveModal, setLeaveModal] = useState<'logout' | null>(null)

  const editedRef = useRef(edited)
  editedRef.current = edited
  const dirtyRef = useRef(dirty)
  dirtyRef.current = dirty

  const showError = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    fetchHost(hostId)
      .then(data => { setEdited(data); setLoadState('ok') })
      .catch(() => setLoadState('error'))
  }, [hostId])


  const patch = (partial: Partial<Host>) => {
    setEdited(prev => prev ? { ...prev, ...partial } : prev)
    setDirty(true)
    setSaved(false)
  }

  const save = useCallback(async () => {
    const data = editedRef.current
    if (!data) return
    setSaving(true)
    try {
      const result = await updateHost(hostId, token, data)
      setEdited(result)
      setDirty(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      showError('שגיאה בשמירה. נסה שוב.')
    } finally {
      setSaving(false)
    }
  }, [hostId, token])

  // Auto-save to MongoDB on tab switch
  const switchTab = async (next: Tab) => {
    if (next === tab) return
    if (dirtyRef.current) await save()
    setTab(next)
  }

  const handleLogout = () => {
    if (dirty) { setLeaveModal('logout'); return }
    clearSession(); onLogout()
  }

  const confirmLeave = () => {
    clearSession(); onLogout()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      {/* ── Leave confirmation modal ── */}
      {leaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm mx-4" dir="rtl">
            <h2 className="text-lg font-bold text-gray-900 mb-2">יש שינויים שלא נשמרו</h2>
            <p className="text-sm text-gray-500 mb-6">אם תצא עכשיו, השינויים יאבדו. האם להמשיך?</p>
            <div className="flex gap-3">
              <button onClick={confirmLeave}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                צא בלי לשמור
              </button>
              <button onClick={() => setLeaveModal(null)}
                className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors">
                חזור לעריכה
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Error toast ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-red-600 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg">
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="text-white/70 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* ── Top bar ── */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <span>לוח בקרה</span>
            {dirty && <span className="text-xs font-normal text-amber-500 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">שינויים לא שמורים</span>}
          </div>
          <div className="flex items-center gap-2">
            <a href="/deadseabnb" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> תצוגה מקדימה
            </a>
            <button onClick={save} disabled={!dirty || saving}
              className="flex items-center gap-1.5 text-sm font-semibold bg-[#E05A3A] hover:bg-[#c44428] disabled:opacity-40 text-white rounded-lg px-4 py-1.5 transition-colors">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {saved ? 'נשמר' : 'שמור'}
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 px-2 py-1.5 transition-colors" title="התנתק">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto w-full px-4 py-6 flex gap-6 flex-1">
        {/* ── Sidebar ── */}
        <aside className="w-44 shrink-0">
          <nav className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {TABS.map(t => (
              <button key={t.id} onClick={() => switchTab(t.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm text-start border-b border-gray-50 last:border-0 transition-colors
                  ${tab === t.id ? 'bg-[#E05A3A]/5 text-[#E05A3A] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                {t.icon}{t.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Content ── */}
        <main className="flex-1 min-w-0">
          {loadState === 'loading' && <div className="flex items-center justify-center h-64 gap-2 text-gray-400"><Loader2 className="w-5 h-5 animate-spin" />טוען...</div>}
          {loadState === 'error'   && <div className="text-red-500 text-center py-20">שגיאה בטעינת הנכס</div>}
          {loadState === 'ok' && edited && (
            <>
              {tab === 'general'  && <GeneralTab  host={edited} patch={patch} />}
              {tab === 'images'   && <ImagesTab   host={edited} patch={patch} token={token} onError={showError} />}
              {tab === 'details'  && <DetailsTab  host={edited} patch={patch} />}
              {tab === 'rules'    && <RulesTab    host={edited} patch={patch} />}
              {tab === 'location' && <LocationTab host={edited} patch={patch} />}
              {tab === 'calendar' && <CalendarTab host={edited} patch={patch} />}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

// ── Shared UI ───────────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
      <h2 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  )
}

function BilingualField({ label, heValue, enValue, onHeChange, onEnChange, multiline = false }: {
  label: string; heValue: string; enValue: string
  onHeChange: (v: string) => void; onEnChange: (v: string) => void; multiline?: boolean
}) {
  const cls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E05A3A]/20 focus:border-[#E05A3A] transition-colors resize-none'
  return (
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-gray-400 mb-1">עברית</div>
          {multiline
            ? <textarea dir="rtl" rows={3} value={heValue} onChange={e => onHeChange(e.target.value)} className={cls} />
            : <input dir="rtl" type="text" value={heValue} onChange={e => onHeChange(e.target.value)} className={cls} />}
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">English</div>
          {multiline
            ? <textarea dir="ltr" rows={3} value={enValue} onChange={e => onEnChange(e.target.value)} className={cls} />
            : <input dir="ltr" type="text" value={enValue} onChange={e => onEnChange(e.target.value)} className={cls} />}
        </div>
      </div>
    </div>
  )
}

function NumberField({ label, value, onChange, prefix, min = 0 }: {
  label: string; value: number; onChange: (v: number) => void; prefix?: string; min?: number
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#E05A3A]/20 focus-within:border-[#E05A3A]">
        {prefix && <span className="px-2.5 text-sm text-gray-400 bg-gray-50 border-e border-gray-200">{prefix}</span>}
        <input type="number" min={min} value={value} onChange={e => onChange(Number(e.target.value))}
          className="flex-1 px-3 py-2 text-sm text-gray-900 focus:outline-none bg-white" />
      </div>
    </div>
  )
}

// ── Tabs ────────────────────────────────────────────────────────────────────

function GeneralTab({ host, patch }: { host: Host; patch: (p: Partial<Host>) => void }) {
  return (
    <>
      <Card title="שם הנכס">
        <BilingualField label="כותרת"
          heValue={host.title.he} enValue={host.title.en}
          onHeChange={v => patch({ title: { ...host.title, he: v } })}
          onEnChange={v => patch({ title: { ...host.title, en: v } })} />
      </Card>
      <Card title="תיאור">
        {host.about.he.map((_, i) => (
          <BilingualField key={i} label={`פסקה ${i + 1}`} multiline
            heValue={host.about.he[i]} enValue={host.about.en[i]}
            onHeChange={v => { const he = [...host.about.he]; he[i] = v; patch({ about: { ...host.about, he } }) }}
            onEnChange={v => { const en = [...host.about.en]; en[i] = v; patch({ about: { ...host.about, en } }) }} />
        ))}
        <button onClick={() => patch({ about: { he: [...host.about.he, ''], en: [...host.about.en, ''] } })}
          className="flex items-center gap-1.5 text-sm text-[#E05A3A] hover:underline mt-1">
          <Plus className="w-4 h-4" /> הוסף פסקה
        </button>
      </Card>
    </>
  )
}

function ImagesTab({ host, patch, token, onError }: { host: Host; patch: (p: Partial<Host>) => void; token: string; onError: (msg: string) => void }) {
  const [uploading, setUploading] = useState<Record<number, boolean>>({})

  const update = (i: number, partial: Partial<Host['images'][0]>) =>
    patch({ images: host.images.map((img, idx) => idx === i ? { ...img, ...partial } : img) })
  const remove = (i: number) => patch({ images: host.images.filter((_, idx) => idx !== i) })
  const add    = () => patch({ images: [...host.images, { label: { he: '', en: '' } }] })

  const handleFileChange = async (i: number, file: File) => {
    setUploading(prev => ({ ...prev, [i]: true }))
    try {
      const url = await uploadImage(file)
      update(i, { url })
    } catch (e) {
      onError(`שגיאה בהעלאת תמונה: ${(e as Error).message}`)
    } finally {
      setUploading(prev => ({ ...prev, [i]: false }))
    }
  }

  return (
    <Card title="תמונות">
      <div className="space-y-4">
        {host.images.map((img, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-4 flex gap-4">
            <div className="w-32 h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center relative">
              {uploading[i]
                ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                : img.url
                  ? <img src={img.url} alt="" className="w-full h-full object-cover" />
                  : <span className="text-2xl">📷</span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="mb-3">
                <label className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-white bg-[#E05A3A] hover:bg-[#c44428] rounded-lg px-3 py-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  העלה תמונה
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFileChange(i, f); e.target.value = '' }} />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">כיתוב — עברית</label>
                  <input dir="rtl" type="text" value={img.label.he}
                    onChange={e => update(i, { label: { ...img.label, he: e.target.value } })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E05A3A]/20 focus:border-[#E05A3A]" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Caption — English</label>
                  <input dir="ltr" type="text" value={img.label.en}
                    onChange={e => update(i, { label: { ...img.label, en: e.target.value } })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E05A3A]/20 focus:border-[#E05A3A]" />
                </div>
              </div>
            </div>
            <button onClick={() => remove(i)} className="text-gray-300 hover:text-red-400 transition-colors self-start mt-1 shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button onClick={add}
          className="w-full border-2 border-dashed border-gray-200 hover:border-[#E05A3A]/50 rounded-xl py-4 text-sm text-gray-400 hover:text-[#E05A3A] transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> הוסף תמונה
        </button>
      </div>
    </Card>
  )
}

function DetailsTab({ host, patch }: { host: Host; patch: (p: Partial<Host>) => void }) {
  const toggleAmenity = (key: AmenityKey) => {
    const has = host.amenities.includes(key)
    patch({ amenities: has ? host.amenities.filter(a => a !== key) : [...host.amenities, key] })
  }
  return (
    <>
      <Card title="תמחור">
        <div className="grid grid-cols-2 gap-4">
          <NumberField label="מחיר ללילה" value={host.pricePerNight} onChange={v => patch({ pricePerNight: v })} prefix="₪" min={1} />
          <NumberField label="דמי ניקיון"  value={host.cleaningFee}   onChange={v => patch({ cleaningFee: v })}   prefix="₪" />
        </div>
      </Card>
      <Card title="קיבולת">
        <div className="grid grid-cols-4 gap-4">
          <NumberField label="אורחים מקסימום" value={host.maxGuests}  onChange={v => patch({ maxGuests: v })}  min={1} />
          <NumberField label="חדרי שינה"       value={host.bedrooms}   onChange={v => patch({ bedrooms: v })}   min={0} />
          <NumberField label="מיטות"           value={host.beds}       onChange={v => patch({ beds: v })}       min={1} />
          <NumberField label="חדרי אמבטיה"     value={host.bathrooms}  onChange={v => patch({ bathrooms: v })}  min={0} />
        </div>
      </Card>
      <Card title="מארח">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">שם המארח</label>
            <input dir="rtl" type="text" value={host.name} onChange={e => patch({ name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E05A3A]/20 focus:border-[#E05A3A]" />
          </div>
          <NumberField label="מארח מאז (שנה)" value={host.hostingSince} onChange={v => patch({ hostingSince: v })} min={2000} />
        </div>
      </Card>
      <Card title="מתקנים">
        <div className="grid grid-cols-4 gap-2">
          {ALL_AMENITIES.map(key => {
            const active = host.amenities.includes(key)
            return (
              <button key={key} onClick={() => toggleAmenity(key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors
                  ${active ? 'bg-[#E05A3A]/5 border-[#E05A3A]/30 text-[#E05A3A] font-medium' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 ${active ? 'bg-[#E05A3A] border-[#E05A3A]' : 'border-gray-300'}`}>
                  {active && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                {AMENITY_LABELS[key]}
              </button>
            )
          })}
        </div>
      </Card>
    </>
  )
}

function RulesTab({ host, patch }: { host: Host; patch: (p: Partial<Host>) => void }) {
  const update = (i: number, lang: 'he' | 'en', val: string) => {
    const rules = { ...host.rules }
    rules[lang] = rules[lang].map((r, idx) => idx === i ? val : r)
    patch({ rules })
  }
  return (
    <Card title="כללי בית">
      <div className="space-y-3">
        {host.rules.he.map((_, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-xs flex items-center justify-center shrink-0 mt-2">{i + 1}</div>
            <div className="flex-1 grid grid-cols-2 gap-3">
              <input dir="rtl" type="text" value={host.rules.he[i]} placeholder="כלל בעברית"
                onChange={e => update(i, 'he', e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A3A]/20 focus:border-[#E05A3A]" />
              <input dir="ltr" type="text" value={host.rules.en[i]} placeholder="Rule in English"
                onChange={e => update(i, 'en', e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A3A]/20 focus:border-[#E05A3A]" />
            </div>
            <button onClick={() => patch({ rules: { he: host.rules.he.filter((_, idx) => idx !== i), en: host.rules.en.filter((_, idx) => idx !== i) } })}
              className="text-gray-300 hover:text-red-400 transition-colors mt-2 shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button onClick={() => patch({ rules: { he: [...host.rules.he, ''], en: [...host.rules.en, ''] } })}
          className="flex items-center gap-1.5 text-sm text-[#E05A3A] hover:underline mt-2">
          <Plus className="w-4 h-4" /> הוסף כלל
        </button>
      </div>
    </Card>
  )
}

function LocationTab({ host, patch }: { host: Host; patch: (p: Partial<Host>) => void }) {
  return (
    <>
      <Card title="שם המיקום">
        <BilingualField label="עיר / אזור"
          heValue={host.location.he} enValue={host.location.en}
          onHeChange={v => patch({ location: { ...host.location, he: v } })}
          onEnChange={v => patch({ location: { ...host.location, en: v } })} />
      </Card>
      <Card title="הערת מיקום">
        <BilingualField label="מרחק / הוראות"
          heValue={host.locationNote.he} enValue={host.locationNote.en}
          onHeChange={v => patch({ locationNote: { ...host.locationNote, he: v } })}
          onEnChange={v => patch({ locationNote: { ...host.locationNote, en: v } })} />
      </Card>
    </>
  )
}

function CalendarTab({ host, patch }: { host: Host; patch: (p: Partial<Host>) => void }) {
  const toggle = (date: Date) => {
    const iso = toISO(date)
    const blocked = host.unavailableDates ?? []
    patch({
      unavailableDates: blocked.includes(iso)
        ? blocked.filter(d => d !== iso)
        : [...blocked, iso],
    })
  }

  const count = host.unavailableDates?.length ?? 0

  return (
    <>
      <Card title="ניהול זמינות">
        <p className="text-sm text-gray-500 mb-5">
          לחץ על תאריך כדי לסמן אותו כ<span className="text-red-500 font-medium">לא זמין</span>. לחץ שוב כדי לשחרר.
          {count > 0 && <span className="text-gray-400"> · {count} תאריכים חסומים</span>}
        </p>
        <div dir="ltr">
          <CalendarPicker
            blockedDates={host.unavailableDates ?? []}
            onSelect={toggle}
            clickableBlocked
          />
        </div>
        {count > 0 && (
          <button
            onClick={() => patch({ unavailableDates: [] })}
            className="mt-4 text-sm text-red-400 hover:text-red-600 hover:underline transition-colors"
          >
            נקה את כל התאריכים החסומים
          </button>
        )}
      </Card>

      <Card title="מרווח בין הזמנות">
        <p className="text-sm text-gray-500 mb-5">
          הגדר כמה ימים יחסמו אוטומטית לפני ואחרי כל הזמנה — לניקיון, הכנה או מנוחה.
        </p>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs text-gray-500 mb-1">ימים לחסום לפני הזמנה</label>
            <div className="flex items-center gap-3">
              <input
                type="number" min={0} max={14}
                value={host.gapBefore ?? 0}
                onChange={e => patch({ gapBefore: Math.max(0, Number(e.target.value)) })}
                className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E05A3A]/20 focus:border-[#E05A3A]"
              />
              <span className="text-sm text-gray-400">ימים</span>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">נחסמים לפני כניסת האורח</p>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">ימים לחסום אחרי הזמנה</label>
            <div className="flex items-center gap-3">
              <input
                type="number" min={0} max={14}
                value={host.gapAfter ?? 0}
                onChange={e => patch({ gapAfter: Math.max(0, Number(e.target.value)) })}
                className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E05A3A]/20 focus:border-[#E05A3A]"
              />
              <span className="text-sm text-gray-400">ימים</span>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">נחסמים אחרי יציאת האורח</p>
          </div>
        </div>
      </Card>
    </>
  )
}
