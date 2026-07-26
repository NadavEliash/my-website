import type { Metadata } from 'next'
import ListingView from '@/app/components/bnb/listing-view'

const title = 'ים המלח · נכסים להשכרה'
const description = 'נכסים להשכרה לאורך חופי ים המלח — הנקודה הנמוכה ביותר בכדור הארץ.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    type: 'website',
    title,
    description,
    images: [{ url: '/bnb-og.png', width: 1200, height: 630, alt: title }],
  },
}

export default function BnbListingPage() {
  return <ListingView />
}
