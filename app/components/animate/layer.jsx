import { useEffect, useRef, useState } from "react"

export default function Layer({
    layers,
    setLayers,
    layer,
    idx,
    currentLayerIdx,
    setCurrentLayerIdx,
    canvasSize,
    background,
    loadImage
}) {
    const canvasRef = useRef(null)
    const [context, setContext] = useState(null)
    const [currentLayer, setCurrentLayer] = useState(null)
    const [isDragging, setIsDragging] = useState(false)

    // latest-value refs for values the repaint effects read but shouldn't re-trigger on
    const backgroundRef = useRef(background); backgroundRef.current = background
    const layerRef = useRef(layer); layerRef.current = layer
    const drawTransparentGridRef = useRef(null)
    const drawLayerRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.width = canvasSize.width
        canvas.height = canvasSize.height
        setContext(canvas.getContext('2d'))
    }, [canvasSize.width, canvasSize.height])

    useEffect(() => {
        const newContext = canvasRef.current.getContext('2d')
        if (idx === 0) {
            newContext.fillStyle = backgroundRef.current
            newContext.fillRect(0, 0, canvasSize.width, canvasSize.height)
        } else {
            drawTransparentGridRef.current()
        }
    }, [context, idx, canvasSize.width, canvasSize.height])

    useEffect(() => {
        if (idx === 0) {
            const newContext = canvasRef.current.getContext('2d')
            newContext.fillStyle = background
            newContext.fillRect(0, 0, canvasSize.width, canvasSize.height)
        }
    }, [layers, background, idx, canvasSize.width, canvasSize.height])

    useEffect(() => {
        const newContext = canvasRef.current.getContext('2d')
        newContext.clearRect(0, 0, canvasSize.width, canvasSize.height)
        if (idx !== 0) drawTransparentGridRef.current()

        const actions = layerRef.current?.drawingActions
        if (actions && actions.length) {
            drawLayerRef.current(newContext, actions)
        }
    }, [layers, canvasSize.width, canvasSize.height, idx])

    const drawTransparentGrid = async () => {
        if (context) {
            const image = await loadImage("https://www.svgrepo.com/show/351866/chess-board.svg")
            context.globalAlpha = 0.05
            context.drawImage(image, 0, 0, canvasSize.width, canvasSize.height)
        }
    }

    const drawLayer = async (ctx, actions) => {
        for (const action of actions) {
            try {
                const image = await loadImage(action.url)
                ctx.globalAlpha = 1
                ctx.drawImage(image, 0, 0)
            } catch (error) {
                console.error('Error loading image', error)
            }
            if (!action.isPath) {
                break
            }
        }
    }

    drawTransparentGridRef.current = drawTransparentGrid
    drawLayerRef.current = drawLayer

    const onDrag = (idx) => {
        if (!isDragging) {
            setIsDragging(true)
            if (layers.length > 1) {
                setCurrentLayer(layers[idx])
                layers.splice(idx, 1)
            }
        }
    }

    const onDragEnd = (e, idx) => {
        setIsDragging(false)
        let newIdx = Math.floor(e.clientY / 100) - 1
        if (newIdx >= layers.length) newIdx = layers.length - 1
        if (newIdx < 1) newIdx = 1
        layers.splice(newIdx, 0, currentLayer)
        setLayers(prev => [...prev])
    }

    return (
        <div>
            <div key={idx} className="text-black p-1">
                <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height}
                    className={`bg-white/90 w-12 h-16 md:w-16 md:h-12 lg:w-28 lg:h-20 rounded-lg ${idx > 0 ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed'}
                                ${currentLayerIdx === idx ? 'border-4 border-pink-300 scale-105' : ''}`}
                    draggable
                    onClick={() => {
                        if (idx > 0) {
                            setCurrentLayerIdx(idx)
                        }
                    }}
                    onDrag={() => onDrag(idx)}
                    onDragEnd={(e) => onDragEnd(e, idx)}>
                </canvas>
                <h1 className="md:text-white text-sm text-center p-2">
                    {idx === 0 ? 'BG' : idx < 10 ? '0' + idx : idx}
                </h1>
            </div>
        </div>
    )
}