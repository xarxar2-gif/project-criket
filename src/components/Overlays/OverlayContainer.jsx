import { AnimatePresence } from 'framer-motion'
import { useScene } from '../../context/SceneContext'
import JournalOverlay from './JournalOverlay'
import CharacterSheetOverlay from './CharacterSheetOverlay'
import MemoriesOverlay from './MemoriesOverlay'
import ArtOverlay from './ArtOverlay'
import MusicOverlay from './MusicOverlay'

const OVERLAYS = {
  journal: JournalOverlay,
  character: CharacterSheetOverlay,
  memories: MemoriesOverlay,
  art: ArtOverlay,
  music: MusicOverlay,
}

export default function OverlayContainer() {
  const { activeItem, setActiveItem, setFocusPos, setPendingItem } = useScene()
  const Active = activeItem ? OVERLAYS[activeItem] : null

  return (
    <AnimatePresence>
      {Active && (
        <Active key={activeItem} onClose={() => { setActiveItem(null); setFocusPos(null); setPendingItem(null) }} />
      )}
    </AnimatePresence>
  )
}
