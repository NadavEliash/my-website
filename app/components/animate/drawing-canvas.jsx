import { useEffect, useRef, useState } from "react"

export default function DrawingCanvas({
    canvasSize,
    layers,
    setLayers,
    layer,
    idx,
    currentLayerIdx,
    action,
    styles,
    background,
    loadImage,
    clear,
    isPlay,
    isDownload
}) {

    const canvasRef = useRef()

    const [context, setContext] = useState(null)
    const [currentPath, setCurrentPath] = useState([])
    const [currentURL, setCurrentURL] = useState('')
    const [isDrawing, setIsDrawing] = useState(false)
    const [isTransform, setIsTransform] = useState(false)
    const [transformGap, setTransformGap] = useState({ x: 0, y: 0 })
    const [drawingActions, setDrawingActions] = useState([])

    // latest-value refs: let the trigger-scoped effects below read fresh values
    // without widening their dependency lists (which would re-fire them incorrectly).
    // redrawImageRef / pointerHandlersRef are assigned near the bottom, after those
    // functions are defined.
    const contextRef = useRef(context); contextRef.current = context
    const currentLayerIdxRef = useRef(currentLayerIdx); currentLayerIdxRef.current = currentLayerIdx
    const layerRef = useRef(layer); layerRef.current = layer
    const redrawImageRef = useRef(null)
    const pointerHandlersRef = useRef({})

    // init: size the canvas and store its 2d context, then paint any existing actions
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.width = canvasSize.width
        canvas.height = canvasSize.height
        setContext(canvas.getContext('2d'))
        redrawImageRef.current?.(layerRef.current.drawingActions)
    }, [canvasSize.width, canvasSize.height])

    // attach touch handlers once; the ref keeps them pointing at the latest closures
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ts = (e) => pointerHandlersRef.current.onDown(e, true)
        const tm = (e) => pointerHandlersRef.current.onMove(e, true)
        const te = (e) => pointerHandlersRef.current.onUp(e)
        canvas.addEventListener('touchstart', ts, { passive: false })
        canvas.addEventListener('touchmove', tm, { passive: false })
        canvas.addEventListener('touchend', te, { passive: false })
        return () => {
            canvas.removeEventListener('touchstart', ts)
            canvas.removeEventListener('touchmove', tm)
            canvas.removeEventListener('touchend', te)
        }
    }, [])

    // when this layer's actions change, write them back into the shared layers array
    useEffect(() => {
        if (contextRef.current && idx === currentLayerIdxRef.current) {
            const id = layer.id
            setLayers(prev => {
                const newLayers = prev.filter(frame => frame.id !== id)
                newLayers.splice(currentLayerIdxRef.current, 0, { id, drawingActions })
                return newLayers
            })
        }
    }, [drawingActions, idx, layer.id, setLayers])

    // repaint whenever the shared layers change (undo, frame switch, etc.)
    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.clearRect(0, 0, canvasSize.width, canvasSize.height)
            redrawImageRef.current?.(layerRef.current?.drawingActions)
        }
    }, [layers, canvasSize.width, canvasSize.height])

    useEffect(() => {
        setDrawingActions(layerRef.current.drawingActions)
    }, [clear])

    // EVENT HANDLING

    const onDown = (e, mobile = false) => {
        e.preventDefault()
        if (currentLayerIdx !== idx) return
        if (action.isDraw) startDrawing(e, mobile)
        if (action.isErase) startErasing(e, mobile)
        if (action.isTranslate || action.isRotate || action.isScale) startTransform(e, mobile)
    }

    const onMove = (e, mobile = false) => {
        e.preventDefault()
        if (currentLayerIdx !== idx) return
        if (action.isDraw) {
            draw(e, mobile)
        } else if (action.isErase) {
            erase(e, mobile)
        } else if (action.isTranslate) {
            translate(e, mobile)
        } else if (action.isRotate) {
            rotate(e, mobile)
        } else if (action.isScale) {
            scale(e, mobile)
        }
    }

    const onUp = (e, mobile = false) => {
        e.preventDefault()
        if (currentLayerIdx !== idx) return
        if (action.isDraw) endDrawing(e, mobile)
        if (action.isErase) endErasing(e, mobile)
        if (action.isTranslate || action.isRotate || action.isScale) endTransform(e, mobile)
    }

    // ACTIONS

    const startDrawing = (e, mobile = false) => {
        if (isPlay || isDownload) return
        if (canvasRef.current && action.isDraw) {
            const ctx = canvasRef.current.getContext('2d')            
            ctx.beginPath()

            if (!mobile) {
                ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
            } else {
                ctx.moveTo(e.touches[0].clientX, e.touches[0].clientY)
            }
            setIsDrawing(true)
        }
    }

    const draw = (e, mobile = false) => {
        if (!canvasRef.current || !mobile && !isDrawing) return
        const ctx = canvasRef.current.getContext('2d')
        ctx.lineCap = 'round'
        ctx.lineJoin = 'bevel'
        ctx.lineWidth = styles.lineWidth
        ctx.strokeStyle = styles.strokeStyle

        if (!mobile) {
            ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
            ctx.stroke()
            setCurrentPath([...currentPath, { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }])
        } else {
            ctx.lineTo(e.touches[0].clientX, e.touches[0].clientY)
            ctx.stroke()
            setCurrentPath([...currentPath, { x: e.touches[0].clientX, y: e.touches[0].clientY }])
        }
    }

    const endDrawing = (e) => {
        if (!isDrawing) return
        setIsDrawing(false)
        const ctx = canvasRef.current.getContext('2d')
        ctx.closePath()
        if (currentPath.length > 0) {
            drawPath(currentPath)
            const url = canvasRef.current.toDataURL()
            setDrawingActions([{ url, isPath: false }, ...drawingActions])
        }
        setCurrentPath([])
    }

    const startErasing = (e, mobile) => {
        if (isPlay || isDownload) return
        if (context && action.isErase) {
            setIsDrawing(true)
        }
    }

    const erase = (e, mobile = false) => {
        if (!context || !isDrawing) return
        const newContext = canvasRef.current.getContext('2d')
        mobile
            ? newContext.clearRect(e.touches[0].clientX - 6, e.touches[0].clientY - 6, 12, 12)
            : newContext.clearRect(e.nativeEvent.offsetX - 6, e.nativeEvent.offsetY - 6, 12, 12)

        // newContext.save()
        // newContext.arc(e.nativeEvent.offsetX, e.nativeEvent.offsetY, 10, 0, Math.PI * 2)
        // newContext.clip()
        // newContext.restore()
    }

    const endErasing = (e) => {
        if (!isDrawing || !drawingActions.length) return
        setIsDrawing(false)
        const url = canvasRef.current.toDataURL()
        setDrawingActions([{ url, isPath: false }, ...drawingActions])
    }

    const startTransform = async (e, mobile = false) => {
        if (isPlay || isDownload) return

        setIsTransform(true)
        setTransformGap({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })
        const newURL = await redrawImage()
        setCurrentURL(newURL)
    }

    const translate = async (e, mobile = false) => {
        if (!isTransform || !drawingActions.length || !currentURL) return

        const gapX = e.nativeEvent.offsetX - transformGap.x
        const gapY = e.nativeEvent.offsetY - transformGap.y

        const newContext = canvasRef.current.getContext('2d')
        try {
            const image = await loadImage(currentURL)
            newContext.clearRect(0, 0, canvasSize.width, canvasSize.height)
            newContext.save()
            newContext.translate(gapX, gapY)
            newContext.drawImage(image, 0, 0)
            newContext.restore()
        } catch (error) {
            console.error("error loading image", error)
        }
    }

    const rotate = async (e, mobile = false) => {
        if (!isTransform || !drawingActions.length) return

        const gapX = e.nativeEvent.offsetX - transformGap.x
        const gapY = e.nativeEvent.offsetY - transformGap.y

        const newContext = canvasRef.current.getContext('2d')
        try {
            const image = await loadImage(currentURL)
            newContext.clearRect(0, 0, canvasSize.width, canvasSize.height)
            newContext.save()
            newContext.translate(canvasSize.width / 2, canvasSize.height / 2)
            newContext.rotate((gapX) * Math.PI / 180)
            newContext.drawImage(image, -canvasSize.width / 2, -canvasSize.height / 2)
            newContext.restore()
        } catch (error) {
            console.error("error loading image", error)
        }
    }

    const scale = async (e, mobile = false) => {
        if (!isTransform || !drawingActions.length) return

        const gapX = e.nativeEvent.offsetX - transformGap.x
        const gapY = e.nativeEvent.offsetY - transformGap.y

        const newContext = canvasRef.current.getContext('2d')
        try {
            const image = await loadImage(currentURL)
            newContext.clearRect(0, 0, canvasSize.width, canvasSize.height)
            newContext.save()
            newContext.translate(canvasSize.width / 2, canvasSize.height / 2)
            newContext.scale(1 + (gapX / 100), 1 + (gapY / 100))
            newContext.drawImage(image, -canvasSize.width / 2, -canvasSize.height / 2)
            newContext.restore()
        } catch (error) {
            console.error("error loading image", error)
        }
    }

    const endTransform = (e, mobile = false) => {
        if (!isTransform || !drawingActions.length) return
        setIsTransform(false)
        setTransformGap({ x: 0, y: 0 })

        const url = canvasRef.current.toDataURL()
        setDrawingActions([{ url, isPath: false }, ...drawingActions])
        setCurrentURL('')
    }

    const redrawImage = async (actions = drawingActions) => {
        const newContext = canvasRef.current.getContext('2d')

        if (idx === 0) {
            newContext.fillStyle = background
            newContext.fillRect(0, 0, canvasSize.width, canvasSize.height)
        } else {

            let paths = []

            for (const action of actions) {
                if (action.isPath) {
                    paths.unshift(action)
                    actions.shift()
                }
                if (!action.isPath) {
                    break
                }
            }

            if (paths.length) {
                for (const path of paths) {
                    try {
                        const image = await loadImage(action.url)
                        newContext.drawImage(image, 0, 0)
                    } catch (error) {
                        console.error('Error loading image', error)
                    }
                }
            }

            for (const action of actions) {
                try {
                    const image = await loadImage(action.url)
                    newContext.drawImage(image, 0, 0)
                } catch (error) {
                    console.error('Error loading image', error)
                }
                if (!action.isPath) {
                    break
                }
            }
        }
        const url = canvasRef.current.toDataURL()
        return url
    }

    const drawPath = (path) => {
        const newContext = canvasRef.current.getContext('2d')

        newContext.beginPath()
        newContext.lineWidth = styles.lineWidth
        newContext.strokeStyle = styles.strokeStyle
        newContext.moveTo(path[0].x, path[0].y)
        path.forEach(point => {
            newContext.lineTo(point.x, point.y)
        })
        newContext.stroke()
    }

    // mirror render-scoped functions into refs read by the mount/trigger effects above
    redrawImageRef.current = redrawImage
    pointerHandlersRef.current = { onDown, onMove, onUp }

    return (
        <>
            <canvas
                ref={canvasRef}
                onMouseDown={onDown}
                onMouseMove={onMove}
                onMouseUp={onUp}
                onMouseOut={onUp}
                className={`absolute left-0 top-0 
            md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 md:rounded-md 
            ${isTransform ? 'cursor-grab' : isDrawing ? 'cursor-cell' : ''} 
            ${currentLayerIdx === idx ? '' : 'pointer-events-none'}`}
                width={canvasSize.width}
                height={canvasSize.height}>
            </canvas>
        </>
    )
}