import { useRef, useEffect, useState, forwardRef } from 'react'
import { motion } from 'framer-motion'
import HTMLFlipBook from 'react-pageflip'
import { JOURNAL_ENTRIES } from '../../data/journal'

// ── Torn-edge clip-path (top edge only) ───────────────────────────────────────
const TORN_TOP = 'polygon(' + [
  '0% 5%','2% 2%','5% 6%','8% 1%','11% 5%','14% 2%','17% 6%',
  '20% 1%','23% 5%','26% 2%','29% 6%','32% 1%','35% 5%',
  '38% 2%','41% 6%','44% 1%','47% 5%','50% 2%','53% 6%',
  '56% 1%','59% 5%','62% 2%','65% 6%','68% 1%','71% 5%',
  '74% 2%','77% 6%','80% 1%','83% 5%','86% 2%','89% 6%',
  '92% 1%','95% 5%','98% 2%','100% 4%',
  '100% 100%','0% 100%',
].join(', ') + ')'

// ── Paper definitions ─────────────────────────────────────────────────────────
// Each paper: dark backing + a placed paper scrap (sized, positioned, tilted)
// LEFT pool  → warm / tactile / "written on"
// RIGHT pool → neutral / display-ready / "photos go here"

const LEFT_PAPERS = [
  {
    key: 'spiral',
    backing: '#0d0b08',
    style: { background: '#f2f0e8' },
    scrap: { w: '86%', h: '96%', top: '1%', left: '7%', tilt: -0.8 },
    padding: '20px 14px 26px 38px',
    lines: 20, lineColor: 'rgba(65,105,200,0.35)',
    features: ['punch-holes', 'red-margin'],
    textColor: '#1a1828',
  },
  {
    key: 'legal',
    backing: '#121008',
    style: { background: 'linear-gradient(180deg, #e6dc50 0%, #dfd648 100%)' },
    scrap: { w: '90%', h: '90%', top: '5%', left: '5%', tilt: 1.4 },
    padding: '18px 14px 22px 46px',
    lines: 17, lineColor: 'rgba(90,82,12,0.28)',
    features: ['red-margin'],
    textColor: '#181806',
  },
  {
    key: 'aged-torn',
    backing: '#100c04',
    style: { background: 'radial-gradient(ellipse at 30% 70%, rgba(80,40,0,0.22) 0%, transparent 55%), linear-gradient(108deg, #b89848 0%, #c4a450 100%)' },
    scrap: { w: '97%', h: '83%', top: '13%', left: '1%', tilt: -1.9, clipPath: TORN_TOP },
    padding: '26px 14px 22px 16px',
    lines: 13, lineColor: 'rgba(60,35,5,0.20)',
    features: [],
    textColor: '#1a0c02',
  },
  {
    key: 'kraft',
    backing: '#0a0806',
    style: { background: 'linear-gradient(135deg, #7a5a2e 0%, #8b6838 60%, #7e6030 100%)' },
    scrap: { w: '100%', h: '100%', top: '0%', left: '0%', tilt: 0 },
    padding: '34px 26px 42px',
    lines: 0, lineColor: null,
    features: [],
    textColor: '#f0d8a8',
  },
]

const RIGHT_PAPERS = [
  {
    key: 'loose-leaf',
    backing: '#0d0b08',
    style: { background: '#eceae0' },
    scrap: { w: '93%', h: '97%', top: '1%', left: '1%', tilt: 0.7 },
    padding: '20px 14px 28px 44px',
    lines: 21, lineColor: 'rgba(65,95,190,0.28)',
    features: ['punch-holes', 'blue-margin'],
    textColor: '#1a1a2e',
  },
  {
    key: 'grid',
    backing: '#0d0b08',
    style: {
      backgroundColor: '#e8e6dc',
      backgroundImage: [
        'repeating-linear-gradient(rgba(85,95,170,0.20) 0px, rgba(85,95,170,0.20) 1px, transparent 1px, transparent 22px)',
        'repeating-linear-gradient(90deg, rgba(85,95,170,0.20) 0px, rgba(85,95,170,0.20) 1px, transparent 1px, transparent 22px)',
      ].join(', '),
    },
    scrap: { w: '100%', h: '100%', top: '0%', left: '0%', tilt: 0 },
    padding: '26px 18px 34px',
    lines: 0, lineColor: null,
    features: [],
    textColor: '#1a1a2a',
  },
  {
    key: 'index-card',
    backing: '#14100a',
    style: { background: '#f8f4ec' },
    scrap: { w: '80%', h: '57%', top: '21%', left: '10%', tilt: 3.0 },
    padding: '12px 10px 16px',
    lines: 10, lineColor: 'rgba(200,50,50,0.32)',
    features: ['card-border'],
    textColor: '#1a1208',
  },
  {
    key: 'manila',
    backing: '#0e0c08',
    style: { background: 'linear-gradient(112deg, #d5cc78 0%, #cdc470 100%)' },
    scrap: { w: '96%', h: '95%', top: '2%', left: '2%', tilt: -0.9 },
    padding: '28px 20px 36px',
    lines: 0, lineColor: null,
    features: [],
    textColor: '#282006',
  },
]

const ALL_PAPERS = Object.fromEntries(
  [...LEFT_PAPERS, ...RIGHT_PAPERS].map(p => [p.key, p])
)

const getPaper = (entry, right) => {
  if (entry.paper && ALL_PAPERS[entry.paper]) return ALL_PAPERS[entry.paper]
  return (right ? RIGHT_PAPERS : LEFT_PAPERS)[entry.id % 4]
}

// ── Layout helpers ────────────────────────────────────────────────────────────
const ALIGN_OPTS = ['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right']
const SIZE_OPTS  = ['small', 'medium', 'large']
const TAPE_OPTS  = ['top', 'corners', 'side', 'none']
const IMAGE_DIMS = { small: [230, 270], medium: [285, 340], large: [320, 400] }
const ALIGN_FLEX = {
  'center':       { justifyContent: 'center',     alignItems: 'center'     },
  'top-left':     { justifyContent: 'flex-start', alignItems: 'flex-start' },
  'top-right':    { justifyContent: 'flex-end',   alignItems: 'flex-start' },
  'bottom-left':  { justifyContent: 'flex-start', alignItems: 'flex-end'   },
  'bottom-right': { justifyContent: 'flex-end',   alignItems: 'flex-end'   },
}

const getAlign    = (e) => e.imageAlign ?? ALIGN_OPTS[(e.id * 7 + 3) % ALIGN_OPTS.length]
const getSize     = (e) => e.imageSize  ?? SIZE_OPTS [(e.id * 7 + 1) % SIZE_OPTS.length]
const getTape     = (e) => TAPE_OPTS[(e.id * 11) % TAPE_OPTS.length]
const getRotation = (e) => ((e.id * 13) % 20) - 10

// ── Decorative features ───────────────────────────────────────────────────────
function PunchHoles() {
  return (
    <div style={{
      position: 'absolute', left: 10, top: 0, bottom: 0,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly',
      pointerEvents: 'none', zIndex: 3,
    }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 13, height: 13, borderRadius: '50%',
          background: 'rgba(0,0,0,0.18)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.08)',
        }} />
      ))}
    </div>
  )
}

function RedMargin() {
  return <div style={{ position: 'absolute', left: 34, top: 0, bottom: 0, width: 1.5, background: 'rgba(195,55,55,0.42)', pointerEvents: 'none', zIndex: 2 }} />
}

function BlueMargin() {
  return <div style={{ position: 'absolute', left: 38, top: 0, bottom: 0, width: 1.5, background: 'rgba(55,95,210,0.35)', pointerEvents: 'none', zIndex: 2 }} />
}

function CardBorder() {
  return <div style={{ position: 'absolute', inset: 0, border: '1.5px solid rgba(140,110,70,0.40)', pointerEvents: 'none', zIndex: 2 }} />
}

function PageLines({ count, lineColor }) {
  if (!count) return null
  return (
    <div className="journal-flip-lines" style={{ justifyContent: 'flex-start', gap: `calc((100% - ${count}px) / ${count - 1})` }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="journal-flip-line" style={lineColor ? { background: lineColor } : undefined} />
      ))}
    </div>
  )
}

function Tape({ config }) {
  const base = { position: 'absolute', background: 'rgba(215,205,170,0.70)', zIndex: 4 }
  if (config === 'top')     return <div style={{ ...base, top: -9, left: '50%', width: 52, height: 14, transform: 'translateX(-50%) rotate(-1.5deg)' }} />
  if (config === 'corners') return <>
    <div style={{ ...base, top: -8, left: 4,  width: 36, height: 12, transform: 'rotate(-28deg)', borderRadius: 1 }} />
    <div style={{ ...base, top: -8, right: 4, width: 36, height: 12, transform: 'rotate(28deg)',  borderRadius: 1 }} />
  </>
  if (config === 'side')    return <div style={{ ...base, left: -8, top: '35%', width: 50, height: 13, transform: 'translateY(-50%) rotate(90deg)' }} />
  return null
}

// ── Page components ───────────────────────────────────────────────────────────
// Blank page — matches the leather backing so it's invisible when paired with the cover
const EmptyPage = forwardRef((_, ref) => (
  <div ref={ref} style={{ width: '100%', height: '100%', background: '#1a0e04' }} />
))
EmptyPage.displayName = 'EmptyPage'

const CoverPage = forwardRef((_, ref) => (
  <div ref={ref} className="journal-flip-cover">
    <div className="journal-flip-cover-inner">
      <div className="journal-flip-cover-title">Journal</div>
      <div className="journal-flip-cover-rule" />
    </div>
  </div>
))
CoverPage.displayName = 'CoverPage'

const LeftPage = forwardRef(({ entry, pageNum }, ref) => {
  const p = getPaper(entry, false)
  const { w, h, top, left, tilt, clipPath } = p.scrap
  return (
    <div ref={ref} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: p.backing }}>
      {/* paper scrap */}
      <div style={{
        position: 'absolute',
        width: w, height: h, top, left,
        transform: `rotate(${tilt}deg)`,
        clipPath: clipPath || undefined,
        boxShadow: '3px 5px 18px rgba(0,0,0,0.55)',
        ...(p.bgSrc
          ? { backgroundImage: `url(${p.bgSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : p.style),
      }}>
        <PageLines count={p.lines} lineColor={p.lineColor} />
        {p.features.includes('punch-holes') && <PunchHoles />}
        {p.features.includes('red-margin')  && <RedMargin />}
        {p.features.includes('blue-margin') && <BlueMargin />}
        {p.features.includes('card-border') && <CardBorder />}

        <div style={{ padding: p.padding, position: 'relative', zIndex: 1, height: '100%', boxSizing: 'border-box' }}>
          <p className="journal-date" style={{ color: p.textColor }}>{entry.date}</p>
          {entry.title && (
            <p className="journal-date" style={{ marginTop: 8, fontWeight: 'bold', fontStyle: 'normal', color: p.textColor }}>
              {entry.title}
            </p>
          )}
          {entry.caption && (
            <p className="journal-flip-caption" style={{ color: p.textColor }}>{entry.caption}</p>
          )}
        </div>
      </div>
      <span className="journal-page-number" style={{ position: 'absolute', bottom: 14, left: 24, color: 'rgba(180,150,100,0.35)' }}>{pageNum}</span>
    </div>
  )
})
LeftPage.displayName = 'LeftPage'

const RightPage = forwardRef(({ entry, pageNum }, ref) => {
  const p = getPaper(entry, true)
  const { w, h, top, left, tilt, clipPath } = p.scrap
  const [imgW, imgH] = IMAGE_DIMS[getSize(entry)]
  const tape = getTape(entry)
  const rot  = getRotation(entry)
  const flexAlign = ALIGN_FLEX[getAlign(entry)]

  return (
    <div ref={ref} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: p.backing }}>
      <div style={{
        position: 'absolute',
        width: w, height: h, top, left,
        transform: `rotate(${tilt}deg)`,
        clipPath: clipPath || undefined,
        boxShadow: '3px 5px 18px rgba(0,0,0,0.55)',
        ...(p.bgSrc
          ? { backgroundImage: `url(${p.bgSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : p.style),
      }}>
        <PageLines count={p.lines} lineColor={p.lineColor} />
        {p.features.includes('punch-holes') && <PunchHoles />}
        {p.features.includes('card-border') && <CardBorder />}

        <div style={{
          padding: p.padding,
          position: 'relative', zIndex: 1,
          height: '100%', boxSizing: 'border-box',
          display: 'flex', alignItems: flexAlign.alignItems, justifyContent: flexAlign.justifyContent,
        }}>
          <div className="journal-flip-photo-frame" style={{ transform: `rotate(${rot}deg)`, flexShrink: 0 }}>
            <Tape config={tape} />
            {entry.src
              ? <img className="journal-flip-photo-img"
                  style={{ width: imgW, height: imgH, maxWidth: '100%', objectFit: 'cover', display: 'block' }}
                  src={entry.src} alt={entry.caption || ''} />
              : <div className="journal-flip-photo-placeholder"
                  style={{ width: imgW, height: imgH, maxWidth: '100%' }}>
                  no image yet
                </div>
            }
          </div>
        </div>
      </div>
      <span className="journal-page-number" style={{ position: 'absolute', bottom: 14, right: 24, color: 'rgba(180,150,100,0.35)' }}>{pageNum}</span>
    </div>
  )
})
RightPage.displayName = 'RightPage'

// ── Overlay ───────────────────────────────────────────────────────────────────
export default function JournalOverlay({ onClose }) {
  const bookRef = useRef(null)
  const mouseDownOnBackdrop = useRef(false)
  const [bookOpen, setBookOpen] = useState(false)

  useEffect(() => {
    // +2 offset: page 0 = EmptyPage, page 1 = CoverPage, entries start at page 2
    const lastPage = JOURNAL_ENTRIES.length * 2
    const t = setTimeout(() => {
      bookRef.current?.pageFlip()?.flip(lastPage, 'top')
      setBookOpen(true)
    }, 150)
    return () => clearTimeout(t)
  }, [])

  const prev = () => bookRef.current?.pageFlip()?.flipPrev()
  const next = () => bookRef.current?.pageFlip()?.flipNext()

  return (
    <motion.div
      className="overlay-backdrop"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onMouseDown={(e) => { mouseDownOnBackdrop.current = e.target === e.currentTarget }}
      onClick={() => { if (mouseDownOnBackdrop.current) onClose() }}
    >
      <motion.div
        style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
        initial={{ scale: 0.88, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 24 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="journal-book-outer">
          <div className="journal-book-backing" style={{ opacity: bookOpen ? 1 : 0, transition: 'opacity 0.4s' }} />
          <div className="journal-book-wrap">
            <HTMLFlipBook
              ref={bookRef}
              width={370} height={520}
              size="fixed"
              usePortrait={false}
              drawShadow maxShadowOpacity={0.5}
              mobileScrollSupport={false}
              className="journal-flipbook"
              onFlip={(e) => setBookOpen(e.data > 1)}
            >
              <EmptyPage />
              <CoverPage />
              {JOURNAL_ENTRIES.flatMap((entry, i) => [
                <LeftPage  key={`l-${entry.id}`} entry={entry} pageNum={i * 2 + 2} />,
                <RightPage key={`r-${entry.id}`} entry={entry} pageNum={i * 2 + 3} />,
              ])}
            </HTMLFlipBook>
          </div>
        </div>

        <div className="journal-flip-nav">
          <button className="journal-nav-btn" onClick={prev}>◂</button>
          <button className="journal-nav-btn" onClick={next}>▸</button>
        </div>
        <button className="overlay-close" onClick={onClose}>✕</button>
      </motion.div>
    </motion.div>
  )
}
