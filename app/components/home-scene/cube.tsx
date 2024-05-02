'use client'

import { Canvas, MeshProps, useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'

interface CubeProps {
    position: [number, number, number]
    size: [number, number, number]
    color: string
}

export default function Cube({ position, size, color }: CubeProps) {
    const ref = useRef<MeshProps>()

    const [isHovered, setIsHovered] = useState(false)

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.y = state.pointer.x * 2
            ref.current.rotation.x = state.pointer.y * 2
        }
    })

    return (
        <mesh ref={ref}
            onPointerEnter={(event) => { event.stopPropagation, setIsHovered(true) }}
            onPointerLeave={() => setIsHovered(false)}>
            <boxGeometry args={size} />
            <meshStandardMaterial color={isHovered?color:"yellow"} />
        </mesh>
    )
}