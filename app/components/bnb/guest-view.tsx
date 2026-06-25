'use client'

import { useState, useEffect } from 'react'
import {
  Wifi, Car, UtensilsCrossed, Wind, Waves, Eye, Star,
  MapPin, Camera, Plus, Minus, ChevronRight, ChevronLeft,
  AlertCircle, Loader2,
} from 'lucide-react'
import CalendarPicker from './calendar-picker'
import { fetchHost } from './api'
import type { Host, Lang } from './types'
import he from './locales/he.json'
import en from './locales/en.json'

type T = typeof he
const locales: Record<Lang, T> = { he, en }

const AMENITY_ICONS: Record<string, React.ElementType> = {
  wifi: Wifi, ac: Wind, kitchen: UtensilsCrossed,
  parking: Car, sea: Waves, view: Eye,
}

const IMAGE_BG = [
  'from-[#1a6b8a] to-[#0a3d5c]',
  'from-[#c48c3f] to-[#7a5a14]',
  'from-[#4db0c4] to-[#1a7a9e]',
  'from-[#d4b896] to-[#a88060]',
  'from-[#2d6a4f] to-[#1b4332]',
]

const PPN_FALLBACK = 820
type Panel = 'dates' | 'guests' | null

function fmtDate(d: Date | null, t: T) {
  if (!d) return t.addDate
  return d.toLocaleDateString('he-IL', { month: 'short', day: 'numeric' })
}

function plural(n: number, singular: string, plural: string) {
  return `${n} ${n === 1 ? singular : plural}`
}

interface Props { hostId: string }

export default function GuestView({ hostId }: Props) {
  const [lang, setLang] = useState<Lang>('he')
  const [asset, setAsset] = useState<Host | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'ok' | 'error'>('loading')

  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [infants, setInfants] = useState(0)
  const [panel, setPanel] = useState<Panel>(null)

  const t = locales[lang]

  useEffect(() => {
    fetchHost(hostId)
      .then(data => { setAsset(data); setLoadState('ok') })
      .catch(() => setLoadState('error'))
  }, [hostId])

  useEffect(() => {
    if (!asset) return
    document.title = `${asset.title[lang]} | ${t.brand}`
    const metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (metaDesc) metaDesc.content = asset.about[lang][0]
  }, [lang, asset, t.brand])
  const isRtl = lang === 'he'
  const dir = isRtl ? 'rtl' : 'ltr'
  const ChevronEnd = isRtl ? ChevronLeft : ChevronRight

  const totalGuests = adults + children
  const ppn = asset?.pricePerNight ?? PPN_FALLBACK
  const nights = checkIn && checkOut
    ? Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000)
    : 0

  const guestLabel = () => {
    const g = plural(totalGuests, t.guest, t.guestPlural)
    if (infants === 0) return g
    return `${g}, ${plural(infants, t.infant, t.infantPlural)}`
  }

  const handleDateSelect = (date: Date) => {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date); setCheckOut(null)
    } else if (date > checkIn) {
      setCheckOut(date); setPanel(null)
    } else {
      setCheckIn(date)
    }
  }

  const openPanel = (p: Panel) => setPanel(prev => prev === p ? null : p)

  const guestRows = [
    { key: 'adults' as const, value: adults, set: setAdults, min: 1, max: asset?.maxGuests ?? 6 },
    { key: 'children' as const, value: children, set: setChildren, min: 0, max: (asset?.maxGuests ?? 6) - adults },
    { key: 'infants' as const, value: infants, set: setInfants, min: 0, max: 4 },
  ]

  return (
    <div dir={dir} className="min-h-screen bg-white text-gray-900">
      {panel && <div className="fixed inset-0 z-30" onClick={() => setPanel(null)} />}

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center gap-3">

          <div className="flex items-center justify-between shrink-0">
            <span className="text-base font-bold tracking-tight">
              {t.brand}
            </span>
            <div className="md:hidden">
              <LangToggle lang={lang} setLang={setLang} />
            </div>
          </div>

          <div className="relative flex flex-1 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <button
              onClick={() => openPanel('dates')}
              className="flex-1 px-4 py-2.5 text-start border-e border-gray-200 hover:bg-gray-50 rounded-s-full transition-colors"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{t.checkin}</div>
              <div className={`text-sm font-medium ${checkIn ? 'text-gray-900' : 'text-gray-400'}`}>{fmtDate(checkIn, t)}</div>
            </button>

            <button
              onClick={() => openPanel('dates')}
              className="flex-1 px-4 py-2.5 text-start border-e border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{t.checkout}</div>
              <div className={`text-sm font-medium ${checkOut ? 'text-gray-900' : 'text-gray-400'}`}>{fmtDate(checkOut, t)}</div>
            </button>

            <button
              onClick={() => openPanel('guests')}
              className="flex-1 px-4 py-2.5 text-start hover:bg-gray-50 transition-colors"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{t.guests}</div>
              <div className={`text-sm font-medium ${totalGuests > 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                {totalGuests === 1 && adults === 1 && infants === 0 ? t.addGuests : guestLabel()}
              </div>
            </button>

            <button className="m-1.5 px-5 bg-[#E05A3A] hover:bg-[#c44428] text-white rounded-full text-sm font-semibold transition-colors">
              {t.search}
            </button>

            {panel === 'dates' && (
              <div className={`absolute top-full mt-3 z-50 ${isRtl ? 'right-0' : 'left-0'}`}>
                <CalendarPicker startDate={checkIn} endDate={checkOut} onSelect={handleDateSelect} blockedDates={asset?.unavailableDates} />
              </div>
            )}

            {panel === 'guests' && (
              <div className={`absolute top-full mt-3 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 w-72 ${isRtl ? 'left-0' : 'right-0'}`}>
                {guestRows.map(row => (
                  <div key={row.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <div className="text-sm font-medium">{t[row.key]}</div>
                      <div className="text-xs text-gray-400">{t[`${row.key}Age` as keyof T] as string}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => row.set(v => Math.max(row.min, v - 1))}
                        disabled={row.value <= row.min}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-25 hover:border-gray-600 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-4 text-center text-sm font-medium">{row.value}</span>
                      <button
                        onClick={() => row.set(v => Math.min(row.max, v + 1))}
                        disabled={row.value >= row.max}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-25 hover:border-gray-600 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-400 mt-3 leading-relaxed">{t.guestLimit}</p>
              </div>
            )}
          </div>

          <div className="hidden md:block shrink-0">
            <LangToggle lang={lang} setLang={setLang} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4">
        {loadState === 'loading' && (
          <div className="flex items-center justify-center h-96 gap-3 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>{t.loading}</span>
          </div>
        )}

        {loadState === 'error' && (
          <div className="flex items-center justify-center h-96 gap-3 text-red-400">
            <AlertCircle className="w-6 h-6" />
            <span>{t.errorLoad}</span>
          </div>
        )}

        {loadState === 'ok' && asset && (
          <>
            {/* ── Image grid ── */}
            <div className="mt-6 rounded-2xl overflow-hidden grid grid-cols-4 grid-rows-2 gap-2 h-[420px] md:h-[480px]">
              {asset.images.map((img, i) => (
                <div
                  key={i}
                  className={[
                    'relative flex items-center justify-center cursor-pointer group bg-gradient-to-br',
                    IMAGE_BG[i] ?? IMAGE_BG[0],
                    i === 0 ? 'col-span-2 row-span-2' : '',
                  ].join(' ')}
                >
                  {img.url
                    ? <img src={img.url} alt={img.label[lang]} className="absolute inset-0 w-full h-full object-cover" />
                    : (
                      <div className="text-center text-white/50 group-hover:text-white/70 transition-colors">
                        <Camera className={`mx-auto mb-1 ${i === 0 ? 'w-10 h-10 mb-2' : 'w-5 h-5'}`} />
                        <span className={i === 0 ? 'text-sm' : 'text-xs'}>{img.label[lang]}</span>
                      </div>
                    )
                  }
                  {i === asset.images.length - 1 && (
                    <button className="absolute bottom-3 end-3 bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                      {t.showAllPhotos}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* ── Content ── */}
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-14 pb-24">

              {/* Left */}
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold leading-snug">{asset.title[lang]}</h2>
                    <p className="flex items-center gap-1 text-gray-500 mt-1.5 text-sm">
                      <MapPin className="w-4 h-4 shrink-0" />
                      {asset.location[lang]}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold shrink-0">
                    <Star className="w-4 h-4 fill-current" />
                    {asset.rating}
                    <span className="text-gray-400 font-normal">· {asset.reviewCount} {t.reviews}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-sm text-gray-600">
                  <span>{plural(asset.maxGuests, t.guestsLabel, t.guestsLabel)}</span><span>·</span>
                  <span>{plural(asset.bedrooms, t.bedroomLabel, t.bedroomsLabel)}</span><span>·</span>
                  <span>{plural(asset.beds, t.bedLabel, t.bedsLabel)}</span><span>·</span>
                  <span>{plural(asset.bathrooms, t.bathroomLabel, t.bathroomsLabel)}</span>
                </div>

                <hr className="my-8 border-gray-100" />

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E05A3A] to-[#b03020] flex items-center justify-center text-white font-bold text-xl shrink-0">
                    {asset.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold">{t.hostedBy} {asset.name}</div>
                    <div className="text-sm text-gray-400">
                      {t.superhostBadge} · {new Date().getFullYear() - asset.hostingSince} {t.hostingYears}
                    </div>
                  </div>
                </div>

                <hr className="my-8 border-gray-100" />

                <div className="space-y-5">
                  {[
                    { icon: <Star className="w-6 h-6" />, title: t.highlight1Title, sub: t.highlight1Sub },
                    { icon: <Eye className="w-6 h-6" />,  title: t.highlight2Title, sub: t.highlight2Sub },
                    { icon: <Wind className="w-6 h-6" />, title: t.highlight3Title, sub: t.highlight3Sub },
                  ].map(h => (
                    <div key={h.title} className="flex gap-4">
                      <div className="text-gray-700 mt-0.5 shrink-0">{h.icon}</div>
                      <div>
                        <div className="font-medium text-sm">{h.title}</div>
                        <div className="text-sm text-gray-500 mt-0.5">{h.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="my-8 border-gray-100" />

                <div>
                  <h3 className="text-lg font-semibold mb-3">{t.aboutTitle}</h3>
                  {asset.about[lang].map((p, i) => (
                    <p key={i} className="text-gray-700 leading-relaxed mt-4 first:mt-0">{p}</p>
                  ))}
                </div>

                <hr className="my-8 border-gray-100" />

                <div>
                  <h3 className="text-lg font-semibold mb-5">{t.amenitiesTitle}</h3>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    {asset.amenities.map(key => {
                      const Icon = AMENITY_ICONS[key]
                      const label = (t.amenityLabels as Record<string, string>)[key] ?? key
                      return Icon ? (
                        <div key={key} className="flex items-center gap-3 text-sm">
                          <Icon className="w-5 h-5 text-gray-600 shrink-0" />
                          <span>{label}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>

                <hr className="my-8 border-gray-100" />

                <div>
                  <h3 className="text-lg font-semibold mb-4">{t.rulesTitle}</h3>
                  <ul className="space-y-2.5">
                    {asset.rules[lang].map(rule => (
                      <li key={rule} className="flex items-start gap-2.5 text-sm text-gray-700">
                        <ChevronEnd className="w-4 h-4 shrink-0 text-[#E05A3A] mt-0.5" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>

                <hr className="my-8 border-gray-100" />

                <div>
                  <h3 className="text-lg font-semibold mb-2">{t.locationTitle}</h3>
                  <p className="text-sm text-gray-500 mb-4">{asset.locationNote[lang]}</p>
                  <div className="rounded-xl overflow-hidden bg-gradient-to-br from-[#b8d4c0] to-[#7aaa8a] h-52 flex items-center justify-center">
                    <div className="text-center text-white/60">
                      <MapPin className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">{t.mapPlaceholder}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Booking card ── */}
              <div className="lg:sticky lg:top-24 self-start">
                <div className="rounded-2xl border border-gray-200 shadow-xl p-6">
                  <div className="flex items-end justify-between mb-5">
                    <div>
                      <span className="text-2xl font-bold">₪{ppn.toLocaleString()}</span>
                      <span className="text-sm text-gray-500"> {t.priceNight}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-semibold">{asset.rating}</span>
                      <span className="text-gray-400">· {asset.reviewCount}</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 overflow-hidden mb-3">
                    <div className="grid grid-cols-2 divide-x divide-gray-200">
                      <button onClick={() => openPanel('dates')} className="p-3 text-start hover:bg-gray-50 transition-colors">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{t.checkin}</div>
                        <div className={`text-sm font-medium mt-0.5 ${checkIn ? 'text-gray-900' : 'text-gray-400'}`}>{fmtDate(checkIn, t)}</div>
                      </button>
                      <button onClick={() => openPanel('dates')} className="p-3 text-start hover:bg-gray-50 transition-colors">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{t.checkout}</div>
                        <div className={`text-sm font-medium mt-0.5 ${checkOut ? 'text-gray-900' : 'text-gray-400'}`}>{fmtDate(checkOut, t)}</div>
                      </button>
                    </div>
                    <div className="border-t border-gray-200">
                      <button onClick={() => openPanel('guests')} className="w-full p-3 text-start hover:bg-gray-50 transition-colors">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{t.guests}</div>
                        <div className="text-sm font-medium mt-0.5 text-gray-900">{guestLabel()}</div>
                      </button>
                    </div>
                  </div>

                  <button className="w-full bg-[#E05A3A] hover:bg-[#c44428] text-white font-semibold py-3.5 rounded-xl transition-colors text-sm">
                    {checkIn && checkOut ? t.reserve : t.checkAvailability}
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-2">{t.noCharge}</p>

                  {nights > 0 && (
                    <div className="mt-5 space-y-3 pt-5 border-t border-gray-100 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">₪{ppn.toLocaleString()} × {nights} {nights === 1 ? t.night : t.nights}</span>
                        <span>₪{(ppn * nights).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">{t.cleaningFee}</span>
                        <span>₪{asset.cleaningFee}</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-3 border-t border-gray-100">
                        <span>{t.totalBeforeTax}</span>
                        <span>₪{(ppn * nights + asset.cleaningFee).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 p-4 rounded-xl border border-gray-100 text-center text-sm text-gray-500">
                  {t.contactHost}{' '}
                  <button className="underline font-medium text-gray-800 hover:text-[#E05A3A] transition-colors">
                    {t.contactLink}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <button
      onClick={() => setLang(lang === 'he' ? 'en' : 'he')}
      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600 tracking-wide"
      title={lang === 'he' ? 'Switch to English' : 'עבור לעברית'}
    >
      {lang === 'he' ? 'EN' : 'עב'}
    </button>
  )
}
