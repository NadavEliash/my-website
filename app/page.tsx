'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image"
import localFont from "next/font/local"
import { Sue_Ellen_Francisco } from 'next/font/google'
import SceneCanvas from "./components/home-scene/scene-canvas"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

import { StaticImageData } from "next/image";
import profile from "../app/assets/profile.png"
import animate from "../app/assets/animate.png"
import projects from "../app/assets/projects.png"
import animationPortfolio from "../app/assets/animationPortfolio.png"


// import SceneCanvas from "./components/home-scene/scene-canvas";

const menlo = localFont({ src: '../Menlo-Regular.ttf' })
const sue_ellen = Sue_Ellen_Francisco({ subsets: ['latin'], weight: '400' })

interface line {
  str: string
  color: string
}

const text: line[] = [
  {
    str: "Hi there!",
    color: "text-pink-300"
  },
  {
    str: "+Welcome",
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
  },
  {
    str: "+please use the mouse-wheel or swipe to navigate",
    color: "text-emerald-400"
  }
]

interface page {
  href: string
  headline: string
  description: string[]
  img?: StaticImageData
  imgStyle?: string
}

const pages: page[] = [
  {
    href: 'about',
    headline: '',
    description: [
      'My name is Nadav Eliash.',
      'I\'m a Frontend / Full Stack Web Developer with experience in writing single-page-applications...'
    ],
    img: profile,
    imgStyle: "rounded-full w-20 h-20"
  },
  {
    href: 'animate',
    headline: 'Go Animate!',
    description: [
      'Animation app I built, using nextjs and HTML Canvas.',
      'Allow the user to draw along layers and frames and create a classic animation clips',
      'Note that Mobile version still in progress.'
    ],
    img: animate
  },
  {
    href: 'projects',
    headline: 'My programming portfolio',
    description: ['An interactiv list That shows some apps I\'ve created.'],
    img: projects
  },
  {
    href: 'portfolio',
    headline: 'Animation Portfolio',
    description: ['A selection of my animation works'],
    img: animationPortfolio
  },
]

export default function Home() {

  const [currentPage, setCurrentPage] = useState(0)
  const [isWheel, setIsWheel] = useState(false)
  const [string, setString] = useState<line[]>([{
    str: '',
    color: ''
  }])

  useEffect(() => {
    setTimeout(() => {
      runText()
    }, 1000);
  }, [])

  const handleWheel = (ev: any) => {
    if (!isWheel) {
      setIsWheel(true)

      ev.deltaY < 0 ?
        setCurrentPage(currentPage + 1 < pages.length ? currentPage + 1 : 0)
        : setCurrentPage(currentPage - 1 < 0 ? pages.length - 1 : currentPage - 1)

      setTimeout(() => {
        setIsWheel(false)
      }, 400)
    }
  }


  const runText = () => {
    const strLength = text.reduce((acc, current) => acc + current.str.length, 0)

    let newString: line[] = []

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
    <main className={`${menlo.className} absolute left-0 top-0 h-svh w-full px-2 -z-10`} onWheel={handleWheel}>
      <div className="mt-[15%] md:mt-20 md:m-10 md:w-fit bg-black/40 rounded-lg border-2 border-white text-lg flex flex-col" >
        <div className="w-full py-2 bg-white/10 flex items-center gap-2">
          <div className="w-3 h-3 ml-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="my-10 mx-5 text-xl md:w-[600px] leading-4">
          {string.length && string.map((letter, idx) =>
            <p key={idx} className={`${letter.color} inline transition-all`}>
              {letter.str === '+' ? <br /> : letter.str}
            </p>
          )}
          <p className="inline animate-pulse">|</p>
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 md:-translate-y-1/3 flex items-center justify-center gap-8">
        <div className="hidden md:block" onClick={() => setCurrentPage(currentPage - 1 < 0 ? pages.length - 1 : currentPage - 1)}>
          <ChevronLeft className="mt-2 w-10 h-10 cursor-pointer" />
        </div>
        <Link href={pages[currentPage].href} className="bg-white/10 w-[95vw] md:w-[400px] h-[320px] rounded-2xl px-6 py-4">
          <h1 className="text-2xl font-bold my-1 text-center">
            {pages[currentPage].headline}
          </h1>
          {pages[currentPage].img &&
            <Image src={pages[currentPage].img!} alt="img" className={`${pages[currentPage].imgStyle} my-4`} />}
          <div className="mb-4">
            {pages[currentPage].description.map((line, idx) =>
              <p key={idx} className="text-justify">
                {line}
              </p>
            )}</div>
        </Link>
        <div className="hidden md:block" onClick={() => setCurrentPage(currentPage + 1 >= pages.length ? 0 : currentPage + 1)}>
          <ChevronRight className="mt-2 w-10 h-10 cursor-pointer" />
        </div>
      </div>
      <ChevronDown className="md:hidden absolute bottom-1 left-[45vw] w-10 h-10 animate-bounce cursor-pointer z-10" onClick={() => setCurrentPage(currentPage + 1 >= pages.length ? 0 : currentPage + 1)} />
      {/* <SceneCanvas /> */}
    </main>
  );
}