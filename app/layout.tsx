import type { Metadata } from "next"  
import { Roboto_Condensed } from "next/font/google"
import "./globals.css"


import Navbar from "./components/navbar"

const roboto = Roboto_Condensed({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    absolute: '',
    default: "Nadav Eliash"
  },
  description: "Frontend / Fullstack programmer, Designer and Animator",
  icons: "./assets/icon.svg"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="icon.svg" sizes="any" />
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