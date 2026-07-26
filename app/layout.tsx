import type { Metadata } from "next"
import { Roboto_Condensed } from "next/font/google"
import "./globals.css"


import Navbar from "./components/navbar"

const roboto = Roboto_Condensed({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nadaveliash.com'),
  title: "Nadav Eliash",
  description: "Frontend/Fullstack Developer",
  icons: {
    icon: "/icon.svg",
  },

  openGraph: {
    type: "website",
    url: "https://nadaveliash.com",
    title: "Nadav Eliash",
    description: "Frontend/Fullstack Developer",
    siteName: "Nadav Eliash",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Nadav Eliash"
      }
    ],
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.className} text-white/80`}>
        <Navbar />
        <main className="">
          {children}
        </main>
      </body>
    </html>
  );
}