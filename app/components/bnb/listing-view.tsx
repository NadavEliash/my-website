'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { fetchAllHosts } from './api'
import type { Host, Lang } from './types'
import { Star, MapPin, Loader2, AlertCircle, Wifi, Wind, UtensilsCrossed, Car, Waves, Eye } from 'lucide-react'
import { AmenityKey } from './types'

const AMENITY_ICONS: Partial<Record<AmenityKey, React.ElementType>> = {
  [AmenityKey.Wifi]: Wifi, [AmenityKey.Ac]: Wind,
  [AmenityKey.Kitchen]: UtensilsCrossed, [AmenityKey.Parking]: Car,
  [AmenityKey.Sea]: Waves, [AmenityKey.View]: Eye,
}

const GRADIENTS = [
  'from-[#1a6b8a] to-[#0a3d5c]',
  'from-[#c48c3f] to-[#7a5a14]',
  'from-[#4db0c4] to-[#1a7a9e]',
  'from-[#d4b896] to-[#a88060]',
  'from-[#2d6a4f] to-[#1b4332]',
  'from-[#8b5a6b] to-[#5a2d3f]',
]

function plural(n: number, s: string, p: string) { return `${n} ${n === 1 ? s : p}` }

export default function ListingView() {
  const [lang, setLang]           = useState<Lang>('he')
  const [hosts, setHosts]         = useState<Host[]>([])
  const [loadState, setLoadState] = useState<'loading' | 'ok' | 'error'>('loading')

  useEffect(() => {
    fetchAllHosts()
      .then(data => { setHosts(data); setLoadState('ok') })
      .catch(() => setLoadState('error'))
  }, [])

  const isRtl = lang === 'he'

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-white text-gray-900">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/deadseabnb" className="text-lg font-bold tracking-tight flex items-center gap-2">
            <span className="text-[#E05A3A]">◆</span>
            {isRtl ? 'נכסים להשכרה' : 'Vacation Rentals'}
          </a>
          <div className="flex items-center gap-3">
            <a href="/deadseabnb/dashboard"
              className="text-sm text-gray-500 border border-gray-200 rounded-full px-4 py-1.5 hover:bg-gray-50 transition-colors">
              {isRtl ? 'כניסת מארחים' : 'Host Login'}
            </a>
            <button
              onClick={() => setLang(l => l === 'he' ? 'en' : 'he')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600">
              {isRtl ? 'EN' : 'עב'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isRtl ? 'ים המלח · נכסים להשכרה' : 'Dead Sea · Vacation Rentals'}
          </h1>
          <p className="text-gray-500 text-sm">
            {loadState === 'ok'
              ? isRtl ? `${hosts.length} נכסים זמינים` : `${hosts.length} properties available`
              : ''}
          </p>
        </div>

        {loadState === 'loading' && (
          <div className="flex items-center justify-center py-32 gap-3 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>{isRtl ? 'טוען נכסים...' : 'Loading...'}</span>
          </div>
        )}

        {loadState === 'error' && (
          <div className="flex items-center justify-center py-32 gap-3 text-red-400">
            <AlertCircle className="w-6 h-6" />
            <span>{isRtl ? 'שגיאה בטעינת הנכסים' : 'Failed to load listings'}</span>
          </div>
        )}

        {loadState === 'ok' && hosts.length === 0 && (
          <div className="text-center py-32 text-gray-400">
            {isRtl ? 'אין נכסים עדיין' : 'No properties yet'}
          </div>
        )}

        {loadState === 'ok' && hosts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {hosts.map((host, i) => (
              <PropertyCard key={host.hostId} host={host} lang={lang} gradient={GRADIENTS[i % GRADIENTS.length]} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function PropertyCard({ host, lang, gradient }: { host: Host; lang: Lang; gradient: string }) {
  const [imgError, setImgError] = useState(false)
  const firstImg = host.images.find(img => img.url)
  const showImg  = firstImg?.url && !imgError

  const isRtl = lang === 'he'
  const title    = host.title[lang] || host.title.he || host.title.en
  const location = host.location[lang] || host.location.he || host.location.en

  return (
    <a href={`/deadseabnb/${host.hostId}`}
      className="group flex flex-col rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer">

      {/* Image */}
      <div className={`relative h-56 bg-gradient-to-br ${gradient} shrink-0 overflow-hidden`}>
        {showImg
          ? <Image src={firstImg!.url!} alt={title} onError={() => setImgError(true)} fill sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300" />
          : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 group-hover:text-white/60 transition-colors">
              <span className="text-4xl mb-2">🏖️</span>
              <span className="text-xs">{isRtl ? 'ים המלח' : 'Dead Sea'}</span>
            </div>
          )
        }
        {host.rating > 0 && (
          <div className="absolute top-3 start-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 text-xs font-semibold shadow-sm">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {host.rating}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        {location && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}

        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
          {title || (isRtl ? 'נכס ללא שם' : 'Unnamed property')}
        </h3>

        <div className="text-xs text-gray-400 mt-0.5">
          {plural(host.maxGuests, isRtl ? 'אורח' : 'guest', isRtl ? 'אורחים' : 'guests')}
          {' · '}
          {plural(host.bedrooms, isRtl ? 'חדר' : 'bedroom', isRtl ? 'חדרים' : 'bedrooms')}
        </div>

        {/* Amenity icons */}
        {host.amenities.length > 0 && (
          <div className="flex items-center gap-2 mt-1">
            {host.amenities.slice(0, 5).map(key => {
              const Icon = AMENITY_ICONS[key]
              return Icon ? <Icon key={key} className="w-3.5 h-3.5 text-gray-400" /> : null
            })}
          </div>
        )}

        <div className="mt-auto pt-2 border-t border-gray-50">
          {host.pricePerNight > 0
            ? <span className="text-sm font-semibold text-gray-900">
                ₪{host.pricePerNight.toLocaleString()}
                <span className="text-xs font-normal text-gray-400"> {isRtl ? '/ לילה' : '/ night'}</span>
              </span>
            : <span className="text-xs text-gray-400">{isRtl ? 'מחיר בקשר ישיר' : 'Price on request'}</span>
          }
        </div>
      </div>
    </a>
  )
}
