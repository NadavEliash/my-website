import type { Metadata } from 'next'
import ListingView from '@/app/components/bnb/listing-view'

export const metadata: Metadata = {
  title: 'ים המלח · נכסים להשכרה',
  description: 'נכסים להשכרה לאורך חופי ים המלח — הנקודה הנמוכה ביותר בכדור הארץ.',
  icons: { icon: '/bnb-icon.svg' },
}

export default function BnbListingPage() {
  return <ListingView />
}
