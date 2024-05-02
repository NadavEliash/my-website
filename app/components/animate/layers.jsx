import Layer from './layer'
import { Dongle } from 'next/font/google'
import { CopyPlus, Minus, Plus, Trash2 } from 'lucide-react'

const dongle = Dongle({ weight: ["700"], subsets: ["latin"] })

export default function Layers({
    layers,
    setLayers,
    currentLayerIdx,
    setCurrentLayerIdx,
    canvasSyze,
    generateId,
    background,
    loadImage,
}) {

    const addLayer = () => {
        const newLayers = layers
        newLayers.splice(currentLayerIdx + 1, 0, { id: generateId(), drawingActions: [] })
        setLayers(newLayers)
        setCurrentLayerIdx(currentLayerIdx + 1)
    }

    const copyLayer = () => {
        const copiedLayer = { id: generateId(), drawingActions: [...layers[currentLayerIdx].drawingActions] }
        const newLayers = layers
        newLayers.splice(currentLayerIdx + 1, 0, copiedLayer)
        setLayers(newLayers)
        setCurrentLayerIdx(currentLayerIdx + 1)
    }

    const removeLayer = () => {
        if (currentLayerIdx === 1 && layers.length === 2) {
            layers.splice(currentLayerIdx, 1, { id: generateId(), drawingActions: [] })
            setLayers(prev => [...prev])
        } else {
            layers.splice(currentLayerIdx, 1)
            setLayers(prev => [...prev])
        }
        setCurrentLayerIdx(prev => prev > 1 ? prev - 1 : 1)
    }

    const buttonsClass = "bg-white/20 p-2 rounded-md cursor-pointer hover:scale-110 transition-transform w-8 h-8"

    return (
        <div className="p-4 bg-white/20 rounded-2xl flex flex-col gap-2 justify-between">
            <h1 className={`text-center text-3xl text-slate-200 ${dongle.className}`}>Layers:</h1>
            <div className="flex-1 flex flex-col-reverse items-center overflow-auto">
                {layers && layers.map((layer, idx) =>
                    <Layer
                        key={idx}
                        layer={layer}
                        idx={idx}
                        layers={layers}
                        setLayers={setLayers}
                        currentLayerIdx={currentLayerIdx}
                        setCurrentLayerIdx={setCurrentLayerIdx}
                        canvasSize={canvasSyze}
                        background={background}
                        loadImage={loadImage}
                    />
                )}
            </div>
            <div className="flex justify-around gap-2">
                <Plus className={buttonsClass} onClick={addLayer} />
                <CopyPlus className={buttonsClass} onClick={copyLayer} />
                <Trash2 className={buttonsClass} onClick={removeLayer} />
            </div>
        </div>
    )
}