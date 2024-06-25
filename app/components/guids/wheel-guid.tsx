'use client'

import { Sue_Ellen_Francisco } from 'next/font/google'
import { useEffect, useState } from 'react'

const sue_ellen = Sue_Ellen_Francisco({ subsets: ['latin'], weight: '400' })

interface WheelGuidProps {
    guidDisplay: boolean
}

export default function WheelGuid({
    guidDisplay
}: WheelGuidProps) {

    const [hidden, setHidden] = useState(false)

    useEffect(() => {
        if (!guidDisplay) {
            setHidden(true)
        }
    }, [guidDisplay])

    return (
        <div className={`absolute w-[100vw] h-[100svh] top-0 left-0 bg-black/20 ${hidden ? 'pointer-events-none animate-opacity opacity-0 overflow-hidden' : ''}`}>
            <div className='absolute right-0 top-0 rounded-es-full bg-white/30 w-[600px] h-1/2 flex flex-col overflow-hidden'>
                <div className='flex px-16 py-6'>
                    <h1 className={`${sue_ellen.className} text-[2rem] tracking-wider`}>Use the wheel to navigate</h1>
                    <div className='animate-bounce'>
                        <img src="/arrow.png" alt="arrow" className="w-32 ml-6 mt-4" />
                    </div>
                </div>
                <div className="w-[180px] h-[300px] rotate-[-25deg] ml-[50%] mt-2">
                    <div className="bg-white/90 w-full h-full rounded-t-[100px] rounded-b-[90px] p-2 shadow-2xl shadow-black">
                        <div className="bg-black/20 mx-auto w-8 h-20 rounded-3xl overflow-hidden">
                            <div className='w-8 h-28 flex flex-col items-center justify-between p-2 animate-bounce'>
                                <div className="border-black/60 border-t-2 w-10/12"></div>
                                <div className="border-black/60 border-t-2 w-10/12"></div>
                                <div className="border-black/60 border-t-2 w-10/12"></div>
                                <div className="border-black/60 border-t-2 w-10/12"></div>
                                <div className="border-black/60 border-t-2 w-10/12"></div>
                                <div className="border-black/60 border-t-2 w-10/12"></div>
                                <div className="border-black/60 border-t-2 w-10/12"></div>
                                <div className="border-black/60 border-t-2 w-10/12"></div>
                                <div className="border-black/60 border-t-2 w-10/12"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}