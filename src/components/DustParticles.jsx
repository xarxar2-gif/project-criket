import { useEffect, useRef } from 'react'

const COUNT = 800

function makeParticle(w, h, life = null) {
  return {
    x:         Math.random() * w,
    y:         Math.random() * h,
    r:         Math.random() * 1.1 + 0.35,
    maxA:      Math.random() * 0.28 + 0.04,
    dx:        (Math.random() - 0.5) * 0.18,
    dy:        Math.random() * 0.10 + 0.032,
    phase:     Math.random() * Math.PI * 2,
    freq:      (Math.random() - 0.5) * 0.009,
    life:      life ?? Math.random(),           // stagger start so they don't all sync
    lifeSpeed: Math.random() * 0.0022 + 0.0006, // each particle lives 7–28 s
  }
}

export default function DustParticles() {
  const ref = useRef()

  useEffect(() => {
    const canvas = ref.current
    const ctx    = canvas.getContext('2d')

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let pts = Array.from({ length: COUNT }, () =>
      makeParticle(window.innerWidth, window.innerHeight)
    )

    let raf
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const { width: w, height: h } = canvas

      for (const p of pts) {
        // Advance lifecycle
        p.life += p.lifeSpeed
        if (p.life >= 1) {
          // Respawn with fresh size/speed at a new random position
          Object.assign(p, makeParticle(w, h, 0))
          continue
        }

        // sin curve: 0 → peak → 0 over the lifetime
        const alpha = Math.sin(p.life * Math.PI) * p.maxA

        // Drift
        p.phase += p.freq
        p.x += p.dx + Math.sin(p.phase) * 0.11
        p.y += p.dy
        if (p.y > h + 4) p.y = -4
        if (p.x < -4)    p.x = w + 4
        if (p.x > w + 4) p.x = -4

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(215,195,155,${alpha.toFixed(3)})`
        ctx.fill()
      }

      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}
    />
  )
}
