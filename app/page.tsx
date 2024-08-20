'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image"
import localFont from "next/font/local"
import { Sue_Ellen_Francisco } from 'next/font/google'
import { ChevronLeft, ChevronRight, ChevronsLeft } from "lucide-react"

import { StaticImageData } from "next/image";
import about from "./assets/about.png"
import animate from "./assets/animate.gif"
import finerr from "./assets/finerr.gif"
import hebai from "./assets/hebai.gif"
import vitcoin from "./assets/vitcoin.gif"
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
}

const pages: page[] = [
  {
    href: 'about',
    headline: 'About me',
    description: [
      'My name is Nadav Eliash. I\'m a Frontend, Fullstack Web Developer.',
      'more..'
    ],
    img: about,
  },
  {
    href: 'code_portfolio/animate',
    headline: 'Animate Online',
    description: [
      'Animation app I built, based on HTML Canvas and React (Mobile version still in progress).'
    ],
    img: animate,
  },
  {
    href: 'code_portfolio/finerr',
    headline: 'Finerr',
    description: ['Fiverr like marketplace, I\'ve created as part of a small team'],
    img: finerr,
  },
  {
    href: 'code_portfolio/heb_ai',
    headline: 'AI hebrew app (בינה עברית)',
    description: ['App which accessible AI platforms to Hebrew speakers'],
    img: hebai,
  },
  {
    href: 'code_portfolio/vitcoin',
    headline: 'Vit-coin',
    description: ['Bitcoin demo app, shows live statistics and allows user to share his bitcoins with friends'],
    img: vitcoin,
  },
  // {
  //   href: 'portfolio',
  //   headline: 'Animation Portfolio',
  //   description: ['I used to be an Animator. Here\'s a selection of my animation works.'],
  //   img: animationPortfolio
  // },
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
    <main className={`absolute left-0 top-0 h-svh w-full px-2 -z-10`}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}>
      {/* <div className="mt-[25%] md:mt-32 md:m-20 md:w-fit h-[150px] md:h-[180px] bg-black/40 rounded-lg border-2 border-white flex flex-col" >
        <div className="w-full py-2 bg-white/10 flex items-center gap-2">
          <div className="w-3 h-3 ml-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="mt-6 mx-5 md:text-xl md:w-[500px]">
          {string.length && string.map((letter, idx) =>
            <p key={idx} className={`${letter.color} ${menlo.className} inline transition-all leading-8 md:text-3xl`}>
              {letter.str === '+' ? <br /> : letter.str}
            </p>
          )}
          <p className="inline animate-pulse text-2xl md:text-4xl">|</p>
        </div>
      </div> */}

      <div className={`absolute w-full left-0 top-[25%] md:hidden transition-opacity duration-200 ${swipeFade ? 'animate-[opacity_.5s_linear]' : ''}`}>
        <Image src={'https://www.svgrepo.com/show/409928/swipe-left.svg'} alt='swipe' width={50} height={50} className="absolute -top-4 w-10 h-10 invert animate-swipe" />
        <h1 className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap -top-10 text-sm">swipe to navigate, click to jump in</h1>
      </div>

      <div className="absolute bottom-4 md:top-[40%] left-1/2 -translate-x-1/2 w-[95vw] md:w-[520px] h-[400px] max-h-[50%] flex items-center justify-center gap-[460px] overflow-hidden">
        <div className="hidden md:block" onClick={() => setPages(-1)}>
          <ChevronLeft className="mt-2 w-10 h-10 cursor-pointer" />
        </div>
        {pages.map((page, idx) =>
          <Link href={page.href} key={idx} className={`absolute bg-white/10 w-[100%] max-w-[340px] md:w-[360px] h-[400px] max-h-[100%] rounded-[30px] p-5 transition-all duration-500 grid grid-rows-12
          ${currentPage === idx ? 'left-1/2 -translate-x-1/2 md:left-[90px] md:translate-x-0 opacity-100'
              : nextPage === idx ? 'left-[400px] md:left-[520px] opacity-0'
                : prevPage === idx ? '-left-[400px] opacity-0' : 'left-[100%] opacity-0'}
            `}>
            <div className={`rounded-xl row-span-7 h-fit border-[1px] border-white/50 overflow-hidden`}>
              <Image key={idx} src={page.img!} alt="img" loading="eager" width={960} height={540} priority unoptimized/>
            </div>
            <h1 className="text-xl font-bold mx-3 row-start-9 ">
              {page.headline}
            </h1>
            <div className="row-span-2 mt-2">
              {page.description.map((line, idx) =>
                <p key={idx} className="text-justify mx-3">
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