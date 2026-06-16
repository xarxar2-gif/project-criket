import { useRef, useState } from 'react'
import { Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { useScene } from '../../../context/SceneContext'
import HoverHalo from '../HoverHalo'
import { useZoomTilt } from '../useZoomTilt'

// Front panel faces +Z in local space
const FACE_NORMAL = new Vector3(0, 0, 1)

export default function RadioItem({ position, rotation = [0, 0, 0] }) {
  const { setFocusPos, setPendingItem } = useScene()
  const floatRef = useRef()
  const [hovered, setHovered] = useState(false)
  const { ref: zoomRef, tick: tickZoom } = useZoomTilt('music', FACE_NORMAL)

  useFrame((state, delta) => {
    if (!floatRef.current) return
    const targetY = hovered ? 0.08 : 0
    floatRef.current.position.y += (targetY - floatRef.current.position.y) * 5 * delta
    tickZoom(state, delta)
  })

  const bodyColor = hovered ? '#4a2e1c' : '#2e1c0e'
  const glow = hovered ? '#1a0808' : '#000000'

  return (
    <group position={position} rotation={rotation}>
      {/* Cassette pile — stays in place, not affected by zoom tilt */}
      <group position={[-0.52, -0.12, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.18, 0.03, 0.12]} />
          <meshStandardMaterial color="#1a1209" roughness={0.85} />
        </mesh>
        <mesh position={[0.01, 0.033, -0.01]} castShadow>
          <boxGeometry args={[0.18, 0.03, 0.12]} />
          <meshStandardMaterial color="#2a1c0a" roughness={0.85} />
        </mesh>
        <mesh position={[-0.01, 0.066, 0.01]} castShadow>
          <boxGeometry args={[0.18, 0.03, 0.12]} />
          <meshStandardMaterial color="#1f1508" roughness={0.85} />
        </mesh>
      </group>

      <group ref={zoomRef}>
        <group
          ref={floatRef}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
          onClick={(e) => { e.stopPropagation(); setFocusPos(position); setPendingItem('music') }}
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.52, 0.28, 0.22]} />
            <meshStandardMaterial color={bodyColor} roughness={0.8} emissive={glow} emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[0, 0.142, 0]}>
            <boxGeometry args={[0.50, 0.01, 0.20]} />
            <meshStandardMaterial color={bodyColor} roughness={0.75} />
          </mesh>
          <mesh position={[-0.09, 0.02, 0.116]}>
            <boxGeometry args={[0.28, 0.22, 0.006]} />
            <meshStandardMaterial color="#160c04" roughness={0.95} />
          </mesh>
          {[-0.065, -0.025, 0.015, 0.055].map((y, i) => (
            <mesh key={i} position={[-0.09, y, 0.12]}>
              <boxGeometry args={[0.24, 0.006, 0.004]} />
              <meshStandardMaterial color="#201408" roughness={0.9} />
            </mesh>
          ))}
          <mesh position={[0.16, 0.045, 0.116]}>
            <cylinderGeometry args={[0.062, 0.062, 0.014, 28]} />
            <meshStandardMaterial color="#8a6814" metalness={0.65} roughness={0.38} />
          </mesh>
          <mesh position={[0.16, 0.045 + 0.058, 0.124]}>
            <boxGeometry args={[0.006, 0.012, 0.006]} />
            <meshStandardMaterial color="#1a0e04" />
          </mesh>
          <mesh position={[0.195, -0.072, 0.116]}>
            <cylinderGeometry args={[0.022, 0.022, 0.014, 14]} />
            <meshStandardMaterial color="#3a2808" metalness={0.45} roughness={0.6} />
          </mesh>
          <mesh position={[0.16, -0.058, 0.116]}>
            <boxGeometry args={[0.12, 0.036, 0.006]} />
            <meshStandardMaterial
              color="#000e08"
              emissive={hovered ? '#00e870' : '#003820'}
              emissiveIntensity={hovered ? 0.9 : 0.3}
            />
          </mesh>
          <mesh position={[0.2, 0.42, 0]}>
            <cylinderGeometry args={[0.006, 0.009, 0.58, 8]} />
            <meshStandardMaterial color="#4a4438" metalness={0.75} roughness={0.45} />
          </mesh>
          <mesh position={[0.2, 0.15, 0]}>
            <cylinderGeometry args={[0.008, 0.01, 0.04, 8]} />
            <meshStandardMaterial color="#2a2018" metalness={0.6} roughness={0.5} />
          </mesh>
          {[[-0.2, -1], [0.2, -1], [-0.2, 1], [0.2, 1]].map(([x, zSign], i) => (
            <mesh key={i} position={[x, -0.15, zSign * 0.092]}>
              <boxGeometry args={[0.04, 0.018, 0.04]} />
              <meshStandardMaterial color="#0e0a06" roughness={0.95} />
            </mesh>
          ))}
          <HoverHalo hovered={hovered} size={[0.52, 0.28, 0.22]} />
        </group>
      </group>
    </group>
  )
}
