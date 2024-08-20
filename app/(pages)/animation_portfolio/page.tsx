'use client'

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

import { ChevronLeft, ChevronRight, Info, Minus, Pause, Play, Plus, ToggleLeft, Volume1, Volume2, VolumeX } from "lucide-react"
import no_signal from "../../assets/no-signal.gif"

const works = [
    {
        title: 'Cut-Out animation I made for NGO, which struggling BDS campaign',
        src: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1714028561/final_03_hvpkng.mp4'
    },
    {
        title: '2D animation and Motion graphics I made for association which contribute the money received from Lulav sales',
        src: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1714029250/lulav_pvnno5.mp4'
    },
    {
        title: 'Stop motion style animation I made as part of a new feature testing',
        src: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1714028123/patiesserie_s3tcjm.mp4'
    },
    {
        title: '3D modeling, shading, animation and render of Dolphins.',
        src: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1714028401/dolphins_hjaeae.mp4'
    },
    {
        title: 'Collection of my 3D animation, includes shots from international series in which I took part',
        src: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1714038408/3Dcharacters_fjog4n.mp4'
    },
    {
        title: 'Movie clip I made for an election conference which led by the "Israel Hayom" newspaper',
        src: 'https://res.cloudinary.com/dnvbfkgsb/video/upload/v1714039619/%D7%A1%D7%92%D7%99%D7%A8_%D7%A2%D7%9D_%D7%A1%D7%90%D7%95%D7%A0%D7%93_02_ib0k1g.mp4'
    },
]

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

    const updateCurrent = (diff: number) => {
        setIsLoad(false)
        setIsInfo(true)

        diff === 1
            ? setCurrent(current < works.length - 1 ? current + 1 : 1)
            : setCurrent(current > 1 ? current - 1 : works.length - 1)
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

    const optionButtonsClass = "hidden 2xl:block cursor-pointer w-8 h-8 bg-white/20 rounded-full p-2"
    return (
        <div className="flex flex-col 2xl:flex-row items-center lg:justify-center w-full h-svh md:gap-10 2xl:gap-40">
            <div id="tv" className="border-gray-700 relative w-full bg-white/60
            md:mt-16 lg:bg-gray-700 lg:mt-0 lg:rounded-3xl lg:w-[900px] lg:max-w-[90%] lg:border-[10px] lg:border-r-[100px]">
                <div className="hidden lg:block">
                    <div className="absolute bg-gray-400 w-20 h-20 -top-12 left-1/2 -translate-x-1/2 rounded-full -z-10"></div>
                    <div className="absolute bg-gray-500 w-2 h-32 rotate-[60deg] -top-[120px] left-1/2 translate-x-[50px] -z-20"></div>
                    <div className="absolute bg-gray-500 w-2 h-32 -rotate-[60deg] -top-[120px] left-1/2 -translate-x-[60px] -z-20"></div>
                    <div className="absolute w-8 h-8 bg-pink-800 border-black border-2 rounded-2xl -right-[65px] bottom-2"></div>
                    <div className="absolute  -right-[65px] top-20 flex flex-col gap-4">
                        <div className="w-8 h-5 bg-blue-200 border-2 rounded-xl"></div>
                        <div className="w-8 h-5 bg-blue-600 border-2 rounded-xl"></div>
                        <div className="w-8 h-5 bg-indigo-700 border-2 rounded-xl"></div>
                        <div className="w-8 h-5 bg-violet-700 border-2 rounded-xl"></div>
                        <div className="w-8 h-5 bg-purple-400 border-2 rounded-xl"></div>
                    </div>
                </div>
                {!isLoad && <Image src={no_signal} alt="no-signal" className="w-full border-black lg:border-4 lg:rounded-2xl z-10" priority />}
                <video loop ref={videoRef} src={works[current].src}
                    className={`${isLoad ? 'block' : 'hidden'} border-black w-full lg:border-4 lg:rounded-2xl lg:h-auto`}
                    onCanPlayThrough={playVideo}
                    onPointerDown={togglePlay} />
                <div className="absolute right-6 top-4 z-10">
                    {volume === 0
                        ? <Volume2 className={`cursor-pointer w-8 h-8 text-black`} onClick={() => { ToggleVolume(+5) }} />
                        : <VolumeX className={`cursor-pointer w-8 h-8 text-black`} onClick={() => { ToggleVolume(0) }} />}
                </div>
                <div className="hidden md:block absolute bottom-40 w-full h-[70%] pointer-events-none">
                    {showVolume && volumeDashes.length > 0 &&
                        <div className="absolute right-6 bottom-0 flex flex-col gap-1 items-center justify-end">
                            {volumeDashes.map(dash =>
                                <div key={dash} className="w-8 h-3 bg-blue-900/90"></div>
                            )}
                            <h1 className="text-blue-900/90 font-bold text-center text-xl">VOL</h1>
                        </div>}
                </div>
                <div id="info" className="hidden md:block absolute md:-bottom-1 lg:bottom-1 lg:rounded-b-xl h-32 w-full overflow-hidden">
                    {isInfo && isLoad && <div className="absolute bottom-0 h-24 w-full bg-black/80 py-3 animate-slideUp">
                        <h1 className="my-2 mx-6 text-xl">{works[current].title}</h1>
                    </div>}
                    {!isInfo && <div className="absolute -bottom-24 h-24 w-full bg-black/80 py-3 animate-slideDown">
                        <h1 className="my-2 mx-6 text-xl">{works[current].title}</h1>
                    </div>}
                </div>
                {isLoad && <div id="mobile-info" className="md:hidden absolute -bottom-24 translate-y-full w-full">
                    <h1 className="my-2 mx-2 text-lg text-center">{works[current].title}</h1>
                </div>}
            </div>

            <div id="remote" className="relative flex flex-col items-center p-6 w-full bg-black/50
            md:rounded-full md:shadow-inner md:shadow-white/60 md:max-w-[500px] overflow-hidden
            2xl:rounded-[70px] 2xl:gap-4 2xl:-rotate-[9deg] 2xl:flex-col 2xl:py-8 2xl:w-[240px]">
                <div className="2xl:relative rounded-full 2xl:bg-white/20 2xl:shadow-inner shadow-white/40
                 2xl:grid 2xl:grid-cols-3 2xl:grid-rows-3 2xl:gap-10 2xl:items-center 2xl:justify-items-center 2xl:p-2">
                    <ChevronLeft className={`${optionButtonsClass} row-start-2`} onClick={() => updateCurrent(-1)} />
                    <ChevronRight className={`${optionButtonsClass} row-start-2 col-start-3`} onClick={() => updateCurrent(+1)} />

                    <div className={`absolute left-1/2 top-1 -translate-x-1/2 rounded-full cursor-pointer active:bg-white/50 border-black p-3 w-16 h-16 mr-2 bg-white/20 my-2
                    2xl:top-1/2 2xl:-translate-y-1/2 2xl:m-0 2xl:border-4 2xl:w-24 2xl:h-24 2xl:p-5`}
                        onClick={togglePlay}>
                        {isPlay
                            ? <Pause className="w-full h-full" />
                            : <Play className="w-full h-full" />}
                    </div>
                    <Minus className={`${optionButtonsClass} row-start-3 col-start-2`} onClick={() => ToggleVolume(-1)} />
                    <Plus className={`${optionButtonsClass} col-start-2`} onClick={() => ToggleVolume(1)} />
                </div>

                <div className="flex gap-24 md:gap-3 items-center">
                    <div className="bg-white/20 rounded-full flex 2xl:flex-col items-center justify-center h-[44px] w-32 2xl:h-fit 2xl:w-12 p-2 gap-5 2xl:shadow-inner shadow-white/40">
                        <Plus className="cursor-pointer w-4 h-4" onClick={() => ToggleVolume(1)} />
                        <div className="text-center 2xl:my-3">VOL</div>
                        <Minus className="cursor-pointer w-4 h-4" onClick={() => ToggleVolume(-1)} />
                    </div>

                    <div className="2xl:bg-white/10 shadow-white/40 rounded-full hidden md:flex flex-row-reverse items-center justify-center h-[44px] gap-24 p-4 2xl:gap-12 2xl:shadow-inner 2xl:flex-col 2xl:w-12 2xl:h-fit">
                        <Info className="w-8 h-8 cursor-pointer" onClick={() => { setIsInfo(!isInfo) }} />
                        <VolumeX className="w-6 h-6 cursor-pointer" onClick={() => { ToggleVolume(0) }} />
                    </div>

                    <div className="bg-white/20 rounded-full flex flex-row-reverse 2xl:flex-col items-center justify-center h-[44px] w-32 2xl:w-12 2xl:h-fit p-2 gap-5 2xl:shadow-inner shadow-white/40">
                        <Plus className="cursor-pointer w-4 h-4" onClick={() => updateCurrent(+1)} />
                        <div className="text-center 2xl:my-3">CH</div>
                        <Minus className="cursor-pointer w-4 h-4" onClick={() => updateCurrent(-1)} />
                    </div>
                </div>
            </div>
        </div>
    )
}