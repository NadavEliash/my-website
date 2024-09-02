import { Smartphone, Tv2 } from "lucide-react"
import Loader from "./loader"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Fredoka } from "next/font/google"
import { project } from "../(pages)/code_portfolio/[[...project]]/page"
import Image from "next/image"

const fredoka = Fredoka({ weight: "400", subsets: ['hebrew'] })

interface CodeProjectProps {
    project: project
}
export default function CodeProject({ project }: CodeProjectProps) {

    const router = useRouter()

    const [wideScreen, setWideScreen] = useState(true)
    const [isLoading, setIsLoading] = useState(true)

    const onLoad = () => {
        setTimeout(() => {
            setIsLoading(false)
        }, 600);
    }


    return (
        <div className={`grid grid-cols-10 transition-all duration-1000 md:pt-28 h-full max-h-[100svh] overflow-hidden ${fredoka.className}`}>
            <div className="col-span-10 md:col-start-2 md:col-end-5 flex flex-col gap-2 md:justify-start">
                <video src={project.video} className="md:hidden" autoPlay loop onClick={() => router.push(project.src)}>
                </video>
                <div className="absolute top-[38svh] md:h-[560px] sm:top-[45svh] md:static md:mt-28 flex flex-col justify-between">
                    <h1 className={`text-[2.5rem] text-center  ${fredoka.className}`}>{project.title}</h1>
                    {project.subTitle && <h2 className="mb-1 text-center">{project.subTitle}</h2>}
                    <div className="">
                        {project.description.map((line: string, idx: number) => <h2 key={idx} className="text-sm sm:text-base xl:text-lg mx-2 text-justify">{line}</h2>)}
                    </div>

                    <div id="buttons" className="flex md:flex-col gap-4 mt-6 mx-6 md:mx-10">
                        {project.params !== 'animate' && <div id="toggle-display" className="hidden group lg:flex relative w-36 h-12 bg-white/20 rounded-full items-center justify-between p-3 cursor-pointer ml-6" onClick={() => { if (project.params === 'animate') { return } else { setWideScreen(!wideScreen) } }}>
                            <Tv2 className="w-6 h-6 group-hover:w-8 transition-all duration-300" />
                            <Smartphone className="w-6 h-6 group-hover:w-8 transition-all duration-300" />
                            <div className={`absolute ${wideScreen ? 'left-[4px]' : 'left-[100px] group-hover:left-[92px]'} transition-all duration-200 w-10 group-hover:w-12 h-10 rounded-full bg-white/20`}></div>
                        </div>}
                        <Link href={project.src} target="_blank"
                            className="group bg-white/20 rounded-full p-3 w-24 hover:w-40 transition-all duration-300 relative hover:bg-white/30 overflow-hidden md:ml-24">
                            <h1 className="">Go <span className="absolute left-0 text-transparent group-hover:left-9 group-hover:text-inherit transition-all duration-400 text-nowrap">to the App</span>
                                <span className="absolute bottom-[10px] right-4 group-hover:right-3 text-3xl transition-all duration-300">»</span></h1>
                        </Link>
                        <Link href={project.repo} target="_blank"
                            className="group relative w-14 hover:w-40 transition-all duration-300 h-12 bg-white/20 hover:bg-white/30 p-1 rounded-full cursor-pointer md:ml-40">
                            <h1 className="scale-x-0 group-hover:scale-x-100 origin-left transition-all duration-300 ml-3 mt-2">Repository</h1>
                            <Image src={"https://www.svgrepo.com/show/450156/github.svg"} alt="github" width={40} height={40} className="absolute left-2 top-1 group-hover:left-28 transition-all duration-300"></Image>
                        </Link>
                    </div>
                </div>
            </div>
            <div className={`hidden md:block md:col-span-5 lg:col-span-6 justify-self-center relative opacity-90  scale-y-[0.7] scale-x-[0.8] transition-all duration-500
                                    ${wideScreen
                    ? 'w-[380px] rounded-[3rem] lg:w-full lg:max-w-5xl lg:rounded-2xl rotate-3 -skew-x-3'
                    : 'w-[380px] rounded-[3rem] -rotate-12 -ml-40 skew-y-1'}`}>
                {/* <div className={`absolute top-3 left-3 bg-black/70 w-full h-full -z-10 ${wideScreen ? 'rounded-[3rem] lg:rounded-2xl' : 'rounded-[3rem]'}`}></div> */}
                {isLoading && <div className={`absolute w-full h-full bg-black border-[20px] border-black ${wideScreen ? 'rounded-[3rem] lg:rounded-2xl' : 'rounded-[3rem]'} flex items-center justify-center overflow-hidden`}>
                    <Loader />
                </div>}
                <video src={wideScreen ? project.video : project.mobileVideo} onCanPlay={onLoad} autoPlay loop className={`hidden lg:block border-[20px] border-slate-800  ${wideScreen ? 'rounded-[3rem] lg:rounded-2xl' : 'rounded-[3rem]'} shadow-[5px_5px_rgba(0,0,0,0.4),_10px_10px_rgba(0,0,0,0.3),_15px_15px_rgba(0,0,0,0.2),_20px_20px_rgba(0,0,0,0.1),_25px_25px_rgba(0,0,0,0.1)]`}></video>
                <video src={project.mobileVideo} onCanPlay={onLoad} autoPlay loop className={`lg:hidden border-[20px] border-slate-800 h-full rounded-[3rem]`}></video>
                {/* <iframe src={project.src} onLoad={onLoad} className={`w-full h-full border-[20px] border-black bg-white ${wideScreen ? 'rounded-[3rem] lg:rounded-2xl' : 'rounded-[3rem]'}`}></iframe> */}
            </div>

        </div>
    )
}