import Link from "next/link"
import { Dongle } from 'next/font/google'
import { Home, Info } from "lucide-react"

const dongle = Dongle({ weight: ["400"], subsets: ["latin"] })


export default function Navbar() {
    const pages = [
        {
            href: '/',
            icon: <Home className="w-6 h-6 p-0.5 my-1" />,
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

    return (
        <nav className={`w-full py-3 flex items-center gap-1 text-white text-2xl ${dongle.className}`}>
            {pages.map(page =>
                <Link key={page.href} href={page.href} title={page.icon ? page.title : ''}
                    className="p-1 h-10 ml-2 px-4 flex bg-white/10 hover:bg-white/20 cursor-pointer text-center rounded-lg text-white/85">
                    {page.icon
                        ? page.icon
                        : <h1 className="mt-[3px]">{page.title}</h1>}
                </Link>
            )}
        </nav>
    )
}