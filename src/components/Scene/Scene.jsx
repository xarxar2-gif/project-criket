import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, Raycaster, CatmullRomCurve3 } from 'three'
import { useGLTF } from '@react-three/drei'
import { getTimeConfig } from '../../utils/timeOfDay'
import Table from './Table'
import JournalItem from './items/JournalItem'
import CharacterSheetItem from './items/CharacterSheetItem'
import MemoriesItem from './items/MemoriesItem'
import ArtItem from './items/ArtItem'
import RadioItem from './items/RadioItem'
import { useScene } from '../../context/SceneContext'

// ─── Camera ───────────────────────────────────────────────────────────────────
const CAMERA = {
  restPos:    [0, 1.6, 2.8],    // starting / home position
  restLook:   [0, 0.38, -0.1],  // where camera looks at rest
  zoomIn:     4.5,              // lerp speed toward item
  zoomOut:    2.0,              // lerp speed back to rest
  arriveDist: 0.12,             // distance threshold to open overlay
}

// ─── Room ─────────────────────────────────────────────────────────────────────
const ROOM = {
  pos:   [-0.4, -0.5, 1.3],
  rot:   [-Math.PI/10, -Math.PI/1.65, 0],
  scale: 6,
}

// ─── Table group (contains all items) ────────────────────────────────────────
const GROUP = {
  pos:   [-0.4, -0.5, 1.3],
  rot:   [-Math.PI/10, 0, 0],
  scale: 0.3,
}

// ─── Items ────────────────────────────────────────────────────────────────────
// camPath: world-space waypoints the camera follows (CatmullRom spline).
// Tune the mid points for cinematic arcs; start/end are most important.
// camLook: world-space point camera looks at throughout (defaults to item pos).
const ITEMS = {
  journal: {
    pos: [-1.5,  2.82,  0.45], rot: [0,  0.28, 0],
    camPath: [
      [ 0.0,  1.6,  2.8 ],   // rest
      [-0.4,  1.2,  2.1 ],   // arc left, move forward
      [-0.55, 0.75, 1.55],   // arrival — close-up above journal
    ],
  },
  character: {
    pos: [-1.85, 2.82,  1.8], rot: [0, -0.18, 0],
    camPath: [
      [ 0.0,  1.6,  2.8 ],
      [-0.5,  1.3,  2.2 ],   // sweep further left
      [-0.7,  0.85, 1.85],
    ],
  },
  memories: {
    pos: [ 0.45, 2.95, -1.4], rot: [0, -1.5, 0],
    camPath: [
      [0.0,  1.6,  2.8 ],
      [0.1,  1.1,  1.7 ],    // push forward, slight right
      [0.15, 0.65, 1.05],    // close on laptop screen
    ],
  },
  music: {
    pos: [ 3.6,  3.25,  0.65], rot: [0, -0.68, 0],
    camPath: [
      [0.0,  1.6,  2.8 ],
      [0.35, 1.2,  2.1 ],    // arc right
      [0.5,  0.85, 1.6 ],    // face radio front panel
    ],
  },
  art: {
    pos: [-2.2,  6.4,  -0.6], rot: [0, Math.PI/2.5, 0],
    camPath: [
      [ 0.0,  1.6,  2.8],
      [-0.5,  1.5,  1.8],    // glide left, maintain height
      [-0.85, 1.3,  1.1],    // level with polaroids on wall
    ],
  },
}

// ─── Lights ───────────────────────────────────────────────────────────────────
const LIGHTS = {
  ambient:  { intensity: 0.55,  color: '#636363' },
  overhead: { pos: [0, 3.5, -0.5],  intensity: 28, color: '#c87030', distance: 10, decay: 2 },
  fill:     { pos: [-4, 2.5, 1],    intensity: 8,  color: '#2a5a8a', distance: 7,  decay: 2 },
  flash:    { intensity: 0.01, color: '#f0dca8', distance: 0.9, decay: 40 },
}

// ─────────────────────────────────────────────────────────────────────────────

const _restPos  = new Vector3(...CAMERA.restPos)
const _restLook = new Vector3(...CAMERA.restLook)

function CameraRig() {
  const { camera } = useThree()
  const { focusPos, pendingItem, setPendingItem, setActiveItem } = useScene()

  const curPos      = useRef(new Vector3(...CAMERA.restPos))
  const curLook     = useRef(new Vector3(...CAMERA.restLook))
  const tgtPos      = useRef(new Vector3())
  const tgtLook     = useRef(new Vector3())
  const fVec        = useRef(new Vector3())
  const activeItem_  = useRef(null)
  const curCurve     = useRef(null)  // CatmullRomCurve3 for path-based items
  const pathT        = useRef(0)     // 0→1 progress along the path
  const lastPending  = useRef(null)  // guards against re-creating curve every frame

  useEffect(() => {
    camera.position.copy(curPos.current)
    camera.lookAt(curLook.current)
  }, [camera])

  useFrame((_, delta) => {
    if (focusPos) {
      // Build the curve only once when a new item is clicked
      if (pendingItem && pendingItem !== lastPending.current) {
        lastPending.current = pendingItem
        activeItem_.current = ITEMS[pendingItem] ?? null
        const path = activeItem_.current?.camPath
        if (path?.length >= 2) {
          curCurve.current = new CatmullRomCurve3(path.map(p => new Vector3(...p)))
          pathT.current = 0
        } else {
          curCurve.current = null
        }
      }

      const cfg = activeItem_.current
      fVec.current.set(focusPos[0], focusPos[1], focusPos[2])

      if (curCurve.current) {
        // Advance smoothly along the spline (eases in as it nears 1)
        pathT.current += (1 - pathT.current) * CAMERA.zoomIn * delta * 0.5
        curCurve.current.getPoint(Math.min(pathT.current, 1), tgtPos.current)
        curPos.current.copy(tgtPos.current)
      } else if (cfg?.camPos) {
        tgtPos.current.set(...cfg.camPos)
        curPos.current.lerp(tgtPos.current, CAMERA.zoomIn * delta)
      } else {
        tgtPos.current.copy(_restPos).lerp(fVec.current, cfg?.zoom ?? 0.68)
        curPos.current.lerp(tgtPos.current, CAMERA.zoomIn * delta)
      }

      if (cfg?.camLook) {
        tgtLook.current.set(...cfg.camLook)
      } else {
        tgtLook.current.copy(fVec.current)
      }
    } else {
      curCurve.current = null
      pathT.current = 0
      lastPending.current = null
      tgtPos.current.copy(_restPos)
      tgtLook.current.copy(_restLook)
      curPos.current.lerp(tgtPos.current, CAMERA.zoomOut * delta)
    }

    curLook.current.lerp(tgtLook.current, CAMERA.zoomIn * delta)
    camera.position.copy(curPos.current)
    camera.lookAt(curLook.current)

    if (pendingItem && focusPos) {
      const arrived = curCurve.current
        ? pathT.current > 0.96
        : curPos.current.distanceTo(tgtPos.current) < CAMERA.arriveDist
      if (arrived) {
        setActiveItem(pendingItem)
        setPendingItem(null)
      }
    }
  })

  return null
}

const roomSceneRef = { current: null }

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
      intensity={LIGHTS.flash.intensity}
      color={LIGHTS.flash.color}
      distance={LIGHTS.flash.distance}
      decay={LIGHTS.flash.decay}
    />
  )
}

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
      position={ROOM.pos}
      rotation={ROOM.rot}
      scale={ROOM.scale}
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

      <ambientLight intensity={LIGHTS.ambient.intensity} color={LIGHTS.ambient.color} />

      <pointLight
        position={LIGHTS.overhead.pos}
        intensity={LIGHTS.overhead.intensity}
        color={LIGHTS.overhead.color}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.001}
        decay={LIGHTS.overhead.decay}
        distance={LIGHTS.overhead.distance}
      />

      <pointLight
        position={LIGHTS.fill.pos}
        intensity={LIGHTS.fill.intensity}
        color={LIGHTS.fill.color}
        decay={LIGHTS.fill.decay}
        distance={LIGHTS.fill.distance}
      />

      <GarageRoom />

      <group position={GROUP.pos} rotation={GROUP.rot} scale={GROUP.scale}>
        <Table />
        <JournalItem        position={ITEMS.journal.pos}   rotation={ITEMS.journal.rot} />
        <CharacterSheetItem position={ITEMS.character.pos} rotation={ITEMS.character.rot} />
        <MemoriesItem       position={ITEMS.memories.pos}  rotation={ITEMS.memories.rot} />
        <RadioItem          position={ITEMS.music.pos}     rotation={ITEMS.music.rot} />
        <ArtItem            position={ITEMS.art.pos}       rotation={ITEMS.art.rot} />
      </group>
    </>
  )
}
