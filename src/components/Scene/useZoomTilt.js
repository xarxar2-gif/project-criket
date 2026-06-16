import { useRef } from 'react'
import { Vector3, Quaternion } from 'three'
import { useScene } from '../../context/SceneContext'

const IDENTITY_Q = new Quaternion()

/**
 * Rotates the referenced group so `faceNormal` points toward the camera,
 * tied directly to the camera's zoom progress so they arrive together.
 *
 * faceNormal — local axis that should face the camera:
 *   new Vector3(0, 1, 0)  → top face (flat items on table)
 *   new Vector3(0, 0, 1)  → front face (radio, laptop, wall art)
 *
 * tiltAmount — 0 = no rotation, 1 = fully face camera  (default 1.0)
 */
export function useZoomTilt(itemKey, faceNormal, tiltAmount = 1.0) {
  const { pendingItem, activeItem, zoomProgress } = useScene()
  const isActive = pendingItem === itemKey || activeItem === itemKey

  const ref      = useRef()
  const _outerQ  = useRef(new Quaternion())
  const _invQ    = useRef(new Quaternion())
  const _wp      = useRef(new Vector3())
  const _dir     = useRef(new Vector3())
  const _ldir    = useRef(new Vector3())
  const _fullQ   = useRef(new Quaternion())
  const wasActive = useRef(false)

  const tick = (state) => {
    if (!ref.current) return

    if (isActive) {
      wasActive.current = true
      // Recompute target rotation from current camera position
      ref.current.getWorldPosition(_wp.current)
      _dir.current.subVectors(state.camera.position, _wp.current).normalize()
      ref.current.parent.getWorldQuaternion(_outerQ.current)
      _invQ.current.copy(_outerQ.current).invert()
      _ldir.current.copy(_dir.current).applyQuaternion(_invQ.current)
      _fullQ.current.setFromUnitVectors(faceNormal, _ldir.current)
    }

    if (isActive || wasActive.current) {
      // Drive rotation directly from zoom progress — arrives exactly when camera does
      const blend = tiltAmount * zoomProgress.current
      ref.current.quaternion.copy(IDENTITY_Q).slerp(_fullQ.current, blend)
      // Once progress has returned fully to 0, stop tracking
      if (!isActive && zoomProgress.current < 0.001) {
        wasActive.current = false
        ref.current.quaternion.copy(IDENTITY_Q)
      }
    } else {
      ref.current.quaternion.copy(IDENTITY_Q)
    }
  }

  return { ref, tick }
}
