import type { Metadata } from "next"
import { Roboto_Condensed } from "next/font/google"
import "./globals.css"


import Navbar from "./components/navbar"

const roboto = Roboto_Condensed({ subsets: ["latin"] })

export const metadata: Metadata = {
  openGraph: {
    url: 'https://nadaveliash.com',
    title: {
      absolute: '',
      default: "Nadav Eliash"
    },
    siteName: 'Nadav Eliash',
    description: "Frontend / Fullstack developer | Designer | Animator",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Nadav Eliash"
      }
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="./assets/icon.svg" sizes="any" />
      </head>
      <body className={`${roboto.className} text-white/80`}>
        <Navbar />
        <main className="">
          {children}
        </main>
      </body>
    </html>
  );
}