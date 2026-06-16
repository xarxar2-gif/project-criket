// Keyframes: [hour, skyTop, skyBot, glowR, glowG, glowB, glowA, lightColor, lightIntensity]
const KEYS = [
  [0,  '#010208', '#02050e',  15,  25,  75, 0.10, '#0a1840', 0.5],
  [5,  '#180320', '#601828', 170,  55,  65, 0.18, '#ff6040', 1.2],
  [6,  '#3c0a0e', '#c84c28', 215,  80,  30, 0.40, '#ff9050', 3.0],
  [8,  '#14264c', '#4878c8', 130, 175, 240, 0.28, '#fff0d8', 4.5],
  [12, '#142e66', '#3465c0', 145, 190, 255, 0.25, '#f0f8ff', 5.0],
  [16, '#14264c', '#486878', 120, 160, 195, 0.22, '#fff0d0', 4.0],
  [18, '#380c04', '#cc6028', 225, 110,  40, 0.42, '#ff8030', 3.5],
  [20, '#1c0616', '#6a2018', 165,  62,  42, 0.26, '#c04060', 1.5],
  [23, '#010208', '#02050e',  15,  25,  75, 0.10, '#0a1840', 0.5],
]

function hexRgb(h) {
  const n = parseInt(h.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function lerp(a, b, t) { return a + (b - a) * t }

export function lerpHex(a, b, t) {
  const [ar,ag,ab] = hexRgb(a), [br,bg,bb] = hexRgb(b)
  return `rgb(${Math.round(lerp(ar,br,t))},${Math.round(lerp(ag,bg,t))},${Math.round(lerp(ab,bb,t))})`
}

export function getTimeConfig() {
  const now  = new Date()
  const frac = now.getHours() + now.getMinutes() / 60

  let ai = KEYS.length - 2, bi = KEYS.length - 1
  for (let i = 0; i < KEYS.length - 1; i++) {
    if (frac >= KEYS[i][0] && frac < KEYS[i + 1][0]) { ai = i; bi = i + 1; break }
  }

  const t  = Math.max(0, Math.min(1, (frac - KEYS[ai][0]) / Math.max(0.001, KEYS[bi][0] - KEYS[ai][0])))
  const a  = KEYS[ai], b = KEYS[bi]
  const gr = Math.round(lerp(a[3], b[3], t))
  const gg = Math.round(lerp(a[4], b[4], t))
  const gb = Math.round(lerp(a[5], b[5], t))
  const ga = lerp(a[6], b[6], t)

  return {
    skyTop:        lerpHex(a[1], b[1], t),
    skyBot:        lerpHex(a[2], b[2], t),
    glowRgb:       `${gr},${gg},${gb}`,
    glowA:         ga,
    lightColor:    lerpHex(a[7], b[7], t),
    lightIntensity: lerp(a[8], b[8], t),
  }
}
