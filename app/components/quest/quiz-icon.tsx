'use client'

// Renders a quiz icon inside its (already-sized, round) container.
// Accepts either an image url (production data) or an emoji (demo data).
export default function QuizIcon({ icon }: { icon: string }) {
  const isUrl = /^(https?:|\/)/.test(icon)
  if (isUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={icon} alt="" className="w-full h-full object-cover" />
  }
  return <span className="text-3xl leading-none">{icon}</span>
}
