'use client'

import Link from "next/link"
import { Dongle } from 'next/font/google'
import { Home, Info, Menu } from "lucide-react"
import { useState } from "react"

const dongle = Dongle({ weight: ["400"], subsets: ["latin"] })


export default function Navbar() {
    const pages = [
        {
            href: '/',
            icon: <Home className="w-6 h-6 p-0.5 my-1 text-black md:text-inherit" />,
            title: 'Home'
        },
        {
            href: 'about',
            icon: '',
            title: 'About'
        },
        {
            href: 'animate',
            icon: '',
            title: 'Go Animate!'
        },
        {
            href: 'projects',
            icon: '',
            title: 'More apps'
        },
        {
            href: 'portfolio',
            icon: '',
            title: 'Animation Portfolio'
        },
    ]

    const [display, setDisplay] = useState(false)

    return (
        <>
            <nav className={`${display ? 'flex' : 'hidden'} absolute top-0 left-0 z-50 w-full h-full py-3 flex-col items-start gap-1 bg-white/10 text-2xl ${dongle.className} 
            md:bg-transparent md:flex md:flex-row md:h-fit`} onClick={()=>setDisplay(!display)}>
                {pages.map(page =>
                    <Link key={page.href} href={page.href} title={page.icon ? page.title : ''}
                        className="p-1 h-10 ml-2 px-4 flex bg-white/80 w-full md:w-fit md:bg-white/10 rounded-lg hover:bg-white/20 cursor-pointer text-center text-white/85">
                        {page.icon
                            ? page.icon
                            : <h1 className="mt-[3px] text-black/80 md:text-inherit">{page.title}</h1>}
                    </Link>
                )}
            </nav>
            <Menu className={`md:hidden ${display ? 'hidden' : 'flex'} absolute left-2 top-2 w-8 h-8 text-black z-50 bg-white/40 rounded-lg p-1`} onClick={()=>setDisplay(!display)} />

        </>
    )
}