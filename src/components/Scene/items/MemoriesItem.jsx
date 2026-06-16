import { useRef, useState, useEffect, Suspense } from 'react'
import { Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useScene } from '../../../context/SceneContext'
import HoverHalo from '../HoverHalo'

const MODEL_SCALE    = 0.002
const MODEL_POSITION = [0, -0.02, 0]
const MODEL_ROTATION = [0, Math.PI - 2, 0]

function LaptopModel({ hovered }) {
  const { scene, materials } = useGLTF(`${import.meta.env.BASE_URL}models/asus_laptop.glb`)
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

  useFrame((_, delta) => {
    if (!floatRef.current) return
    const targetY = hovered ? 0.08 : 0
    floatRef.current.position.y += (targetY - floatRef.current.position.y) * 6 * delta
  })

  return (
    <group
      position={position}
      rotation={rotation}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
      onClick={(e) => { e.stopPropagation(); const wp = new Vector3(); e.eventObject.getWorldPosition(wp); setFocusPos([wp.x, wp.y, wp.z]); setPendingItem('memories') }}
    >
      <group ref={floatRef}>
        <Suspense fallback={<Placeholder />}>
          <LaptopModel hovered={hovered} />
        </Suspense>
        <HoverHalo hovered={hovered} size={[0.40, 0.40, 0.28]} lightPos={[0, 0.1, 0.16]} />
      </group>
    </group>
  )
}

useGLTF.preload(`${import.meta.env.BASE_URL}models/asus_laptop.glb`)
