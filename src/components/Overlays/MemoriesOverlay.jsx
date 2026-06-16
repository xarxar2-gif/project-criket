import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Replace color with imageSrc: '/images/memory-1.jpg' when assets are ready
const MEMORIES = [
  { id: 1, label: 'Memory_001', color: '#0a1a0e', imageSrc: null },
  { id: 2, label: 'Memory_002', color: '#0e0a1a', imageSrc: null },
  { id: 3, label: 'Memory_003', color: '#1a0a0a', imageSrc: null },
  { id: 4, label: 'Memory_004', color: '#0a1218', imageSrc: null },
  { id: 5, label: 'Memory_005', color: '#141a0a', imageSrc: null },
  { id: 6, label: 'Memory_006', color: '#1a140a', imageSrc: null },
  { id: 7, label: 'Memory_007', color: '#0a1a14', imageSrc: null },
  { id: 8, label: 'Memory_008', color: '#180a10', imageSrc: null },
  { id: 9, label: 'Memory_009', color: '#0e1418', imageSrc: null },
]

export default function MemoriesOverlay({ onClose }) {
  const [selected, setSelected] = useState(null)
  const active = selected !== null ? MEMORIES.find(m => m.id === selected) : null

  return (
    <motion.div
      className="overlay-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onClick={onClose}
    >
      <motion.div
        className="memories-container"
        initial={{ scale: 0.88, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="memories-crt">
          <div className="memories-scanlines" />
          <div className="memories-vignette" />

          <div className="memories-header">
            <span className="memories-title">// MEMORY_ARCHIVE //&nbsp;</span>
            <span className="memories-cursor">█</span>
          </div>

          <div className="memories-grid">
            {MEMORIES.map((mem) => (
              <div key={mem.id} className="memory-card" onClick={() => setSelected(mem.id)}>
                <div className="memory-thumbnail" style={{ background: mem.color }}>
                  {mem.imageSrc ? (
                    <img src={mem.imageSrc} alt={mem.label} />
                  ) : (
                    <span className="memory-thumbnail-placeholder">[{mem.label}]</span>
                  )}
                </div>
                <span className="memory-label">{mem.label}</span>
              </div>
            ))}
          </div>

          {/* Lightbox */}
          <AnimatePresence>
            {active && (
              <motion.div
                className="memory-lightbox"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  className="memory-lightbox-close"
                  onClick={(e) => { e.stopPropagation(); setSelected(null) }}
                >✕</button>
                <div className="memory-lightbox-inner">
                  {active.imageSrc ? (
                    <img src={active.imageSrc} alt={active.label} />
                  ) : (
                    <div className="memory-lightbox-placeholder" style={{ background: active.color }}>
                      [{active.label}]
                    </div>
                  )}
                  <span className="memory-lightbox-label">{active.label}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CRT bezel base */}
        <div className="memories-bezel">
          <div className="memories-bezel-dot active" />
          <div className="memories-bezel-dot" />
          <div className="memories-bezel-dot" />
        </div>

        <button className="overlay-close" onClick={onClose}>✕</button>
      </motion.div>
    </motion.div>
  )
}
