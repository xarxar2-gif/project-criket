import { createContext, useContext, useState } from 'react'

const SceneContext = createContext(null)

export function SceneProvider({ children }) {
  const [activeItem,  setActiveItem]  = useState(null)
  const [focusPos,    setFocusPos]    = useState(null) // [x,y,z] of the clicked item
  const [pendingItem, setPendingItem] = useState(null) // overlay key waiting for camera to arrive
  return (
    <SceneContext.Provider value={{ activeItem, setActiveItem, focusPos, setFocusPos, pendingItem, setPendingItem }}>
      {children}
    </SceneContext.Provider>
  )
}

export const useScene = () => useContext(SceneContext)
