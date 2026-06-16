import { useRef, useState } from 'react'
import { Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { useScene } from '../../../context/SceneContext'
import HoverHalo from '../HoverHalo'
import { useZoomTilt } from '../useZoomTilt'

const FACE_NORMAL = new Vector3(0, 1, 0) // folder lies flat, top face toward camera

export default function CharacterSheetItem({ position, rotation = [0, 0, 0] }) {
  const { setFocusPos, setPendingItem } = useScene()
  const floatRef = useRef()
  const [hovered, setHovered] = useState(false)
  const { ref: zoomRef, tick: tickZoom } = useZoomTilt('character', FACE_NORMAL)

  useFrame((state, delta) => {
    if (!floatRef.current) return
    const targetY = hovered ? 0.1 : 0
    floatRef.current.position.y += (targetY - floatRef.current.position.y) * 6 * delta
    tickZoom(state, delta)
  })

  const folderColor = hovered ? '#b8842a' : '#9a6e1a'
  const glow = hovered ? '#5a3808' : '#000000'

  return (
    <group
      position={position}
      rotation={rotation}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
      onClick={(e) => { e.stopPropagation(); setFocusPos(position); setPendingItem('character') }}
    >
      <group ref={zoomRef}>
        <group ref={floatRef}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.58, 0.009, 0.72]} />
            <meshStandardMaterial color={folderColor} roughness={0.88} emissive={glow} emissiveIntensity={0.35} />
          </mesh>
          <mesh position={[0, 0.01, 0]}>
            <boxGeometry args={[0.582, 0.002, 0.002]} />
            <meshStandardMaterial color="#6a4a10" roughness={1} />
          </mesh>
          <mesh castShadow position={[0.015, 0.012, -0.33]}>
            <boxGeometry args={[0.53, 0.014, 0.11]} />
            <meshStandardMaterial color="#e4dabb" roughness={0.95} />
          </mesh>
          <mesh castShadow position={[-0.02, 0.015, -0.355]}>
            <boxGeometry args={[0.50, 0.012, 0.07]} />
            <meshStandardMaterial color="#ede4cc" roughness={0.95} />
          </mesh>
          <mesh position={[-0.2, 0.01, -0.395]}>
            <boxGeometry args={[0.13, 0.018, 0.045]} />
            <meshStandardMaterial color={folderColor} roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.011, 0.18]}>
            <cylinderGeometry args={[0.014, 0.014, 0.012, 10]} />
            <meshStandardMaterial color="#9a7a18" metalness={0.8} roughness={0.4} />
          </mesh>
          <HoverHalo hovered={hovered} size={[0.58, 0.018, 0.72]} />
        </group>
      </group>
    </group>
  )
}
