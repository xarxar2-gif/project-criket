import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, Raycaster } from 'three'
import { useGLTF } from '@react-three/drei'
import { getTimeConfig } from '../../utils/timeOfDay'
import Table from './Table'
import JournalItem from './items/JournalItem'
import CharacterSheetItem from './items/CharacterSheetItem'
import MemoriesItem from './items/MemoriesItem'
import ArtItem from './items/ArtItem'
import RadioItem from './items/RadioItem'
import { useScene } from '../../context/SceneContext'

const REST_POS  = new Vector3(0, 1.6, 2.8)
const REST_LOOK = new Vector3(0, 0.38, -0.1)
const ZOOM_FACTOR = 0.68 // how far toward the item the camera travels on click

function CameraRig() {
  const { camera } = useThree()
  const { focusPos, pendingItem, setPendingItem, setActiveItem } = useScene()

  const curPos  = useRef(new Vector3(0, 1.6, 2.8))
  const curLook = useRef(new Vector3(0, 0.38, -0.1))
  const tgtPos  = useRef(new Vector3())
  const tgtLook = useRef(new Vector3())
  const fVec    = useRef(new Vector3())

  useEffect(() => {
    camera.position.copy(curPos.current)
    camera.lookAt(curLook.current)
  }, [camera])

  useFrame((_, delta) => {
    if (focusPos) {
      fVec.current.set(focusPos[0], focusPos[1], focusPos[2])
      tgtPos.current.copy(REST_POS).lerp(fVec.current, ZOOM_FACTOR)
      tgtLook.current.copy(fVec.current)
    } else {
      tgtPos.current.copy(REST_POS)
      tgtLook.current.copy(REST_LOOK)
    }

    const speed = focusPos ? 4.5 : 2.0
    curPos.current.lerp(tgtPos.current, speed * delta)
    curLook.current.lerp(tgtLook.current, speed * delta)

    camera.position.copy(curPos.current)
    camera.lookAt(curLook.current)

    // Once camera has arrived, open the waiting overlay
    if (pendingItem && focusPos) {
      const dist = curPos.current.distanceTo(tgtPos.current)
      if (dist < 0.12) {
        setActiveItem(pendingItem)
        setPendingItem(null)
      }
    }
  })

  return null
}

// Shared ref: GarageRoom registers its Three.js scene object here so
// MouseFlashlight can raycast against the actual room geometry
const roomSceneRef = { current: null }

// Mouse flashlight: a warm point light that follows where the mouse points on the room
function MouseFlashlight() {
  const { mouse, camera } = useThree()
  const { activeItem } = useScene()
  const lightRef  = useRef()
  const smoothPos = useRef(new Vector3(0, 0.9, 0.6))
  const targetPos = useRef(new Vector3(0, 0.9, 0.6))
  const caster    = useRef(new Raycaster())
  const _normal   = useRef(new Vector3())

  useFrame(() => {
    if (!lightRef.current) return

    if (activeItem) {
      targetPos.current.set(0, 1.1, 0.8)
    } else if (roomSceneRef.current) {
      caster.current.setFromCamera(mouse, camera)
      const hits = caster.current.intersectObject(roomSceneRef.current, true)
      if (hits.length > 0) {
        // Transform face normal to world space then offset the light off the surface
        _normal.current.copy(hits[0].face.normal)
          .transformDirection(hits[0].object.matrixWorld)
        targetPos.current.copy(hits[0].point)
          .addScaledVector(_normal.current, 0.12)
      }
    }

    smoothPos.current.lerp(targetPos.current, 0.055)
    lightRef.current.position.copy(smoothPos.current)
  })

  return (
    <pointLight
      ref={lightRef}
      intensity={0.01}
      color="#f0dca8"
      distance={0.9}
      decay={40}
    />
  )
}

// Point light whose color + intensity tracks the real-world time of day,
// positioned at the window's approximate 3D location (upper-right back wall).
function TimeLight() {
  const [cfg, setCfg] = useState(getTimeConfig)
  useEffect(() => {
    const id = setInterval(() => setCfg(getTimeConfig()), 60_000)
    return () => clearInterval(id)
  }, [])
  return (
    <pointLight
      position={[2.8, 2.5, -2.8]}
      color={cfg.lightColor}
      intensity={cfg.lightIntensity * 5}
      distance={8}
      decay={2}
    />
  )
}

function GarageRoom() {
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}models/garageroom.glb`)
  useEffect(() => { roomSceneRef.current = scene }, [scene])
  return (
    <primitive
      object={scene}
      position={[-0.4, -0.5, 1.3]}
      rotation={[-Math.PI/10, -Math.PI/1.65, 0]}
      scale={6}
    />
  )
}
useGLTF.preload(`${import.meta.env.BASE_URL}models/garageroom.glb`)

export default function Scene() {
  return (
    <>
      <CameraRig />
      <MouseFlashlight />
      <TimeLight />

      {/* Dim ambient — the flashlight is the main interactive light */}
      <ambientLight intensity={0.09} color="#1a2230" />

      {/* Overhead bulb — reduced; sets the mood, flashlight fills */}
      <pointLight
        position={[0, 3.5, -0.5]}
        intensity={38}
        color="#c87030"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.001}
        decay={2}
        distance={10}
      />

      {/* Cool fill from left wall */}
      <pointLight position={[-4, 2.5, 1]} intensity={8} color="#2a5a8a" decay={2} distance={7} />

      <GarageRoom />

      {/* Move this group to position everything inside the room */}
      <group position={[-0.4, -0.5, 1.3]} rotation={[-Math.PI/10, 0, 0]} scale={0.3}>     
        <Table />
        <JournalItem        position={[-1.5,  2.82,  0.45]} rotation={[0,  0.28,  0]} />
        <CharacterSheetItem position={[-1.85,  2.82, 1.8]}  rotation={[0, -0.18,  0]} />
        <MemoriesItem       position={[0.45, 2.95, -1.4]} rotation={[0, -1.5, 0]} />
        <RadioItem          position={[3.6,  3.25, 0.65]}  rotation={[0,  -0.68,  0]} />
        <ArtItem            position={[-2.2,  6.4, -0.6]}  rotation={[0, Math.PI/2.5, 0]} />
      </group>
    </>
  )
}
