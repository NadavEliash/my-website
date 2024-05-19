import type { Metadata } from "next"
import { Roboto_Condensed } from "next/font/google"
import "./globals.css"


import Navbar from "./components/navbar"

const roboto = Roboto_Condensed({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Nadav Eliash",
  description: "Frontend/Fullstack Developer | Designer | Animator",
  openGraph: {
    title: "Nadav Eliash",
    description: "Frontend/Fullstack Developer | Designer | Animator",
    url: 'https://nadaveliash.com',
    siteName: 'Nadav Eliash',
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Nadav Eliash"
      }
    ],
  },
  twitter: {
    title: "Nadav Eliash",
    description: "Frontend/Fullstack Developer | Designer | Animator",
    images: [
      {
        url: "/api/og",
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
      <head>
        <link rel="icon" href="./assets/icon.svg" sizes="any" />
        <meta property="og:image" content="https://res.cloudinary.com/dnvbfkgsb/image/upload/v1716116697/og_dqrtcu.png" />
        <meta property="og:image:width" content="600" />
        <meta property="og:image:height" content="315" />
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