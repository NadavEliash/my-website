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
    mobileVideo?: string 
    repo: string
}

const projects: project[] = [
    {
        params: 'animate',
        title: 'Animate online',
        description: ['Animation app, based on HTML Canvas and React.', 'The app allow users create an animation clips from scratch. User can draw, erase, then translate, rotate and scale his drawings. Drawing along multiple frames creates animation, which the user can play and download.'],
        src: 'https://animate.nadaveliash.com/',
        video: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1725219524/pc-animate_mccrt2.mp4',
        repo: 'https://github.com/NadavEliash/animate-online'
    },
    {
        params: 'finerr',
        title: 'Finerr',
        description: ['A Fiverr-like marketplace, contains the full user experience of the original app.', 'I take part of a small team which created it within three weeks, using React, Redux, SCSS, Node.js, MongoDB and Git', 'I was responsible for Homepage, search and filter components, as well as to create and connect the Server and Database'],
        src: 'https://finerr.onrender.com/',
        video: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1725219758/pc-finerr_m6ht9x.mp4',
        mobileVideo: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1725258027/mobile-finerr_rt00ku.mp4',
        repo: 'https://github.com/TodikPanshin/Sprint4-finerr'
    },
    {
        params: 'heb_ai',
        title: 'AI hebrew app',
        description: ['AI platform for Hebrew speakers.', 'End to end application. Next, TS, Tailwind, PrismaDB.',
            'The user\'s hebrew text sent to Google translate, then the translation sent to Openai or Replicate for generation.',
            'Each user get 5 sessions for free and then have to subscribe. The payment is made via Upay which give the user new link according their plan, which sign them in the database.'],
        src: 'https://ai-heb-app.vercel.app/dashboard',
        video: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1725219787/pc-bina_dgfimy.mp4',
        mobileVideo: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1725258045/mobile-bina_lxqciq.mp4',
        repo: 'https://github.com/NadavEliash/AI-heb-app'
    },
    {
        params: 'trip-planner',
        title: 'Trip planner',
        description: ['Web app for planning trips.','The app connects with ChatGPT and Google Cloud via REST API to provide users with a complete trip plan, delivering a neat and clean user experience.','Springboot, JWT, Rest API (Chat GPT, Google Maps, Google Places), Mongodb, Docker, AWS, React.js'],
        src: 'http://triplanner.nadaveliash.com/',
        video: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1725219515/pc-trip_lhsdqc.mp4',
        mobileVideo: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1725257991/mobile-trip_zkx45p.mp4',
        repo: 'https://github.com/NadavEliash/trip-planner'
    },
    {
        params: 'crypto-share',
        title: 'Crypto share',
        description: ['Share with friends demo app, based on Vue.js.', 'The app allows user to check current value and statistics of Bitcoin. also, gives the users demo wallet to share with their contacts.', 'The contact list (demo data) allows full CRUD actions.'],
        src: 'https://nadaveliash.github.io/vitcoin-vue/#/',
        video: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1725219518/pc-crypto_fjqxz9.mp4',
        mobileVideo: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1725257970/mobile-crypto_js8dty.mp4',
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
        }, 2000)

        setTimeout(() => {
            setFadeOut(true)
        }, 1000)
    }, [])

    const handleWheel = (ev: any) => {
        if (!isScroll) {
            setIsScroll(true)
            setIsReplacing(true)

            ev.deltaY > 0
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