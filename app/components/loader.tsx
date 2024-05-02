'use client'

export default function Loader() {
    return (
        <div className="flex flex-col gap-6 flex-wrap">
            <div className="flex gap-6">
                <div className="w-10 h-10 rounded-lg bg-white animate-[pulse_1.5s_ease-in-out_infinite]"></div>
                <div className="w-10 h-10 rounded-lg bg-white animate-[pulse_1.2s_ease-in-out_infinite]"></div>
                <div className="w-10 h-10 rounded-lg bg-white animate-[pulse_1.7s_ease-in-out_infinite]"></div>
            </div>
            <div className="flex gap-6">
                <div className="w-10 h-10 rounded-lg bg-white animate-[pulse_1.1s_ease-in-out_infinite]"></div>
                <div className="w-10 h-10 rounded-lg bg-white animate-[pulse_1.4s_ease-in-out_infinite]"></div>
                <div className="w-10 h-10 rounded-lg bg-white animate-[pulse_1.5s_ease-in-out_infinite]"></div>
            </div>
            <div className="flex gap-6">
                <div className="w-10 h-10 rounded-lg bg-white animate-[pulse_1.9s_ease-in-out_infinite]"></div>
                <div className="w-10 h-10 rounded-lg bg-white animate-[pulse_1.3s_ease-in-out_infinite]"></div>
                <div className="w-10 h-10 rounded-lg bg-white animate-[pulse_1.6s_ease-in-out_infinite]"></div>
            </div>
        </div>
    )
}

{/* RUNNING MOUSE ANIMATION

    <div className="absolute -left-60 w-40 h-20 border-b-[4px] rounded-full flex gap-1 animate-slide">
        <div className="absolute bg-white w-[60px] h-[30px] right-0 -bottom-3 rounded-full flex justify-end p-2">
            <div className="w-2 h-2 bg-black rounded-full z-10"></div>
            <div className="absolute bg-white h-8 w-3 rounded-full left-8 bottom-5 rotate-[-20deg]"></div>
            <div className="absolute bg-white h-8 w-2 rounded-full left-12 bottom-5 rotate-[20deg]"></div>
        </div>
    </div> */}