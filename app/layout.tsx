import type { Metadata } from "next"
import { Roboto_Condensed } from "next/font/google"
import "./globals.css"


import Navbar from "./components/navbar"

const roboto = Roboto_Condensed({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://nadaveliash.com'),
  title: "Nadav Eliash",
  description: "Frontend/Fullstack Developer",
  
  openGraph: {
    title: "Nadav Eliash",
    description: "Frontend/Fullstack Developer",
    siteName: 'Nadav Eliash',
    images: [
      {
        url: "/api/og",
        width: 600,
        height: 315,
        alt: "Nadav Eliash"
      }
    ],
  },
  twitter: {
    title: "Nadav Eliash",
    description: "Frontend/Fullstack Developer",
    images: [
      {
        url: "/api/og",
        width: 600,
        height: 315,
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