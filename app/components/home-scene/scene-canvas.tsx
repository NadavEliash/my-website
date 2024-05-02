'use client'

import { Canvas } from '@react-three/fiber'
import Cube from './cube'
import Bulb from './bulb'

export default function SceneCanvas() {

    return (
        <div className='absolute left-0 top-0 w-full h-[100svh]'>
            <Canvas>
                <ambientLight intensity={.7} />
                <directionalLight color="yellow" position={[0, 0, 3]} />
                <Cube position={[0, 0, 0]} size={[2, 2, 2]} color={"green"} />
                <Bulb position={[0, 0, 0]} size={[2, 2, 2]} />
            </Canvas>
        </div>
    )
}