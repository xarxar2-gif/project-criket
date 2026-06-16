import { useRef, useState, useEffect, Suspense } from 'react'
import { Vector3, Quaternion, Euler } from 'three'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useScene } from '../../../context/SceneContext'
import HoverHalo from '../HoverHalo'
import { useZoomTilt } from '../useZoomTilt'

const MODEL_SCALE    = 0.002
const MODEL_POSITION = [0, -0.02, 0]
const MODEL_ROTATION = [0, Math.PI - 2, 0]

// Derive FACE_NORMAL by rotating the screen's model-space axis by MODEL_ROTATION.
// Change MODEL_SCREEN_AXIS if the screen faces a different direction in the GLB
// (try new Vector3(0,0,-1) or new Vector3(1,0,0) if the tilt is still off).
const MODEL_SCREEN_AXIS = new Vector3(0, 0, 1)
const FACE_NORMAL = MODEL_SCREEN_AXIS.clone().applyQuaternion(
  new Quaternion().setFromEuler(new Euler(...MODEL_ROTATION))
)

function LaptopModel({ hovered }) {
  const { scene, materials } = useGLTF('/models/asus_laptop.glb')
  const matRef = useRef(null)

  useEffect(() => {
    if (!materials.lambert9SG) return
    const mat = materials.lambert9SG.clone()
    matRef.current = mat
    scene.traverse((child) => {
      if (!child.isMesh) return
      child.castShadow    = true
      child.receiveShadow = true
      child.material      = mat
    })
    return () => { mat.dispose() }
  }, [scene, materials])

  useEffect(() => {
    if (!matRef.current) return
    matRef.current.emissive.set(hovered ? '#1a4a3a' : '#000000')
    matRef.current.emissiveIntensity = hovered ? 0.35 : 0
  }, [hovered])

  return (
    <primitive
      object={scene}
      scale={MODEL_SCALE}
      position={MODEL_POSITION}
      rotation={MODEL_ROTATION}
    />
  )
}

function Placeholder() {
  return (
    <>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.40, 0.32, 0.28]} />
        <meshStandardMaterial color="#363028" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.018, 0.152]}>
        <boxGeometry args={[0.27, 0.20, 0.006]} />
        <meshStandardMaterial color="#001808" emissive="#004028" emissiveIntensity={0.35} roughness={0.05} />
      </mesh>
    </>
  )
}

export default function MemoriesItem({ position, rotation = [0, 0, 0] }) {
  const { setFocusPos, setPendingItem } = useScene()
  const floatRef = useRef()
  const [hovered, setHovered] = useState(false)
  const { ref: zoomRef, tick: tickZoom } = useZoomTilt('memories', FACE_NORMAL)

  useFrame((state, delta) => {
    if (!floatRef.current) return
    const targetY = hovered ? 0.08 : 0
    floatRef.current.position.y += (targetY - floatRef.current.position.y) * 6 * delta
    tickZoom(state, delta)
  })

  return (
    <group
      position={position}
      rotation={rotation}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
      onClick={(e) => { e.stopPropagation(); setFocusPos(position); setPendingItem('memories') }}
    >
      <group ref={zoomRef}>
        <group ref={floatRef}>
          <Suspense fallback={<Placeholder />}>
            <LaptopModel hovered={hovered} />
          </Suspense>
          <HoverHalo hovered={hovered} size={[0.40, 0.40, 0.28]} lightPos={[0, 0.1, 0.16]} />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/models/asus_laptop.glb')
