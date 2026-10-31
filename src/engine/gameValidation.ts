import type { GameState } from './gameTypes'
import { PIT_COUNT, totalStones } from './gameRules'

export function validateState(state: GameState, expectedTotal?: number): string[] {
  const errors: string[] = []

  for (const side of [0, 1] as const) {
    if (state.pits[side].length !== PIT_COUNT) {
      errors.push(`side ${side} should have ${PIT_COUNT} pits`)
    }
    state.pits[side].forEach((count, index) => {
      if (!Number.isInteger(count) || count < 0) {
        errors.push(`negative or invalid stones at ${side}:${index}`)
      }
    })
    const tuz = state.tuz[side]
    if (tuz !== null) {
      if (tuz < 0 || tuz > 7) errors.push(`illegal tuz index ${tuz} for player ${side}`)
      const host = side === 0 ? 1 : 0
      if ((state.pits[host][tuz] ?? 0) !== 0) {
        errors.push(`tuz pit ${side}:${tuz} is not empty`)
      }
    }
  }

  if (state.tuz[0] !== null && state.tuz[0] === state.tuz[1]) {
    errors.push('symmetric tuzdyk pair')
  }

  if (state.kazan[0] < 0 || state.kazan[1] < 0) errors.push('negative kazan')

  if (expectedTotal !== undefined && totalStones(state) !== expectedTotal) {
    errors.push(`stone total ${totalStones(state)} !== ${expectedTotal}`)
  }

  if (state.phase === 'over' && state.winner === null) errors.push('finished without a result')
  if (state.phase === 'playing' && state.winner !== null) errors.push('result during play')

  return errors
}
