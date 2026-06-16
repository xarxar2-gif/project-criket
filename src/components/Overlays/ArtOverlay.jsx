import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Replace color with imageSrc: '/images/art-1.jpg' when assets are ready
const POLAROIDS = [
  { id: 1, title: '[Title]', date: '[DATE]', color: '#2a3a28', imageSrc: null, rot: -9 },
  { id: 2, title: '[Title]', date: '[DATE]', color: '#28283a', imageSrc: null, rot: 4 },
  { id: 3, title: '[Title]', date: '[DATE]', color: '#3a2828', imageSrc: null, rot: -3 },
  { id: 4, title: '[Title]', date: '[DATE]', color: '#2a3830', imageSrc: null, rot: 8 },
  { id: 5, title: '[Title]', date: '[DATE]', color: '#382a28', imageSrc: null, rot: -6 },
  { id: 6, title: '[Title]', date: '[DATE]', color: '#28302a', imageSrc: null, rot: 2 },
]

export default function ArtOverlay({ onClose }) {
  const [selected, setSelected] = useState(null)
  const activePola = selected !== null ? POLAROIDS.find(p => p.id === selected) : null

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
        className="art-container"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {POLAROIDS.map((p) => (
          <motion.div
            key={p.id}
            className="polaroid"
            style={{ rotate: p.rot }}
            whileHover={{ scale: 1.06, zIndex: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => setSelected(p.id)}
          >
            <div className="polaroid-photo" style={{ background: p.color }}>
              {p.imageSrc ? (
                <img src={p.imageSrc} alt={p.title} />
              ) : (
                <div className="polaroid-photo-placeholder">image</div>
              )}
            </div>
            <div className="polaroid-caption">{p.title}</div>
          </motion.div>
        ))}

        <button className="overlay-close" onClick={onClose}>✕</button>

        {/* Lightbox */}
        <AnimatePresence>
          {activePola && (
            <motion.div
              className="polaroid-lightbox-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelected(null)}
            >
              <motion.div
                className="polaroid-lightbox-frame"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="polaroid-photo" style={{ width: 'min(400px,70vw)', height: 'min(400px,70vw)', background: activePola.color }}>
                  {activePola.imageSrc ? (
                    <img src={activePola.imageSrc} alt={activePola.title} />
                  ) : (
                    <div className="polaroid-photo-placeholder">image</div>
                  )}
                </div>
                <div className="polaroid-caption" style={{ fontSize: 14, marginTop: 6 }}>{activePola.title}</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
