'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image"
import localFont from "next/font/local"
import { Sue_Ellen_Francisco } from 'next/font/google'
import { ChevronLeft, ChevronRight, ChevronsLeft } from "lucide-react"

import { StaticImageData } from "next/image";
import profile from "./assets/profile.png"
import animate from "./assets/animate.png"
import projects from "./assets/projects.png"
import animationPortfolio from "./assets/animationPortfolio.png"
// import SceneCanvas from "./components/home-scene/scene-canvas";

const menlo = localFont({ src: '../Menlo-Regular.ttf' })
const sue_ellen = Sue_Ellen_Francisco({ subsets: ['latin'], weight: '400' })

interface line {
  str: string
  color: string
}

interface page {
  href: string
  headline: string
  description: string[]
  img?: StaticImageData | string
  imgStyle?: string
}

const pages: page[] = [
  {
    href: 'about',
    headline: '',
    description: [
      'My name is Nadav Eliash.',
      'I\'m a Frontend / Fullstack Web Developer, with experience in writing a single page applications...'
    ],
    img: profile,
    imgStyle: "w-20 h-20"
  },
  {
    href: 'animate',
    headline: 'Go Animate!',
    description: [
      'Animation app I built, based on HTML Canvas.',
      'The app allow users to draw along frames and create a classic animation clips.',
      '** The mobile version is still in progress.'
    ],
    img: animate
  },
  {
    href: 'projects',
    headline: 'My programming portfolio',
    description: ['An interactiv list That shows selection of apps I\'ve created.'],
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

  const [prevPage, setPrevPage] = useState(pages.length - 1)
  const [currentPage, setCurrentPage] = useState(0)
  const [nextPage, setNextPage] = useState(1)
  const [isWheel, setIsWheel] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [swipe, setSwipe] = useState(false)
  const [swipeFade, setSwipeFade] = useState(false)
  const [string, setString] = useState<line[]>([{
    str: '',
    color: ''
  }])

  useEffect(() => {
    setTimeout(() => {
      runText()
    }, 1000);

    setTimeout(() => {
      setSwipe(true)
    }, 4000)

    setTimeout(() => {
      setSwipeFade(true)
    }, 8000)
  }, [])

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
  ]

  const setPages = (val: number) => {
    if (val > 0) {
      const current = currentPage + 1 === pages.length ? 0 : currentPage + 1
      setPrevPage(currentPage)
      setCurrentPage(current)
      setNextPage(current + 1 === pages.length ? 0 : current + 1)
    } else {
      const current = currentPage === 0 ? pages.length - 1 : currentPage - 1
      setPrevPage(current - 1 < 0 ? pages.length - 1 : current - 1)
      setCurrentPage(current)
      setNextPage(currentPage)
    }

    console.log('prev: ', prevPage)
    console.log('current: ', currentPage)
    console.log('next: ', nextPage)
  }

  const handleWheel = (e: any) => {
    if (!isWheel) {
      setIsWheel(true)

      e.deltaY < 0 ? setPages(+1) : setPages(-1)

      setTimeout(() => {
        setIsWheel(false)
      }, 400)
    }
  }

  const handleTouchStart = (e: any) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: any) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = (e: any) => {
    if (!touchStart || !touchEnd) return

    if (touchStart! - touchEnd! > 0) {
      if (touchStart! - touchEnd! > 30) {
        setPages(+1)
      }
    } else {
      if (touchEnd! - touchStart! > 30) {
        setPages(-1)
      }
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
      }, i * 70);
    }
  }

  return (
    <main className={`${menlo.className} absolute left-0 top-0 h-svh w-full px-2 -z-10`}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}>
      <div className="mt-[25%] md:mt-20 md:m-10 md:w-fit h-[180px] md:h-[210px] bg-black/40 rounded-lg border-2 border-white text-lg flex flex-col" >
        <div className="w-full py-2 bg-white/10 flex items-center gap-2">
          <div className="w-3 h-3 ml-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="my-10 mx-5 md:text-xl md:w-[600px]">
          {string.length && string.map((letter, idx) =>
            <p key={idx} className={`${letter.color} inline transition-all leading-8`}>
              {letter.str === '+' ? <br /> : letter.str}
            </p>
          )}
          <p className="inline animate-pulse">|</p>
        </div>
      </div>

      <div className={`absolute bottom-1/2 w-full left-0 md:hidden ${swipe && !swipeFade ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000 ${swipeFade ? 'animate-[opacity_2s_linear]' : ''}`}>
        <ChevronsLeft className="w-16 h-16 rotate-180 animate-swipe" />
        <h1 className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap top-5 text-sm">swipe to navigate, click to jump in</h1>
      </div>

      <div className="absolute bottom-4 md:bottom-60 left-1/2 -translate-x-1/2 w-[95vw] md:w-[520px] h-[320px] flex items-center justify-center gap-[460px] overflow-hidden">
        <div className="hidden md:block" onClick={() => setPages(-1)}>
          <ChevronLeft className="mt-2 w-10 h-10 cursor-pointer" />
        </div>
        {pages.map((page, idx) =>
          <Link href={page.href} key={idx} className={`absolute bottom-0 bg-white/10 w-[100%] md:w-[400px] h-[320px] rounded-2xl px-6 py-4 transition-all duration-500 
          ${currentPage === idx ? 'left-1/2 -translate-x-1/2 md:left-[60px] md:translate-x-0 opacity-100'
              : nextPage === idx ? 'left-[400px] md:left-[520px] opacity-0'
                : prevPage === idx ? '-left-[400px] opacity-0' : 'left-[100%] opacity-0'}
            `}>
            <h1 className="text-2xl font-bold my-1 text-center">
              {page.headline}
            </h1>
            <Image key={idx} src={page.img!} alt="img" className={`${page.imgStyle} my-4 rounded-lg`} />
            <div className="mb-4">
              {page.description.map((line, idx) =>
                <p key={idx} className="text-justify">
                  {line}
                </p>
              )}</div>
          </Link>)}
        <div className="hidden md:block" onClick={() => setPages(+1)}>
          <ChevronRight className="mt-2 w-10 h-10 cursor-pointer" />
        </div>
      </div>
      {/* <SceneCanvas /> */}
    </main>
  );
}