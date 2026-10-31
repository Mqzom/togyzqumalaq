import { createContext, useContext, type ReactNode } from 'react'
import { useGame, type GameController } from '../hooks/useGame'

const GameContext = createContext<GameController | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const game = useGame()
  return <GameContext.Provider value={game}>{children}</GameContext.Provider>
}

export function useGameContext() {
  const value = useContext(GameContext)
  if (!value) throw new Error('useGameContext must be used within GameProvider')
  return value
}
