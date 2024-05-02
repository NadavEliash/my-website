import { useLoader } from '@react-three/fiber'
// import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'

interface BulbProps {
    position: [number, number, number]
    size: [number, number, number]
}

export default function Bulb({ position, size }: BulbProps) {
    // const obj = useLoader(OBJLoader, '../assets/bulb.obj')

    return (
        <mesh
            onPointerEnter={(event) => { event.stopPropagation }}>
                {/* <primitive object={obj} /> */}
            <meshStandardMaterial />
        </mesh>
    )
}