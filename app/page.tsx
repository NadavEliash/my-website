'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import localFont from "next/font/local"
import { Sue_Ellen_Francisco } from 'next/font/google'

// import SceneCanvas from "./components/home-scene/scene-canvas";

const menlo = localFont({ src: '../Menlo-Regular.ttf' })
const sue_ellen = Sue_Ellen_Francisco({ subsets: ['latin'], weight: '400' })

interface line {
  str: string
  color: string
}

const text: line[] = [
  {
    str: "Hi there. ",
    color: "text-pink-300"
  },
  {
    str: "Welcome",
    color: "text-blue-400"
  },
  {
    str: ".to",
    color: "text-yellow-100"
  },
  {
    str: "(",
    color: "text-yellow-400"
  },
  {
    str: "{",
    color: "text-pink-300"
  },
  {
    str: " my_website ",
    color: "text-sky-300"
  },
  {
    str: "}",
    color: "text-pink-300"
  },
  {
    str: ")",
    color: "text-yellow-400"
  }
]

interface view {
  href: string
  headline: string
}

const views: view[] = [
  {
    href: '/',
    headline: 'Home',
  },
  {
    href: 'about',
    headline: 'About',
  },
  {
    href: 'animate',
    headline: 'Go Animate!',
  },
  {
    href: 'projects',
    headline: 'More apps',
  },
  {
    href: 'portfolio',
    headline: 'Animation Portfolio',
  },
]

export default function Home() {

  const [currentView, setCurrentView] = useState(0)
  const [isWheel, setIsWheel] = useState(false)
  const [string, setString] = useState<line[]>([{
    str: '',
    color: ''
  }])

  useEffect(() => {
    setTimeout(() => {
      runText()
    }, 2000);
  }, [])

  const handleWheel = (ev: any) => {
    if (!isWheel) {
      setIsWheel(true)

      ev.deltaY < 0 ?
        setCurrentView(currentView + 1 < views.length ? currentView + 1 : currentView)
        : setCurrentView(currentView - 1 < 0 ? 0 : currentView - 1)

      setTimeout(() => {
        setIsWheel(false)
      }, 400)
    }
  }

  let newString: line[] = []

  const runText = () => {
    const strLength = text.reduce((acc, current) => acc + current.str.length, 0)

    text.forEach(line => {
      const letters = line.str.split("")
      for (let i = 0; i < letters.length; i++) {
        newString.push({ str: letters[i], color: line.color })
      }
    })

    for (let i = 0; i < strLength; i++) {
      const newLetter = { str: newString[i].str, color: newString[i].color }
      setTimeout(() => {
        setString(prev => [...prev, newLetter])
      }, i * 100);
    }
  }

  return (
    <main className={`${menlo.className} absolute left-0 top-0 h-dvh w-full -z-10`} onWheel={handleWheel}>
      <div className="m-40 w-fit h-36 bg-black/40 rounded-lg border-2 border-white text-lg flex flex-col" >
        <div className="w-full py-2 bg-white/10 flex items-center gap-2">
          <div className="w-3 h-3 ml-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="my-10 mx-5 text-xl w-[600px]">
          {string.length && string.map((letter, idx) =>
            <p key={idx} className={`${letter.color} inline transition-all`}>
              {letter.str}
            </p>
          )}
          <p className="inline animate-pulse">|</p>
        </div>
      </div>
      {/* <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
        <div>
          <Link href={views[currentView].href}>
            <h1>
              {views[currentView].headline}
            </h1>
          </Link>
        </div>
      </div> */}
      {/* <SceneCanvas /> */}
    </main>
  );
}