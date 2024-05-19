import type { Metadata } from "next"
import { Roboto_Condensed } from "next/font/google"
import "./globals.css"


import Navbar from "./components/navbar"

const roboto = Roboto_Condensed({ subsets: ["latin"] })

export const metadata: Metadata = {
  openGraph: {
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Nadav Eliash"
      }
    ]
  },
  title: {
    absolute: '',
    default: "Nadav Eliash"
  },
  description: "Frontend / Fullstack developer | Designer | Animator",

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
        <meta property="og:title" content="Nadav Eliash" />
        <meta property="og:description" content="Frontend / Fullstack programmer, Designer and Animator" />
        {/* <meta property="og:image" content="https://res.cloudinary.com/dnvbfkgsb/image/upload/v1715897856/e7aa95be56c149d9a7c4abc6665f1a8c_walbzz.jpg" /> */}
        {/* <meta property="og:image:type" content="jpg" /> */}
        {/* <meta property="og:image:width" content="1200" /> */}
        {/* <meta property="og:image:height" content="630" /> */}
        {/* <meta property="twitter:image" content="https://res.cloudinary.com/dnvbfkgsb/image/upload/v1715897856/e7aa95be56c149d9a7c4abc6665f1a8c_walbzz.jpg" /> */}
        {/* <meta property="twitter:image:type" content="jpg" /> */}
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