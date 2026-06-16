import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import Scene from './components/Scene/Scene'
import OverlayContainer from './components/Overlays/OverlayContainer'
import TimeWindow from './components/TimeWindow'
import DustParticles from './components/DustParticles'
import LoadingScreen from './components/LoadingScreen'
import { SceneProvider } from './context/SceneContext'

export default function App() {
  return (
    <SceneProvider>
      <div className="app-root">

        {/* Layer 0 — 2D background (window + future: falling bolts, dripping oil, etc.) */}
        <div className="layer-bg">
          <TimeWindow />
        </div>

        {/* Layer 1 — 3D interactive scene (transparent canvas) */}
        <Canvas
          shadows="percentage"
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          camera={{ fov: 65, position: [0, 1.6, 2.8] }}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>

        {/* Layer 2 — dust particle overlay */}
        <DustParticles />

        {/* Layer 3 — item overlays (journal, character sheet, etc.) */}
        <OverlayContainer />

        {/* Layer 4 — loading screen, fades out once assets are ready */}
        <LoadingScreen />

      </div>
    </SceneProvider>
  )
}
