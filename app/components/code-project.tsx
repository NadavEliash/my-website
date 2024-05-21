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
        }, 1000);
    }


    return (
        <div className={`grid grid-cols-8 transition-all duration-1000 md:pt-32 h-full ${fredoka.className}`}>
            <div className="col-span-8 md:col-span-3 lg:col-span-2 flex flex-col gap-2 md:justify-center">
                <video src={project.video} className="md:hidden " autoPlay loop onClick={() => router.push(project.src)}>
                </video>
                <div className="ml-6">
                    <h1 className={`text-[2.5rem] 'ml-2 my-4 ${fredoka.className}`}>{project.title}</h1>
                    {project.subTitle && <h2>{project.subTitle}</h2>}
                    {project.description.map((line: string, idx: number) => <h2 key={idx} className="lg:text-lg">{line}</h2>)}
                    <div id="buttons" className=" flex flex-col gap-2">
                        <div id="toggle-display" className="hidden lg:flex relative mt-10 w-32 h-12 bg-white/20 rounded-full items-center justify-between p-3 cursor-pointer" onClick={() => setWideScreen(!wideScreen)}>
                            <Smartphone className="w-6 h-6" />
                            <Tv2 className="w-6 h-6" />
                            <div className={`absolute ${wideScreen ? 'left-[84px]' : 'left-[4px]'} transition-all duration-200 w-10 h-10 rounded-full bg-white/20`}></div>
                        </div>

                        <Link href={project.repo} className="flex items-center justify-between gap-4 w-32 bg-white/20 hover:bg-white/30 p-1 rounded-full cursor-pointer">
                            <h1 className="pl-2">Repo</h1>
                            <Image src={"https://www.svgrepo.com/show/450156/github.svg"} alt="github" width={40} height={40}></Image>
                        </Link>

                        <Link href={project.src} target="_blank"
                            className="bg-white/10 text-center rounded-full p-3 w-fit">
                            Open in a new tab
                        </Link>
                    </div>
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

        </div>
    )
}