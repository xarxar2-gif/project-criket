import { useState, useEffect } from 'react'
import { getTimeConfig } from '../utils/timeOfDay'

export default function TimeWindow() {
  const [cfg, setCfg] = useState(getTimeConfig)

  useEffect(() => {
    const id = setInterval(() => setCfg(getTimeConfig()), 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="win-wrap">
      {/* Diffuse glow on surrounding wall */}
      <div
        className="win-glow"
        style={{ background: `radial-gradient(ellipse at center, rgba(${cfg.glowRgb},${(cfg.glowA * 0.85).toFixed(2)}) 0%, transparent 68%)` }}
      />
      {/* Light shaft spilling downward into scene */}
      <div
        className="win-shaft"
        style={{ background: `linear-gradient(to bottom, rgba(${cfg.glowRgb},0.13), transparent 60%)` }}
      />
      {/* Sky pane */}
      <div
        className="win-pane"
        style={{ background: `linear-gradient(175deg, ${cfg.skyTop}, ${cfg.skyBot})` }}
      >
        <div className="win-bar win-bar-h" />
        <div className="win-bar win-bar-v" />
      </div>
      {/* Frame overlay */}
      <div className="win-frame" />
    </div>
  )
}
