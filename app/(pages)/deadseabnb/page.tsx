import type { Metadata } from 'next'
import ListingView from '@/app/components/bnb/listing-view'

const title = 'ים המלח · נכסים להשכרה'
const description = 'נכסים להשכרה לאורך חופי ים המלח — הנקודה הנמוכה ביותר בכדור הארץ.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    images: [{ url: '/api/og?app=bnb', width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/api/og?app=bnb'],
  },
}

export default function BnbListingPage() {
  return <ListingView />
}
