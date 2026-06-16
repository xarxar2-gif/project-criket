import { useRef, useState } from 'react'
import { Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { useScene } from '../../../context/SceneContext'
import HoverHalo from '../HoverHalo'
import { useZoomTilt } from '../useZoomTilt'

const FACE_NORMAL = new Vector3(0, 1, 0) // cover faces up when flat on table

export default function JournalItem({ position, rotation = [0, 0, 0] }) {
  const { setFocusPos, setPendingItem } = useScene()
  const floatRef = useRef()
  const [hovered, setHovered] = useState(false)
  const { ref: zoomRef, tick: tickZoom } = useZoomTilt('journal', FACE_NORMAL)

  useFrame((state, delta) => {
    if (!floatRef.current) return
    const targetY = hovered ? 0.1 : 0
    floatRef.current.position.y += (targetY - floatRef.current.position.y) * 6 * delta
    const targetRotZ = hovered ? 0.06 : 0
    floatRef.current.rotation.z += (targetRotZ - floatRef.current.rotation.z) * 5 * delta
    tickZoom(state, delta)
  })

  const glow = hovered ? '#7a3a10' : '#000000'

  return (
    <group
      position={position}
      rotation={rotation}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
      onClick={(e) => { e.stopPropagation(); setFocusPos(position); setPendingItem('journal') }}
    >
      <group ref={zoomRef}>
        <group ref={floatRef}>
          <mesh castShadow receiveShadow position={[0, -0.028, 0]}>
            <boxGeometry args={[0.44, 0.016, 0.60]} />
            <meshStandardMaterial color="#1a0902" roughness={0.88} emissive={glow} emissiveIntensity={0.5} />
          </mesh>
          <mesh castShadow position={[0, 0, 0]}>
            <boxGeometry args={[0.41, 0.042, 0.57]} />
            <meshStandardMaterial color="#ddd0a8" roughness={1.0} />
          </mesh>
          <mesh castShadow position={[0, 0.029, 0]}>
            <boxGeometry args={[0.44, 0.016, 0.60]} />
            <meshStandardMaterial color="#220c03" roughness={0.88} emissive={glow} emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[-0.223, 0, 0]}>
            <boxGeometry args={[0.012, 0.076, 0.60]} />
            <meshStandardMaterial color="#100401" roughness={0.8} metalness={0.05} />
          </mesh>
          <mesh position={[0.22, 0.031, 0.02]}>
            <boxGeometry args={[0.022, 0.006, 0.042]} />
            <meshStandardMaterial color="#9a7a18" metalness={0.85} roughness={0.35} />
          </mesh>
          <mesh position={[0.06, 0.031, 0.31]} rotation={[0, 0, 0.08]}>
            <boxGeometry args={[0.018, 0.004, 0.04]} />
            <meshStandardMaterial color="#8a1a18" roughness={0.9} />
          </mesh>
          <HoverHalo hovered={hovered} size={[0.44, 0.08, 0.60]} />
        </group>
      </group>
    </group>
  )
}
