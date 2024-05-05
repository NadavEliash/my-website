'use client'

import { ChevronLeft, ChevronRight, Info, Minus, Pause, Play, Plus, ToggleLeft, Volume1, Volume2, VolumeX } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import no_signal from "../../assets/no-signal.gif"
import Image from "next/image"

export default function Portfolio() {
    const videoRef = useRef<any>(null)

    const [current, setCurrent] = useState(0)
    const [isLoad, setIsLoad] = useState(false)
    const [isPlay, setIsPlay] = useState(true)
    const [isInfo, setIsInfo] = useState(true)
    const [volume, setVolume] = useState(0)
    const [volumeDashes, setVolumeDashes] = useState<number[]>([])
    const [showVolume, setShowVolume] = useState(false)

    useEffect(() => {
        setTimeout(() => {
            setIsLoad(true)
            if (videoRef.current) videoRef.current.play()
        }, 500);
    }, [])

    useEffect(() => {
        videoRef.current.volume = volume
        setVolumeDashes([...Array(Math.round(volume * 10)).keys()])

        setShowVolume(true)

        setTimeout(() => {
            setShowVolume(false)
        }, 4000)

    }, [volume])

    useEffect(() => {
        if (isInfo) {
            setTimeout(() => {
                setIsInfo(false)
            }, 4000);
        }
    }, [isInfo])

    const works = [
        {
            title: 'Cut-Out animation I made for "Miluimnikim" NGO, struggling BDS campaign',
            src: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1714028561/final_03_hvpkng.mp4'
        },
        {
            title: '2D animation combine with Motion graphic video I made for association which contribute the money received from Lulav sales',
            src: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1714029250/lulav_pvnno5.mp4'
        },
        {
            title: 'Stop motion style animation I made as part of a new feature testing',
            src: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1714028123/patiesserie_s3tcjm.mp4'
        },
        {
            title: '3D animation of Dolphins',
            src: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1714028401/dolphins_hjaeae.mp4'
        },
        {
            title: 'Collection of my 3D animation, includes shots from series in which I took part',
            src: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1714038408/3Dcharacters_fjog4n.mp4'
        },
        {
            title: 'Movie clip I made for an election conference which led by the "Israel Hayom" newspaper',
            src: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1714039619/%D7%A1%D7%92%D7%99%D7%A8_%D7%A2%D7%9D_%D7%A1%D7%90%D7%95%D7%A0%D7%93_02_ib0k1g.mp4'
        },
    ]

    const updateCurrent = (diff: number) => {
        setIsLoad(false)
        setIsInfo(true)

        diff === 1
            ? setCurrent(current < works.length - 1 ? current + 1 : 0)
            : setCurrent(current > 0 ? current - 1 : works.length - 1)
    }

    const playVideo = () => {
        if (videoRef.current) {
            setTimeout(() => {
                setIsLoad(true)
                setIsPlay(true)
                if (videoRef.current) videoRef.current.play()
            }, 200)
        }
    }

    const togglePlay = () => {
        if (videoRef.current) {
            setIsPlay(!isPlay)
            isPlay ? videoRef.current.pause() : videoRef.current.play()
        }
    }

    const ToggleVolume = (value: number) => {
        if (value > 0) setVolume(volume + 0.1 > 1 ? 1 : volume + 0.1 * value)
        else if (value < 0) setVolume(volume - 0.1 < 0 ? 0 : volume - 0.1)
        else setVolume(0)
    }

    const optionButtonsClass = "cursor-pointer w-8 h-8 bg-white/20 rounded-full p-2"
    return (
        <div className="md:mt-[50lvh] md:-translate-y-1/2 mx-auto flex flex-wrap flex-row items-center justify-between md:w-10/12">
            <div id="remote" className="hidden md:flex w-[240px] py-16 bg-black/50 rounded-lg flex-col items-center gap-10 rotate-6 -skew-x-3 shadow-inner shadow-white/60">
                <div className="relative grid grid-cols-3 grid-rows-3 gap-10 p-2 rounded-full items-center justify-items-center bg-white/20 shadow-inner shadow-white/40">
                    <Plus className={`${optionButtonsClass} col-start-2`} onClick={() => ToggleVolume(1)} />
                    <ChevronLeft className={`${optionButtonsClass} row-start-2`} onClick={() => updateCurrent(-1)} />
                    <div className={`absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 rounded-full w-24 h-24 p-5 cursor-pointer active:bg-white/20 border-4 border-black`} onClick={togglePlay}>
                        {isPlay
                            ? <Pause className="w-full h-full" />
                            : <Play className="w-full h-full" />}
                    </div>
                    <ChevronRight className={`${optionButtonsClass} row-start-2 col-start-3`} onClick={() => updateCurrent(+1)} />
                    <Minus className={`${optionButtonsClass} row-start-3 col-start-2`} onClick={() => ToggleVolume(-1)} />
                </div>
                <div className="w-3/4 flex justify-between">
                    <div className="bg-white/20 rounded-full flex-col items-center justify-center p-2 gap-5 shadow-inner shadow-white/40">
                        <Plus className="cursor-pointer" onClick={() => ToggleVolume(1)} />
                        <div className="text-center my-3">VOL</div>
                        <Minus className="cursor-pointer" onClick={() => ToggleVolume(-1)} />
                    </div>
                    <div className="flex flex-col justify-between p-2">
                        <VolumeX className="bg-white/20 w-10 h-10 rounded-full p-2 shadow-inner shadow-white/40 cursor-pointer" onClick={() => { ToggleVolume(0) }} />
                        <Info className="bg-white/20 w-10 h-10 rounded-full p-2 shadow-inner shadow-white/40 cursor-pointer" onClick={() => { setIsInfo(!isInfo) }} />
                    </div>
                    <div className="bg-white/20 rounded-full flex-col items-center justify-center p-2 gap-5 shadow-inner shadow-white/40">
                        <Plus className="cursor-pointer" onClick={() => updateCurrent(+1)} />
                        <div className="text-center my-3">CH</div>
                        <Minus className="cursor-pointer" onClick={() => updateCurrent(-1)} />
                    </div>
                </div>
            </div>
            <div id="tv" className="relative w-[900px] md:h-[470px] max-w-[2/3vw] rounded-3xl md:border-[10px] md:border-r-[100px] border-gray-700 bg-gray-700">
                <div className="hidden md:block">
                    <div className="absolute bg-gray-400 w-20 h-20 -top-12 left-1/2 -translate-x-1/2 rounded-full -z-10"></div>
                    <div className="absolute bg-gray-500 w-2 h-80 rotate-[60deg] -top-[200px] left-1/2 translate-x-[50px] -z-20"></div>
                    <div className="absolute bg-gray-500 w-2 h-80 -rotate-[60deg] -top-[200px] left-1/2 -translate-x-[50px] -z-20"></div>
                    <div className="absolute w-8 h-8 bg-pink-800 border-black border-2 rounded-2xl -right-[65px] bottom-2"></div>
                    <div className="absolute  -right-[65px] top-20 flex flex-col gap-4">
                        <div className="w-8 h-5 bg-blue-200 border-2 rounded-xl"></div>
                        <div className="w-8 h-5 bg-blue-600 border-2 rounded-xl"></div>
                        <div className="w-8 h-5 bg-indigo-700 border-2 rounded-xl"></div>
                        <div className="w-8 h-5 bg-violet-700 border-2 rounded-xl"></div>
                        <div className="w-8 h-5 bg-purple-400 border-2 rounded-xl"></div>
                    </div>
                </div>
                {!isLoad && <Image src={no_signal} alt="no-signal" className="absolute w-full border-black md:border-4 md:rounded-2xl z-10" priority={true} />}
                <video loop ref={videoRef} src={works[current].src}
                    className="border-black md:border-4 md:rounded-2xl"
                    onCanPlayThrough={playVideo}
                    onPointerDown={togglePlay} />
                <div className="absolute right-6 top-6 z-10">
                    {volume === 0
                        ? <Volume2 className={`cursor-pointer w-8 h-8 text-black`} onClick={() => { ToggleVolume(+5) }} />
                        : <VolumeX className={`cursor-pointer w-8 h-8 text-black`} onClick={() => { ToggleVolume(0) }} />}
                </div>
                <div className="md:hidden w-full bg-black">
                    <ChevronLeft className="absolute left-2 top-1/2 w-8 h-8 text-black/70" onClick={() => updateCurrent(-1)}/>
                    <ChevronRight className="absolute right-2 top-1/2 w-8 h-8 text-black/70" onClick={() => updateCurrent(+1)}/>
                </div>
                <div className="absolute bottom-40 w-full h-[70%] pointer-events-none">
                    {showVolume && volumeDashes.length > 0 &&
                        <div className="absolute right-6 bottom-0 flex flex-col gap-1 items-center justify-end">
                            {volumeDashes.map(dash =>
                                <div key={dash} className="w-8 h-3 bg-blue-900/90"></div>
                            )}
                            <h1 className="text-blue-900/90 font-bold text-center text-xl">VOL</h1>
                        </div>}
                </div>
                <div id="info" className="hidden md:block absolute bottom-1 rounded-b-[1.3rem] h-32 w-full overflow-hidden">
                    {isInfo && <div className="absolute bottom-0 h-24 w-full bg-black/80 py-3 animate-slideUp">
                        <h1 className="my-2 mx-6 text-xl">{works[current].title}</h1>
                    </div>}
                    {!isInfo && <div className="absolute -bottom-24 h-24 w-full bg-black/80 py-3 animate-slideDown">
                        <h1 className="my-2 mx-6 text-xl">{works[current].title}</h1>
                    </div>}
                </div>
            </div>
            <div className="md:hidden">
                <h1 className="my-2 mx-6 text-lg">{works[current].title}</h1>
            </div>
        </div>
    )
}