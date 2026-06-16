import { motion } from 'framer-motion'

// ── Replace all [PLACEHOLDER] values with real character data ──
const CHARACTER = {
  name: '[CHARACTER NAME]',
  alias: '[ALIAS / NICKNAME]',
  age: '[AGE]',
  occupation: '[OCCUPATION / ROLE]',
  affiliation: '[FACTION / GROUP]',
  status: 'ACTIVE',
  threat: 'HIGH',
  caseNo: '████-████',
  notes: `[Replace with background notes. What does this file say about the character?

Write in the dry, clinical language of an investigator who doesn't quite understand what they're dealing with. Redacted lines work well here — things the subject clearly did but the agency doesn't want on record.

Known associates: [████████], [████]
Last confirmed location: [LOCATION]
Warning: Subject is considered [████████]. Approach with caution.]`,
  photoSrc: null, // set to '/images/character.jpg' when ready
}

export default function CharacterSheetOverlay({ onClose }) {
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
        className="charsheet-container"
        initial={{ scale: 0.9, opacity: 0, rotateX: 4 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative' }}
      >
        <button className="overlay-close" onClick={onClose}>✕</button>

        {/* Stamps */}
        <div className="charsheet-stamps">
          <span className="charsheet-stamp danger">DANGEROUS</span>
          <span className="charsheet-stamp active">{CHARACTER.status}</span>
        </div>

        <div className="charsheet-header">
          <div className="charsheet-agency">Department of ████████████ — Investigations Division</div>
          <div className="charsheet-title">Subject File</div>
          <div className="charsheet-case">Case No. {CHARACTER.caseNo} &nbsp;|&nbsp; Classification: RESTRICTED</div>
        </div>

        <div className="charsheet-body">
          {/* Photo */}
          <div className="charsheet-photo-box">
            {CHARACTER.photoSrc ? (
              <img src={CHARACTER.photoSrc} alt="Subject photograph" />
            ) : (
              <>
                <span className="charsheet-photo-label">Photograph</span>
                <span className="charsheet-photo-label">Attached</span>
              </>
            )}
          </div>

          {/* Fields */}
          <div className="charsheet-fields">
            {[
              ['Full Name', CHARACTER.name],
              ['Known Alias', CHARACTER.alias],
              ['Age', CHARACTER.age],
              ['Occupation', CHARACTER.occupation],
              ['Affiliation', CHARACTER.affiliation],
              ['Threat Level', CHARACTER.threat],
            ].map(([label, val]) => (
              <div key={label} className="charsheet-field">
                <span className="charsheet-label">{label}</span>
                <span className="charsheet-value">{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="charsheet-notes-section">
          <div className="charsheet-notes-label">Case Notes / Field Summary</div>
          <p className="charsheet-notes-text">{CHARACTER.notes}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}
