import type { Metadata } from "next"
import localFont from "next/font/local"

const ploni = localFont({
  src: [
    { path: "../../../fonts/ploni-regular-aaa.woff", weight: "400", style: "normal" },
    { path: "../../../fonts/ploni-bold-aaa.woff", weight: "700", style: "normal" },
    { path: "../../../fonts/ploni-black-aaa.woff", weight: "900", style: "normal" },
  ],
})

const title = "הזמנת אוכל אונליין"
const description = "בוחרים מהתפריט, קובעים זמן איסוף ומשלמים — הכול מהנייד."

export const metadata: Metadata = {
  title,
  description,
  icons: {
    icon: "/pizza.svg",
  },
  openGraph: {
    type: "website",
    title,
    description,
    images: [{ url: "/food-og.png", width: 1200, height: 630, alt: title }],
  },
}

export default function FoodLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className={ploni.className}>{children}</div>
}
