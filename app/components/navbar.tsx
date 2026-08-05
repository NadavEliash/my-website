'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from 'next/navigation'
import { Dongle } from 'next/font/google'
import { Home, Info, Menu, ChevronDown } from "lucide-react"

const dongle = Dongle({ weight: ["400"], subsets: ["latin"] })

const pages = [
    {
        href: '/',
        icon: '',
        title: 'Home'
    },
    {
        href: '/code_portfolio',
        icon: '',
        title: 'Code Portfolio'
    },
]

const morePages = [
    {
        href: '/animation_portfolio',
        title: 'Animation Portfolio'
    },
    {
        href: '/pizza',
        title: 'Pizza'
    },
    {
        href: '/deadseabnb',
        title: 'BnB'
    },
    {
        href: '/food/dashboard',
        title: 'Food'
    },
    {
        href: '/quest',
        title: '20 Questions'
    },
]

export default function Navbar() {
    const pathname = usePathname()

    const [display, setDisplay] = useState(false)
    const [hide, setHide] = useState(false)
    const [moreOpen, setMoreOpen] = useState(false)

    useEffect(()=>{
        setHide(pathname !== "/" && pathname !== "/code_portfolio")
    },[pathname])

    return (
        <>
            {!hide && <nav className={`z-50 ${display ? 'left-0' : '-left-[110%]'} transition-all duration-500 absolute top-0 w-full flex-col items-start text-2xl ${dongle.className} 
            md:left-0 md:px-4 md:py-3 md:flex md:flex-row md:h-fit md:gap-4`}
                onClick={() => setDisplay(!display)}>
                {pages.map(page =>
                    <Link key={page.href} href={page.href} title={page.icon ? page.title : ''}
                        className="py-1 px-4 h-20 flex items-center bg-gray-200 shadow-sm shadow-white/50 w-full cursor-pointer text-center md:h-10 md:w-fit md:bg-white/10 md:rounded-lg md:hover:bg-white/20">
                        {page.icon
                            ? page.icon
                            : <h1 className="mt-[3px] text-gray-900">{page.title}</h1>}
                    </Link>
                )}

                {/* more links */}
                <div className="relative w-full md:w-fit" onClick={e => e.stopPropagation()}>
                    <button type="button" onClick={() => setMoreOpen(o => !o)}
                        className="py-1 px-4 h-20 flex items-center justify-center gap-1 w-full text-center md:h-10 md:w-fit">
                        <h1 className="mt-[3px] text-transparent">More</h1>
                        <ChevronDown className={`w-5 h-5 text-transparent transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {moreOpen &&
                        <div className="flex flex-col w-full md:absolute md:top-full md:left-0 md:mt-1 md:w-48 md:bg-white/10 md:backdrop-blur md:rounded-lg md:overflow-hidden md:shadow-lg">
                            {morePages.map(page =>
                                <Link key={page.href} href={page.href}
                                    className="py-1 px-4 h-16 flex items-center bg-gray-100 shadow-sm shadow-white/50 w-full cursor-pointer text-center md:h-10 md:bg-transparent md:shadow-none md:hover:bg-white/20">
                                    <h1 className="mt-[3px] text-gray-900">{page.title}</h1>
                                </Link>
                            )}
                        </div>}
                </div>
            </nav>}
            {!hide && <Menu className={`md:hidden ${display ? 'opacity-0' : 'opacity-100'} transition-opacity absolute flex left-4 top-4 w-10 h-10 text-black z-50 bg-gray-400/80 rounded-lg p-1`} onClick={() => setDisplay(!display)} />}
            {!hide && <div className={`${display ? 'opacity-1' : 'opacity-0 pointer-events-none'} transition-all duration-500 absolute top-0 w-full h-full bg-[rgba(16,16,37,.6)] z-40 md:hidden`}
                onClick={() => setDisplay(!display)}></div>}
        </>
    )
}