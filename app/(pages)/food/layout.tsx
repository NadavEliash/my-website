import type { Metadata } from "next"

const title = "הזמנת אוכל אונליין"
const description = "בוחרים מהתפריט, קובעים זמן איסוף ומשלמים — הכול מהנייד."

export const metadata: Metadata = {
  title,
  description,
  icons: {
    icon: "/pizza.svg",
  },
  openGraph: {
    title,
    description,
    images: [{ url: "/api/og?app=food", width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/api/og?app=food"],
  },
}

export default function FoodLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>
}
