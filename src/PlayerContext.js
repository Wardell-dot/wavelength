import { createContext, useContext } from 'react'

export const PlayerContext = createContext(null)

export function usePlayerContext() {
  return useContext(PlayerContext)
}