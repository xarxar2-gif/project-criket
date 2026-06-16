/**
 * Renders a BackSide outline box around a hovered item + a soft warm point light.
 * size[] = approximate bounding box of the item [w, h, d].
 * A fixed PAD is added to each axis so the outline is always visible,
 * with a minimum of MIN so thin items still show a readable rim.
 */
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BackSide } from 'three'

const PAD = 0.045
const MIN = 0.065

export default function HoverHalo({
  hovered,
  size = [0.5, 0.1, 0.65],
  lightPos = [0, 0.12, 0.08],
}) {
  const meshRef = useRef()
  const lightRef = useRef()

  const outSize = [
    Math.max(size[0] + PAD, MIN),
    Math.max(size[1] + PAD, MIN),
    Math.max(size[2] + PAD, MIN),
  ]

  useFrame((_, delta) => {
    const speed = 10 * delta
    if (meshRef.current) {
      const target = hovered ? 0.75 : 0
      meshRef.current.material.opacity +=
        (target - meshRef.current.material.opacity) * speed
    }
    if (lightRef.current) {
      const target = hovered ? 2.6 : 0
      lightRef.current.intensity +=
        (target - lightRef.current.intensity) * speed
    }
  })

  return (
    <>
      <mesh ref={meshRef}>
        <boxGeometry args={outSize} />
        <meshBasicMaterial
          color="#e8a040"
          side={BackSide}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={lightPos}
        intensity={0}
        color="#c87941"
        distance={0.8}
        decay={2}
      />
    </>
  )
}
