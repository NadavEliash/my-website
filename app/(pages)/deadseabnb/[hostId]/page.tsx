import type { Metadata } from 'next'
import GuestView from '@/app/components/bnb/guest-view'

interface Props { params: Promise<{ hostId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hostId } = await params
  return {
    title: 'סוויטת ים המלח | חופשה בצפון ים המלח',
    description: 'סוויטה פרטית יוקרתית על חוף ים המלח.',
    icons: { icon: '/sun-umbrella.svg' },
    alternates: { canonical: `/deadseabnb/${hostId}` },
  }
}

export default async function PropertyPage({ params }: Props) {
  const { hostId } = await params
  return <GuestView hostId={hostId} />
}
