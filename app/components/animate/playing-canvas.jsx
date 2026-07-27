import { useEffect, useRef, useState } from "react"

export default function PlayingCanvas({
    isPlay,
    isDownload,
    setIsDownload,
    frames,
    canvasSize,
    background,
    loadImage
}) {
    const canvasRef = useRef(null)
    const [context, setContext] = useState(null)

    // these persist across renders (a plain `let` would reset every render — the lint warning)
    const frameIdxRef = useRef(0)
    const mediaRecorderRef = useRef(null)
    // latest-value refs so the play/download intervals read fresh values without re-subscribing
    const framesRef = useRef(frames); framesRef.current = frames
    const drawFrameRef = useRef(null)
    const recordVideoRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.width = canvasSize.width
        canvas.height = canvasSize.height
        setContext(canvas.getContext('2d'))
    }, [canvasSize.width, canvasSize.height])

    useEffect(() => {
        if (isPlay && !isDownload) {
            frameIdxRef.current = 0
            const id = setInterval(() => {
                const frames = framesRef.current
                frameIdxRef.current < frames.length ? frameIdxRef.current++ : frameIdxRef.current = 0
                drawFrameRef.current(frames[frameIdxRef.current])
            }, 83.33)

            return () => {
                clearInterval(id)
            }
        }
    }, [isPlay, isDownload])

    useEffect(() => {
        if (!isPlay && isDownload) {
            recordVideoRef.current()
            frameIdxRef.current = 0
            const id = setInterval(() => {
                const frames = framesRef.current
                if (frameIdxRef.current < frames.length) {
                    drawFrameRef.current(frames[frameIdxRef.current])
                    frameIdxRef.current++
                } else {
                    clearInterval(id)
                    mediaRecorderRef.current.stop()
                }
            }, 83.33)

            return () => {
                clearInterval(id)
            }
        }
    }, [isPlay, isDownload])

    const drawFrame = (frame) => {
        const newContext = canvasRef.current.getContext('2d')
        if (frame?.imageData) {
            newContext.putImageData(frame.imageData, 0, 0)
        } else if (frame && !frame.imageData) {
            newContext.fillStyle = background
            newContext.fillRect(0, 0, canvasSize.width, canvasSize.height)
        }
    }

    const recordVideo = () => {
        if (isDownload) {
            const videoStream = canvasRef.current.captureStream(30)
            const mediaRecorder = new MediaRecorder(videoStream)
            mediaRecorderRef.current = mediaRecorder
            let chunks = []
            let videoURL

            mediaRecorder.ondataavailable = (e) => {
                chunks.push(e.data)
            }

            mediaRecorder.onstop = (e) => {
                const blob = new Blob(chunks, { 'type': 'video/mp4' })
                videoURL = URL.createObjectURL(blob)
                download(videoURL)
            }

            mediaRecorder.start()

            const download = (dataURL) => {
                const link = document.createElement('a')
                link.href = dataURL
                link.download = "online-animation.mp4"
                link.click()
                setIsDownload(false)
            }
        }
    }

    drawFrameRef.current = drawFrame
    recordVideoRef.current = recordVideo

    return (
        <canvas ref={canvasRef} width={500} height={500}
            className='absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[100%] md:w-fit rounded-md pointer-events-none z-20'>
        </canvas>
    )
}