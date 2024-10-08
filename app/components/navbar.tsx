'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from 'next/navigation'
import { Dongle } from 'next/font/google'
import { Home, Info, Menu } from "lucide-react"

const dongle = Dongle({ weight: ["400"], subsets: ["latin"] })

const pages = [
    {
        href: '/',
        icon: <Home className="w-6 h-6 p-0.5 my-1" />,
        title: 'Home'
    },
    {
        href: '/about',
        icon: '',
        title: 'About'
    },
    {
        href: '/code_portfolio',
        icon: '',
        title: 'Code Portfolio'
    },
    // {
    //     href: '/animation_portfolio',
    //     icon: '',
    //     title: 'More..'
    // },
]

export default function Navbar() {
    const pathname = usePathname()

    const [display, setDisplay] = useState(false)
    const [hide, setHide] = useState(false)

    useEffect(()=>{
        pathname === "/animation_portfolio" ? setHide(true) : setHide(false)
    },[pathname])

    return (
        <>
            <nav className={`${hide? 'opacity-0 pointer-events-none' : ''} z-50 ${display ? 'left-0' : '-left-[110%]'} transition-all duration-500 absolute top-0 w-full flex-col items-start text-2xl ${dongle.className} 
            md:left-0 md:px-4 md:py-3 md:flex md:flex-row md:h-fit md:gap-4`}
                onClick={() => setDisplay(!display)}>
                {pages.map(page =>
                    <Link key={page.href} href={page.href} title={page.icon ? page.title : ''}
                        className="py-1 px-4 h-20 flex items-center bg-[rgb(16,16,37)] shadow-sm shadow-white/50 w-full cursor-pointer text-center md:h-10 md:w-fit md:bg-white/10 md:rounded-lg md:hover:bg-white/20">
                        {page.icon
                            ? page.icon
                            : <h1 className="mt-[3px] text-white">{page.title}</h1>}
                    </Link>
                )}
                <h1 className="absolute right-4 top-3 text-3xl text-white">nadaveliash.com</h1>
            </nav>
            <Menu className={`${hide? 'hidden' : ''} md:hidden ${display ? 'opacity-0' : 'opacity-100'} transition-opacity absolute flex left-2 top-2 w-8 h-8 text-black z-50 bg-gray-100/80 rounded-lg p-1`} onClick={() => setDisplay(!display)} />
            <div className={`${display ? 'opacity-1' : 'opacity-0 pointer-events-none'} transition-all duration-500 absolute top-0 w-full h-full bg-[rgba(16,16,37,.6)] z-40 md:hidden`}
                onClick={() => setDisplay(!display)}></div>
        </>
    )
}