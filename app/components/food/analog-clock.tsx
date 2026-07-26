'use client'

import { useRef } from 'react'

export type ClockSlot = { time: string; disabled: boolean }

type Props = {
  slots: ClockSlot[]
  value: string
  onChange: (time: string) => void
}

const CX = 120
const CY = 120
const R = 100
const HAND = 66

// degrees clockwise from 12 o'clock for a 12-hour dial
function toAngle(time: string) {
  const [h, m] = time.split(':').map(Number)
  return ((h % 12) + m / 60) * 30
}

function pointOnDial(deg: number, radius: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) }
}

export default function AnalogClock({ slots, value, onChange }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const enabled = slots.filter(s => !s.disabled)

  function pickFromPointer(clientX: number, clientY: number) {
    const svg = svgRef.current
    if (!svg || enabled.length === 0) return
    const rect = svg.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * 240 - CX
    const y = ((clientY - rect.top) / rect.height) * 240 - CY
    let deg = (Math.atan2(y, x) * 180) / Math.PI + 90
    if (deg < 0) deg += 360

    // nearest enabled slot by circular angular distance
    let best = enabled[0]
    let bestDiff = Infinity
    for (const s of enabled) {
      let d = Math.abs(toAngle(s.time) - deg)
      d = Math.min(d, 360 - d)
      if (d < bestDiff) { bestDiff = d; best = s }
    }
    if (best.time !== value) onChange(best.time)
  }

  // fall back to the earliest enabled window so the dial defaults to a real time, not --:--
  const effectiveValue = value || enabled[0]?.time || ''
  const selAngle = effectiveValue ? toAngle(effectiveValue) : null
  const hand = selAngle != null ? pointOnDial(selAngle, HAND) : null

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 240 240"
      className="w-56 h-56 mx-auto touch-none select-none cursor-pointer"
      onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); pickFromPointer(e.clientX, e.clientY) }}
      onPointerMove={e => { if (e.buttons === 1) pickFromPointer(e.clientX, e.clientY) }}
    >
      {/* face */}
      <circle cx={CX} cy={CY} r={R} className="fill-white stroke-gray-200" strokeWidth={2} />

      {/* hour numerals */}
      {Array.from({ length: 12 }, (_, i) => i + 1).map(h => {
        const p = pointOnDial(h * 30, R - 16)
        return (
          <text key={h} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" className="fill-gray-300" fontSize={10}>
            {h}
          </text>
        )
      })}

      {/* slot markers */}
      {slots.map(s => {
        const p = pointOnDial(toAngle(s.time), R - 2)
        const isSel = s.time === effectiveValue
        return (
          <circle
            key={s.time}
            cx={p.x}
            cy={p.y}
            r={isSel ? 7 : 5}
            className={s.disabled ? 'fill-gray-200' : isSel ? 'fill-gray-900' : 'fill-amber-400'}
          />
        )
      })}

      {/* selection hand */}
      {hand && (
        <line x1={CX} y1={CY} x2={hand.x} y2={hand.y} className="stroke-gray-900" strokeWidth={3} strokeLinecap="round" />
      )}
      <circle cx={CX} cy={CY} r={6} className="fill-gray-900" />

      {/* center label */}
      <text x={CX} y={CY + 34} textAnchor="middle" className="fill-gray-900" fontSize={20} fontWeight="700">
        {effectiveValue || ''}
      </text>
    </svg>
  )
}
