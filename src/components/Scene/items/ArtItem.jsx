import { useRef, useState } from 'react'
import { Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { useScene } from '../../../context/SceneContext'
import HoverHalo from '../HoverHalo'
import { useZoomTilt } from '../useZoomTilt'

const POLAS = [
  { pos: [-0.29, 0.25, 0],      zRot: -0.14, photo: '#2a3a28' },
  { pos: [0.27, 0.25, 0.005],   zRot: 0.08,  photo: '#28283a' },
  { pos: [-0.29, -0.22, 0.003], zRot: 0.19,  photo: '#3a2828' },
  { pos: [0.27, -0.22, 0],      zRot: -0.06, photo: '#2a3830' },
]

// Polaroids face +Z (toward viewer) — only a small tilt needed since they're wall-mounted
const FACE_NORMAL = new Vector3(0, 0, 1)

function WallPolaroid({ pos, zRot, photo }) {
  return (
    <group position={pos} rotation={[0, 0, zRot]}>
      <mesh castShadow>
        <boxGeometry args={[0.30, 0.36, 0.011]} />
        <meshStandardMaterial color="#f0e8d4" roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.018, 0.007]}>
        <boxGeometry args={[0.245, 0.245, 0.007]} />
        <meshStandardMaterial color={photo} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.162, 0.012]}>
        <sphereGeometry args={[0.013, 8, 8]} />
        <meshStandardMaterial color="#8a2018" metalness={0.55} roughness={0.45} />
      </mesh>
    </group>
  )
}

export default function ArtItem({ position, rotation = [0, 0, 0] }) {
  const { setFocusPos, setPendingItem } = useScene()
  const floatRef = useRef()
  const [hovered, setHovered] = useState(false)
  const { ref: zoomRef, tick: tickZoom } = useZoomTilt('art', FACE_NORMAL)

  useFrame((state, delta) => {
    if (!floatRef.current) return
    const targetZ = hovered ? 0.09 : 0
    floatRef.current.position.z += (targetZ - floatRef.current.position.z) * 6 * delta
    tickZoom(state, delta)
  })

  return (
    <group
      position={position}
      rotation={rotation}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
      onClick={(e) => { e.stopPropagation(); setFocusPos(position); setPendingItem('art') }}
    >
      <group ref={zoomRef}>
        <group ref={floatRef}>
          {POLAS.map((p, i) => (
            <WallPolaroid key={i} {...p} />
          ))}
          <HoverHalo hovered={hovered} size={[0.84, 0.84, 0.015]} lightPos={[0, 0, 0.2]} />
        </group>
      </group>
    </group>
  )
}
