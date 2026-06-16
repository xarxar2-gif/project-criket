import { useRef } from 'react'
import { Vector3, Quaternion } from 'three'
import { useScene } from '../../context/SceneContext'

const IDENTITY_Q = new Quaternion()

/**
 * Tilts the referenced group so `faceNormal` points toward the camera
 * while this item is pending/active.
 *
 * faceNormal — local axis that should face the camera:
 *   new Vector3(0, 1, 0)  → top face (flat items on table)
 *   new Vector3(0, 0, 1)  → front face (radio, laptop, wall art)
 *
 * tiltAmount — 0 = no rotation, 1 = fully face camera  (default 0.85)
 */
export function useZoomTilt(itemKey, faceNormal, tiltAmount = 0.85) {
  const { pendingItem, activeItem } = useScene()
  const isActive = pendingItem === itemKey || activeItem === itemKey

  const ref     = useRef()
  const _outerQ = useRef(new Quaternion())
  const _invQ   = useRef(new Quaternion())
  const _wp     = useRef(new Vector3())
  const _dir    = useRef(new Vector3())
  const _ldir   = useRef(new Vector3())
  const _fullQ  = useRef(new Quaternion())
  const _tgtQ   = useRef(new Quaternion())

  const tick = (state, delta) => {
    if (!ref.current) return
    if (isActive) {
      // World position of this node
      ref.current.getWorldPosition(_wp.current)
      // Direction from item → camera (world space), normalised
      _dir.current.subVectors(state.camera.position, _wp.current).normalize()
      // Transform direction into the outer group's local space
      ref.current.parent.getWorldQuaternion(_outerQ.current)
      _invQ.current.copy(_outerQ.current).invert()
      _ldir.current.copy(_dir.current).applyQuaternion(_invQ.current)
      // Quaternion that rotates faceNormal → local camera direction
      _fullQ.current.setFromUnitVectors(faceNormal, _ldir.current)
      // Blend toward it (tiltAmount lets you dial in less-than-full rotation)
      _tgtQ.current.copy(IDENTITY_Q).slerp(_fullQ.current, tiltAmount)
      ref.current.quaternion.slerp(_tgtQ.current, 4.5 * delta)
    } else {
      ref.current.quaternion.slerp(IDENTITY_Q, 3.0 * delta)
    }
  }

  return { ref, tick }
}
