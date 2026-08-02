'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image"
import localFont from "next/font/local"
import { Sue_Ellen_Francisco } from 'next/font/google'
import profile from "./assets/profile.png"


import { StaticImageData } from "next/image";
import about from "./assets/about.png"
import animate from "./assets/animate.gif"
import finerr from "./assets/finerr.gif"
import hebai from "./assets/hebai.gif"

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
      'My name is Nadav Eliash. I\'m a Frontend, Backend Web Developer.',
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
  // {
  //   href: 'code_portfolio/crypto-share',
  //   headline: 'Crypto share',
  //   description: ['Bitcoin demo app, shows live statistics and allows user to share his bitcoins with friends'],
  //   img: vitcoin,
  // },
  // {
  //   href: 'portfolio',
  //   headline: 'Animation Portfolio',
  //   description: ['I used to be an Animator. Here\'s a selection of my animation works.'],
  //   img: animationPortfolio
  // },
]

const text: line[] = [
  { str: "Hi there!", color: "text-pink-300" },
  { str: "+Welcome", color: "text-blue-400" },
  { str: ".to", color: "text-yellow-100" },
  { str: "(", color: "text-yellow-400" },
  { str: "{", color: "text-pink-300" },
  { str: " my_website ", color: "text-sky-300" },
  { str: "}", color: "text-pink-300" },
  { str: ")", color: "text-yellow-400" },
]

export default function Home() {

  const [prevPage, setPrevPage] = useState(pages.length - 1)
  const [currentPage, setCurrentPage] = useState(0)
  const [nextPage, setNextPage] = useState(1)
  const [isWheel, setIsWheel] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [swipeFade, setSwipeFade] = useState(false)
  const [string, setString] = useState<line[]>([{
    str: '',
    color: ''
  }])

  useEffect(() => {
    // type out the intro text one letter at a time, then reveal the swipe hint
    const runText = () => {
      const strLength = text.reduce((acc, current) => acc + current.str.length, 0)
      const newString: line[] = []
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
        }, i * 70)
      }
    }

    const t1 = setTimeout(runText, 1000)
    const t2 = setTimeout(() => setSwipeFade(true), 5600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

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

return (
        <>
            <div className="relative w-full bg-black/5 p-6 md:mx-auto md:mt-24 md:w-[660px] md:p-6 md:rounded-3xl">
                <Image src={profile} alt="profile" width={100} height={100} className="rounded-full"></Image>
                <p className="text-justify text-base pr-7 md:text-lg mt-8 font-light text-gray-900">
                    {`Hey there! My name is Nadav Eliash.`}
                    <br />
                    <br />
                    {`I'm a passionate Web Developer with 2 years of experience building end-to-end applications. My strong foundation in both frontend and backend development, combined with a keen eye for design, allows me to craft visually stunning and user-friendly digital experiences.`}
                    <br />
                    <br />
                    {`I've had the privilege of working with renowned brands like Mattel and Disney, as well as local organizations, where I've honed my skills in problem-solving, collaboration, and adaptability. My ability to seamlessly blend technical expertise with creative vision ensures that every project I undertake exceeds expectations.`}
                    <br />
                    <br />
                    {`Let's create something amazing together. Contact me today to discuss your project.`}
                </p>
            <Link href='/code_portfolio' className="block max-w-60 bg-gray-100 text-gray-900 p-4 px-10 rounded-full mx-auto text-center font-bold text-lg mt-4">Code portfolio</Link>
            </div>
            <div className="fixed bottom-0 right-0 flex w-[100%] pb-4 gap-2 md:gap-8 flex-col items-end justify-center md:flex-row md:mt-10 ">
                <Link href="https://drive.google.com/file/d/1ZaJTI-GByj5o4FIRtB2yXsgm92WZ_dIa/view?usp=drive_link" className="w-12 h-12 md:w-[76px] md:h-[76px] flex flex-col items-center p-1 md:px-3 md:py-1 md:m-1 md:mb-0 bg-black/60 rounded-full border-solid border-2 border-gray-900">
                    <Image src="https://www.svgrepo.com/show/384666/career-detail-document-file-info-job.svg" alt="CV" width={60} height={60} className="invert w-16 h-16">
                    </Image>
                    <h1 className="hidden md:block text-sm text-white">cv</h1>
                </Link>
                <Link href="https://github.com/NadavEliash" className="w-12 md:w-20 md:h-20 rounded-full bg-gray-200 border-solid border-2 border-gray-900 p-1">
                    <Image src="https://www.svgrepo.com/show/450156/github.svg" alt="github" width={60} height={60} className="rounded-full w-full h-full"></Image>
                </Link>
                <Link href="https://www.linkedin.com/in/nadav-eliash/" className="w-12 md:w-20 md:h-20 rounded-full ">
                    <Image src="https://www.svgrepo.com/show/452051/linkedin.svg" alt="linkedin" width={60} height={60} className="rounded-full w-full h-full bg-blue-900"></Image>
                </Link>
            </div>
        </>
    )
}