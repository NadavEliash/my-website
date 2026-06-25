export type Lang = 'he' | 'en'

export interface BilingualText {
  he: string
  en: string
}

export enum AmenityKey {
  Wifi    = 'wifi',
  Ac      = 'ac',
  Kitchen = 'kitchen',
  Parking = 'parking',
  Sea     = 'sea',
  View    = 'view',
  Pool    = 'pool',
  Spa     = 'spa',
}

export interface HostImage {
  url?: string
  label: BilingualText
}

export interface Host {
  // Identity
  hostId:       string           // URL slug  e.g. "dead-sea-suite"
  username:     string           // login credential (private)
  name:         string           // display name
  password?:    string           // never sent to client

  // Property
  title:        BilingualText
  about:        Record<Lang, string[]>
  location:     BilingualText
  locationNote: BilingualText
  images:       HostImage[]

  // Facilities
  amenities:    AmenityKey[]
  rules:        Record<Lang, string[]>

  // Pricing
  pricePerNight: number
  cleaningFee:   number

  // Capacity
  maxGuests:  number
  bedrooms:   number
  beds:       number
  bathrooms:  number

  // Stats
  rating:       number
  reviewCount:  number
  hostingSince: number

  // Calendar
  unavailableDates: string[]   // ISO strings "YYYY-MM-DD"
  gapBefore?: number           // days to block before each reserved block
  gapAfter?:  number           // days to block after each reserved block
}
