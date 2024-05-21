'use client'

import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import CodeProject from "@/app/components/code-project"
import WheelGuid from "@/app/components/guids/wheel-guid"

export interface project {
    params: string
    title: string
    subTitle?: string
    description: string[]
    src: string
    video: string
    repo: string
}

const projects: project[] = [
    {
        params: 'animate',
        title: 'Animate online',
        description: ['Animation app, based on HTML Canvas and React.', 'The app allow users create an animation clips from scratch. User can draw, erase, then translate, rotate and scale his drawings. Drawing along multiple frames creates animation, which the user can play and download.'],
        src: '/animate',
        video: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1716328797/animate_dy2dk9.mp4',
        repo: 'https://github.com/NadavEliash/personal-website-prod-'
    },
    {
        params: 'finerr',
        title: 'Finerr',
        description: ['A Fiverr-like marketplace, contains the full user experience of the original app.', 'I take part of a small team which created it within three weeks, using React, Redux, SCSS, Node.js, MongoDB and Git', 'I was responsible for Homepage, search and filter components, as well as to create and connect the Server and Database'],
        src: 'https://finerr.onrender.com/',
        video: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1715799738/finerr_xk2fx8.mp4',
        repo: 'https://github.com/TodikPanshin/Sprint4-finerr'
    },
    {
        params: 'heb_ai',
        title: 'AI hebrew app',
        subTitle: '(בינה עברית)',
        description: ['AI platform for Hebrew speakers.', 'End to end application. Next, Typescript, Tailwind, PrismaDB.',
            'Auth by Clerk. The AI generation start with sending an API requests to Google cloud for translation to English, then send request to Openai / Replicate for generation.',
            'Each logged-in user get 5 sessions for free and then have to subscribe. The payment is made via Upay and then get back with a new link, which sign the users in the database according their plan.'],
        src: 'https://ai-heb-app.vercel.app/dashboard',
        video: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1715799717/heb-ai_xsylql.mp4',
        repo: 'https://github.com/NadavEliash/AI-heb-app'
    },
    {
        params: 'vitcoin',
        title: 'Vit-coin',
        description: ['Bitcoin trade app, based on Vue.js.', 'The app allows user to check current value and statistics of Bitcoin. also, gives the users demo wallet to transfer bitcoins to their contacts', 'contact list (demo data) allows full CRUD actions'],
        src: 'https://nadaveliash.github.io/vitcoin-vue/#/',
        video: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1715799737/vitcoin_hj9lxk.mp4',
        repo: 'https://github.com/NadavEliash/vitcoin-vue'
    },
]

export default function Projects() {

    const router = useRouter()
    const params = useParams()

    const [currentView, setCurrentView] = useState(0)
    const [isReplacing, setIsReplacing] = useState(false)
    const [isScroll, setIsScroll] = useState(false)
    const [touchStart, setTouchStart] = useState(null)
    const [guidDisplay, setGuidDisplay] = useState<boolean>(true)
    const [fadeOut, setFadeOut] = useState<boolean>(false)

    useEffect(() => {
        if (params.project) {
            const idx = projects.findIndex((project, idx)=> project.params === params.project[0])
            setCurrentView(idx)
        }

        setTimeout(() => {
            setGuidDisplay(false)
        }, 1000)

        setTimeout(() => {
            setFadeOut(true)
        }, 1000)
    }, [])

    const handleWheel = (ev: any) => {
        if (!isScroll) {
            setIsScroll(true)
            setIsReplacing(true)

            ev.deltaY < 0
                ? setCurrentView(currentView + 1 >= projects.length ? 0 : currentView + 1)
                : setCurrentView(currentView - 1 < 0 ? projects.length - 1 : currentView - 1)

            setTimeout(() => {
                setIsReplacing(false)
            }, 100)

            setTimeout(() => {
                setIsScroll(false)
            }, 800)
        }
    }

    const handleTouchStart = (ev: any) => {
        setTouchStart(ev.touches[0].pageY)
    }

    const handleTouch = (e: any) => {
        if (!isScroll) {
            setIsScroll(true)
            setIsReplacing(true)

            e.touches[0].pageY - touchStart! < 0
                ? setCurrentView(currentView + 1 >= projects.length ? 0 : currentView + 1)
                : setCurrentView(currentView - 1 < 0 ? projects.length - 1 : currentView - 1)

            setTimeout(() => {
                setIsReplacing(false)
            }, 100)

            setTimeout(() => {
                setIsScroll(false)
            }, 800)
        }
    }

    return (
        <div className="w-full h-svh text-white"
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouch}
        >
            <div className="absolute md:hidden w-[38px] h-[38px] bg-black/80 top-[5px] left-[5px] rounded-xl z-40"></div>

            {projects && projects.map((project, idx) =>
                idx === currentView ? <CodeProject key={idx} project={project} /> : <div key={idx}></div>
            )}
            <div id="desktop-guid" className="hidden md:block">
                <WheelGuid guidDisplay={guidDisplay} />
            </div>
            <div id="swipe-guid" className={`md:hidden absolute w-full h-svh top-0 left-0 flex flex-col items-center justify-end gap-3 text-white overflow-hidden ${fadeOut && 'animate-[opacity_1s_linear] opacity-0 pointer-events-none'}`}>
                <div className="absolute w-[600px] h-[600px] bg-gradient-to-t from-black/70 from-70% to-transparent -bottom-[300px] rounded-full"></div>
                <Image src={'https://www.svgrepo.com/show/409931/swipe-right.svg'} alt="swipe" width={40} height={40} className="opacity-100 animate-swipeDown invert z-50" />
                <h1 className="z-50 text-2xl mb-10">Swipe to see more..</h1>
            </div>
        </div>
    )
}