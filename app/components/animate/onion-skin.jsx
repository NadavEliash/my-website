import { useEffect, useRef, useState } from "react"

export default function OnionSkin({
    onionSkin,
    currentFrameIdx,
    canvasSize,
    loadImage,
}) {
    const canvasRef = useRef()
    const [context, setContext] = useState(null)

    // drawFrmae is defined below; a ref lets the onionSkin effect call it without it being a dep
    const drawFrmaeRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.width = canvasSize.width
        canvas.height = canvasSize.height
        setContext(canvas.getContext('2d'))
    }, [canvasSize.width, canvasSize.height])

    useEffect(() => {
        if (canvasRef.current) {
            const newContext = canvasRef.current.getContext('2d')
            newContext.clearRect(0, 0, canvasSize.width, canvasSize.height)
            if (onionSkin[0].layers && onionSkin[0].layers.length) {
                drawFrmaeRef.current(newContext, onionSkin[0].layers)
            }
        }
    }, [onionSkin, canvasSize.width, canvasSize.height])

    useEffect(() => {
        if (currentFrameIdx === 0) {
            const newContext = canvasRef.current.getContext('2d')
            newContext.clearRect(0, 0, canvasSize.width, canvasSize.height)
        }
    }, [currentFrameIdx, canvasSize.width, canvasSize.height])

    const drawFrmae = async (ctx, layers) => {
        const newContext = canvasRef.current.getContext('2d')
        for (let i = 1; i < layers.length; i++) {
            drawLayer(newContext, layers[i].drawingActions)
        }
    }
    drawFrmaeRef.current = drawFrmae

    const drawLayer = async (ctx, actions) => {
        for (const action of actions) {
            try {
                const image = await loadImage(action.url)
                ctx.drawImage(image, 0, 0)
            } catch (error) {
                console.error('Error loading image', error)
            }
            if (!action.isPath) {
                break
            }
        }
    }

    return (
        <canvas
            ref={canvasRef}
            className='absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[100%] md:w-fit rounded-md pointer-events-none z-10 opacity-20'
        />)
}