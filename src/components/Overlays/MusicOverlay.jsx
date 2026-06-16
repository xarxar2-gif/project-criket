import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Put your audio files in /public/audio/ and update src paths
// e.g. { name: 'THE WORKSHOP', freq: '88.5 FM', src: '/audio/station1.mp3' }
const STATIONS = [
  { name: 'THE WORKSHOP', freq: '88.5 FM', src: null },
  { name: 'NIGHT CIRCUIT', freq: '91.3 FM', src: null },
  { name: 'STATIC DREAMS', freq: '94.7 FM', src: null },
  { name: 'UNDERCROFT', freq: '97.1 FM', src: null },
  { name: 'HEXTECH BLUES', freq: '101.5 FM', src: null },
]

const TOTAL = STATIONS.length

export default function MusicOverlay({ onClose }) {
  const [stationIdx, setStationIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const audioRef = useRef(null)

  const station = STATIONS[stationIdx]
  // dial needle position: 0..1 across the track
  const dialPos = stationIdx / (TOTAL - 1)

  useEffect(() => {
    audioRef.current = new Audio()
    audioRef.current.volume = volume
    return () => {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
  }, [])

  const loadStation = (idx, shouldPlay) => {
    const s = STATIONS[idx]
    if (!audioRef.current) return
    audioRef.current.pause()
    if (s.src) {
      audioRef.current.src = s.src
      if (shouldPlay) audioRef.current.play().catch(() => {})
    }
  }

  const handlePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      if (station.src) {
        if (!audioRef.current.src || audioRef.current.src !== window.location.origin + station.src) {
          audioRef.current.src = station.src
        }
        audioRef.current.play().catch(() => {})
      }
      setIsPlaying(true)
    }
  }

  const handleTune = (dir) => {
    const next = (stationIdx + dir + TOTAL) % TOTAL
    setStationIdx(next)
    loadStation(next, isPlaying)
  }

  const handleRewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10)
    }
  }

  const handleFF = () => {
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 10)
    }
  }

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value)
    setVolume(v)
    if (audioRef.current) audioRef.current.volume = v
  }

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
        className="radio-container"
        initial={{ scale: 0.88, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="overlay-close" onClick={onClose}>✕</button>

        <div className="radio-brand">— Criket Audio —</div>

        {/* Display */}
        <div className="radio-display">
          <div className="radio-freq">{station.freq}</div>
          <div className="radio-station-name">{station.name}</div>
          {isPlaying && <div className="radio-on-air">◉ ON AIR</div>}
          {!station.src && (
            <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(58,232,122,0.3)', marginTop: 4, letterSpacing: 1 }}>
              [add audio src to enable playback]
            </div>
          )}
        </div>

        {/* Tuning row */}
        <div className="radio-section">
          <div className="radio-tuning">
            <button className="radio-tune-btn" onClick={() => handleTune(-1)}>‹</button>
            <div className="radio-dial-track">
              <div
                className="radio-dial-needle"
                style={{ left: `${dialPos * 100}%` }}
              />
            </div>
            <button className="radio-tune-btn" onClick={() => handleTune(1)}>›</button>
          </div>

          {/* Cassette slot */}
          <div className="radio-cassette-slot">
            <div className="cassette-body">
              <div className="cassette-window" />
              <div className={`cassette-reel${isPlaying ? ' spinning' : ''}`} />
              <div className={`cassette-reel${isPlaying ? ' spinning' : ''}`} />
            </div>
          </div>
        </div>

        {/* Transport controls */}
        <div className="radio-controls">
          <button className="radio-btn" onClick={handleRewind} title="Rewind 10s">⏮</button>
          <button className="radio-btn play" onClick={handlePlay}>{isPlaying ? '⏸' : '▶'}</button>
          <button className="radio-btn" onClick={handleFF} title="Forward 10s">⏭</button>
        </div>

        {/* Volume */}
        <div className="radio-volume-row">
          <span className="radio-vol-label">Vol</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={volume}
            onChange={handleVolume}
            className="radio-vol-slider"
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
