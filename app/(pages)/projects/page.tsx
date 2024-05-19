'use client'

import WheelGuid from "@/app/components/guids/wheel-guid"
import Loader from "@/app/components/loader"
import { ChevronsDown, Smartphone, Tv2 } from "lucide-react"
import { Fredoka } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { TouchEventHandler, useEffect, useState } from "react"

const fredoka = Fredoka({ weight: "400", subsets: ['hebrew'] })

interface project {
    title: string
    subTitle?: string
    description: string[]
    src: string
    video: string
}

const projects: project[] = [
    {
        title: 'בינה עברית',
        subTitle: '(AI hebrew app)',
        description: ['AI platform for Hebrew speakers.', 'End to end application. Next, Typescript, Tailwind, PrismaDB.',
            'Auth with Clerk (currently suspend to allow guest to enter). The AI generation start with sending an API requests to Google cloud for translate, then send request to Openai / Replicate for generation.',
            'Each logged-in user get 5 generation for free and then have to subscribe. The users can pay through Upay and then get back to the site with a new link, which sign them with their plan.'],
        src: 'https://ai-heb-app.vercel.app/dashboard',
        video: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1715799717/heb-ai_xsylql.mp4'
    },
    {
        title: 'Finerr',
        description: ['A Fiverr-like marketplace, contains the full user experience of the original app.', 'I take part of a small team which created it within three weeks, using React, Redux, SCSS, Node.js, MongoDB and Git', 'I was responsible for Homepage, search and filter components, as well as to create and connect the Server and Database'],
        src: 'https://finerr.onrender.com/',
        video: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1715799738/finerr_xk2fx8.mp4'
    },
    {
        title: 'Vit-coin',
        description: ['Bitcoin trade app, based on Vue.js.', 'The app allows user to check current value and statistics of Bitcoin. also, gives the users demo wallet to transfer bitcoins to their contacts', 'contact list (demo data) allows full CRUD actions'],
        src: 'https://nadaveliash.github.io/vitcoin-vue/#/',
        video: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1715799737/vitcoin_hj9lxk.mp4'
    },
]

export default function Projects() {

    const router = useRouter()

    const [currentView, setCurrentView] = useState(0)
    const [wideScreen, setWideScreen] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [isReplacing, setIsReplacing] = useState(false)
    const [isScroll, setIsScroll] = useState(false)
    const [touchStart, setTouchStart] = useState(null)
    const [guidDisplay, setGuidDisplay] = useState<boolean>(true)
    const [fadeOut, setFadeOut] = useState<boolean>(false)

    useEffect(() => {
        setTimeout(() => {
            setGuidDisplay(false)
        }, 1000)

        setTimeout(() => {
            setFadeOut(true)
        }, 2000)
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

    const onLoad = () => {
        setTimeout(() => {
            setIsLoading(false)
        }, 1000);
    }

    return (
        <div className="w-full h-svh text-white"
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouch}
        >
            <div className="absolute md:hidden w-[38px] h-[38px] bg-black/80 top-[5px] left-[5px] rounded-xl z-40"></div>

            {projects && projects.map((project, idx) =>
                <div className={`${idx === currentView ? 'grid' : 'hidden'} ${isReplacing ? 'scale-0' : 'scale-100'} grid-cols-8 transition-all duration-1000 md:pt-32 h-full`} key={project.title}>
                    <div className="col-span-8 md:col-span-3 lg:col-span-2 flex flex-col gap-2">
                        {idx === currentView && <video src={project.video} className="md:hidden " autoPlay loop onClick={() => router.push(project.src)}>
                        </video>}
                        <div className="pl-6 md:pt-20">
                            <h1 className={`text-[2.5rem] ${idx === 0 ? 'text-end mr-2' : 'ml-2'} my-4 ${fredoka.className}`}>{project.title}</h1>
                            {project.description.map((line, idx) => <h2 key={idx} className="lg:text-lg">{line}</h2>)}
                        </div>

                        <div id="toggle-display" className="hidden lg:flex relative mt-10 ml-[30%] w-32 h-12 bg-white/20 rounded-full items-center justify-between p-3 cursor-pointer" onClick={() => setWideScreen(!wideScreen)}>
                            <Smartphone className="w-6 h-6" />
                            <Tv2 className="w-6 h-6" />
                            <div className={`absolute ${wideScreen ? 'left-[84px]' : 'left-[4px]'} transition-all duration-200 w-10 h-10 rounded-full bg-white/20`}></div>
                        </div>
                    </div>
                    <div className={`hidden md:block md:col-span-5 lg:col-span-6 justify-self-center relative opacity-90 shadow-xl shadow-white/30 scale-y-[0.7] scale-x-[0.8]
                                    ${wideScreen ? 'w-[380px] rounded-[3rem] lg:w-full lg:max-w-5xl lg:rounded-2xl rotate-3 -skew-x-3' : 'w-[380px] rounded-[3rem] -rotate-12 -ml-40 skew-y-1'} 
                                    ${project.title === 'Finerr' ? 'h-[700px]' : 'h-[780px]'}`}>
                        <div className={`absolute top-3 left-3 bg-black/70 w-full h-full -z-10 ${wideScreen ? 'rounded-[3rem] lg:rounded-2xl' : 'rounded-[3rem]'}`}></div>
                        {isLoading && <div className={`absolute w-full h-full bg-black border-[20px] border-black ${wideScreen ? 'rounded-[3rem] lg:rounded-2xl' : 'rounded-[3rem]'} flex items-center justify-center overflow-hidden`}>
                            <Loader />
                        </div>}
                        <iframe src={project.src} onLoad={onLoad} className={`w-full h-full border-[20px] border-black bg-white ${wideScreen ? 'rounded-[3rem] lg:rounded-2xl' : 'rounded-[3rem]'}`}></iframe>
                    </div>
                    <Link href={project.src} target="_blank"
                        className="md:hidden absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/10 text-center rounded-full p-3 w-60">Open in a new tab</Link>
                </div>)}
            <div id="desktop-guid" className="hidden md:block">
                <WheelGuid guidDisplay={guidDisplay} />
            </div>
            <div id="swipe-guid" className={`md:hidden absolute bottom-0 w-full h-1/2 flex flex-col items-center justify-center gap-3 text-white ${fadeOut && 'animate-[opacity_1s_linear] opacity-0 pointer-events-none'} overflow-hidden`}>
                <div className="absolute w-[600px] h-[600px] rounded-full bg-black/50 -bottom-1/2"></div>
                <Image src={'https://www.svgrepo.com/show/409931/swipe-right.svg'} alt="swipe" width={40} height={40} className="opacity-100 animate-swipeDown invert z-50" />
                <h1 className="z-50 text-2xl">Swipe to see more..</h1>
            </div>
        </div>
    )
}