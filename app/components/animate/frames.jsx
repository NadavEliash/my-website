import { useEffect, useState } from 'react';
import Frame from '../../components/animate/frame'
import { ChevronLeft, ChevronRight, CopyPlus, Download, Pause, Play, Save, SquareMinusIcon, SquarePlus, Trash } from "lucide-react";

export default function Frames({
    frames,
    setFrames,
    images,
    setImages,
    currentFrameIdx,
    setCurrentFrameIdx,
    canvasSize,
    background,
    clearCanvas,
    generateId,
    loadImage,
    isPlay,
    toggleAnimation,
    download,
    showBar
}) {

    const [mobileDisplay, setMobileDisplay] = useState(false)

    useEffect(() => {
        showBar === "frames" ? setMobileDisplay(true) : setMobileDisplay(false)
    }, [showBar])

    const addFrame = () => {
        const newFrame = { id: generateId(), layers: [{ id: generateId(), drawingActions: [] }, { id: generateId(), drawingActions: [] }] }
        frames.splice(currentFrameIdx + 1, 0, newFrame)
        setFrames(prev => [...prev])
        setCurrentFrameIdx(currentFrameIdx + 1)
    }

    const switchFrame = (toFrame) => {
        let newCurrentFrameIdx

        if (toFrame === 'left') {
            if (currentFrameIdx === 0) return
            newCurrentFrameIdx = currentFrameIdx - 1
        } else if (toFrame === 'right') {
            if (currentFrameIdx === frames.length - 1) return
            newCurrentFrameIdx = currentFrameIdx + 1
        } else {
            newCurrentFrameIdx = toFrame
        }
        setCurrentFrameIdx(newCurrentFrameIdx)
    }

    const removeFrame = () => {
        if (!frames.length) {
            return
        } else if (frames.length === 1) {
            clearAll()
        } else {
            frames.splice(currentFrameIdx, 1)
            setFrames(prev => [...prev])
            setCurrentFrameIdx(currentFrameIdx > 0 ? currentFrameIdx - 1 : 0)
        }
    }

    const duplicateFrame = () => {
        const newFrame = { id: generateId(), layers: frames[currentFrameIdx].layers }
        frames.splice(currentFrameIdx, 0, newFrame)
        setFrames(prev => [...prev])
        switchFrame('right')
    }

    const clearAll = () => {
        setFrames([{ id: generateId(), layers: [{ id: generateId(), drawingActions: [] }, { id: generateId(), drawingActions: [] }] }])
        setCurrentFrameIdx(0)
        clearCanvas()
    }

    const framesButtonClass = "w-6 h-6 cursor-pointer hover:scale-110 text-black md:text-inherit"

    return (
        <div id="frames-bar" className={`absolute md:static ${mobileDisplay ? 'bottom-2' : '-bottom-[250px]'} transition-all duration-700 left-1/2 -translate-x-1/2 
        md:translate-x-0 md:max-w-[820px] lg:max-w-[1120px] flex flex-col gap-1 md:mx-auto z-20`}>
            <div id="frames-buttons" className="w-full bg-white/10 py-2 mt-4 text-white/70 flex gap-6 items-center rounded-t-2xl justify-center">
                <div title="Add a blank frame" className={framesButtonClass} onClick={addFrame}>
                    <SquarePlus />
                </div>
                <div title="Duplicate frame" className={framesButtonClass} onClick={duplicateFrame} >
                    <CopyPlus />
                </div>
                <div title="Remove frame" className={framesButtonClass} onClick={removeFrame}>
                    <SquareMinusIcon />
                </div>
                <div title="Clear scene" className={`${framesButtonClass} md:bg-red-500/70 rounded-full w-8 h-8 text-black/70 flex items-center justify-center`} onClick={clearAll}>
                    <Trash className='w-5 h-5' />
                </div>
                <div id='animation-options' className='flex gap-6 items-center justify-center'>
                    <div title="Play / Pause" className={framesButtonClass} onClick={toggleAnimation}>
                        {isPlay ? <Pause /> : <Play />}
                    </div>
                    <div title="Download" className={framesButtonClass} onClick={download}>
                        <Download />
                    </div>
                    <div title="Save" className={framesButtonClass}>
                        <Save />
                    </div>
                </div>
            </div>
            <div id="frames-container" className="w-full h-36 md:bg-white/10 p-4 flex gap-2 items-center justify-center rounded-b-2xl">
                <div className="hidden md:flex w-8 py-4 mt-2 bg-slate-950 rounded-lg self-start" onClick={() => switchFrame('left')}>
                    <ChevronLeft className="w-10 h-10 text-white cursor-pointer" />
                </div>
                <div id="frames" className="flex-1 gap-2 md:gap-4 flex overflow-x-auto justify-start p-2">
                    {frames.length &&
                        frames.map((frame, idx) =>
                            <Frame key={idx}
                                frames={frames}
                                setFrames={setFrames}
                                frame={frame}
                                idx={idx}
                                currentFrameIdx={currentFrameIdx}
                                canvasSize={canvasSize}
                                switchFrame={switchFrame}
                                background={background}
                                loadImage={loadImage}
                                images={images}
                                setImages={setImages}
                            />)}
                </div>
                <div className="hidden md:flex w-8 py-4 mt-2 bg-slate-950 rounded-lg self-start justify-center" onClick={() => switchFrame('right')}><ChevronRight className="w-10 h-10 text-white cursor-pointer" /></div>
            </div>
        </div>
    )
}