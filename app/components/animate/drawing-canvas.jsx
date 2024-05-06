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
}) {

    const canvasRef = useRef()

    const [context, setContext] = useState(null)
    const [currentPath, setCurrentPath] = useState([])
    const [currentURL, setCurrentURL] = useState('')
    const [isDrawing, setIsDrawing] = useState(false)
    const [isTransform, setIsTransform] = useState(false)
    const [transformGap, setTransformGap] = useState({ x: 0, y: 0 })
    const [drawingActions, setDrawingActions] = useState([])

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current

            canvas.width = canvasSize.width
            canvas.height = canvasSize.height
            const ctx = canvas.getContext('2d')
            setContext(ctx)

            redrawImage(layer.drawingActions)
        }
    }, [])

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current
            canvas.addEventListener('touchstart', onTouchStart, { passive: false })
            canvas.addEventListener('touchmove', onTouchMove, { passive: false })
            canvas.addEventListener('touchend', onTouchEnd, { passive: false })
        }
    }, [])

    useEffect(() => {
        if (context && idx === currentLayerIdx) {
            const id = layer.id
            const newLayer = { id, drawingActions }

            const newLayers = layers.filter(frame => frame.id !== id)
            newLayers.splice(currentLayerIdx, 0, newLayer)
            setLayers(newLayers)
        }
    }, [drawingActions])

    useEffect(() => {
        if (context) {
            context.clearRect(0, 0, canvasSize.width, canvasSize.height)
            redrawImage(layer?.drawingActions)
        }
    }, [layers])

    useEffect(() => {
        setDrawingActions(layer.drawingActions)
    }, [clear])

    // EVENT HANDLING

    const onDown = (e) => {
        if (currentLayerIdx !== idx) return
        if (action.isDraw) startDrawing(e)
        if (action.isErase) startErasing(e)
        if (action.isTranslate || action.isRotate || action.isScale) startTransform(e)
    }

    const onMove = (e) => {
        if (currentLayerIdx !== idx) return
        if (action.isDraw) {
            draw(e)
        } else if (action.isErase) {
            erase(e)
        } else if (action.isTranslate) {
            translate(e)
        } else if (action.isRotate) {
            rotate(e)
        } else if (action.isScale) {
            scale(e)
        }
    }

    const onUp = (e) => {
        if (currentLayerIdx !== idx) return
        if (action.isDraw) endDrawing(e)
        if (action.isErase) endErasing(e)
        if (action.isTranslate || action.isRotate || action.isScale) endTransform(e)
    }

    const onTouchStart = (e) => {
        e.preventDefault()
        if (currentLayerIdx !== idx) return
        if (canvasRef.current) {
            if (action.isDraw) startDrawing(e, true)
        }
    }

    const onTouchMove = (e) => {
        e.preventDefault()
        draw(e, true)
    }

    const onTouchEnd = (e) => {
        e.preventDefault()
        endDrawing(e, true)
    }

    // ACTIONS

    const startDrawing = (e, mobile = false) => {
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
            console.log('move')
            ctx.lineTo(e.touches[0].clientX, e.touches[0].clientY)
            ctx.stroke()
            setCurrentPath([...currentPath, { x: e.touches[0].clientX, y: e.touches[0].clientY }])
        }
    }

    const endDrawing = (e, mobile = false) => {
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

    const startErasing = (e) => {
        if (context && action.isErase) {
            setIsDrawing(true)
        }
    }

    const erase = (e) => {
        if (!context || !isDrawing) return
        const newContext = canvasRef.current.getContext('2d')
        newContext.clearRect(e.nativeEvent.offsetX - 6, e.nativeEvent.offsetY - 6, 12, 12)

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

    const startTransform = async (e) => {
        setIsTransform(true)
        setTransformGap({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })
        const newURL = await redrawImage()
        setCurrentURL(newURL)
    }

    const translate = async (e) => {
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

    const rotate = async (e) => {
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

    const scale = async (e) => {
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

    const endTransform = (e) => {
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

    return (
        <canvas
            ref={canvasRef}
            onMouseDown={onDown}
            onMouseMove={onMove}
            onMouseUp={onUp}
            onMouseOut={onUp}
            className={`absolute bg-gray-100 left-0 top-0 
            md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 md:rounded-md
            ${isTransform ? 'cursor-grab' : isDrawing ? 'cursor-none' : ''} 
            ${currentLayerIdx === idx ? '' : 'pointer-events-none'}`}
            width={canvasSize.width}
            height={canvasSize.height}>
        </canvas>
    )
}