import type { GameState, PlayerId } from './gameTypes'

export const PIT_COUNT = 9
export const INITIAL_PER_PIT = 9
export const TOTAL_STONES = PIT_COUNT * 2 * INITIAL_PER_PIT
export const WIN_SCORE = 82
export const DRAW_SCORE = 81

export const CYCLE: Array<[PlayerId, number]> = []
for (let player = 0; player < 2; player += 1) {
  for (let pit = 0; pit < PIT_COUNT; pit += 1) {
    CYCLE.push([player as PlayerId, pit])
  }
}

export function opponentOf(player: PlayerId): PlayerId {
  return player === 0 ? 1 : 0
}

export function cycleIndex(player: PlayerId, pit: number): number {
  return player === 0 ? pit : PIT_COUNT + pit
}

/** Who owns this pit as a tuzdyk, if anyone. The tuz sits on the opponent's row. */
export function tuzOwner(state: GameState, side: PlayerId, pit: number): PlayerId | null {
  const owner = opponentOf(side)
  return state.tuz[owner] === pit ? owner : null
}

export function isTuzPit(state: GameState, side: PlayerId, pit: number): boolean {
  return tuzOwner(state, side, pit) !== null
}

export function totalStones(state: GameState): number {
  let sum = state.kazan[0] + state.kazan[1]
  for (const side of state.pits) {
    for (const count of side) sum += count
  }
  return sum
}

export function hasLegalMove(state: GameState, player: PlayerId): boolean {
  if (state.phase !== 'playing') return false
  for (let pit = 0; pit < PIT_COUNT; pit += 1) {
    if (state.pits[player][pit] > 0 && !isTuzPit(state, player, pit)) return true
  }
  return false
}

export function legalPits(state: GameState, player: PlayerId = state.currentPlayer): number[] {
  const pits: number[] = []
  if (state.phase !== 'playing') return pits
  for (let pit = 0; pit < PIT_COUNT; pit += 1) {
    if (state.pits[player][pit] > 0 && !isTuzPit(state, player, pit)) pits.push(pit)
  }
  return pits
}

/**
 * A tuzdyk may be announced only in the opponent's pit when the last stone
 * makes exactly three, and only if:
 * - the mover does not already own a tuzdyk
 * - the pit is not the 9th (index 8)
 * - the index is not the same as the opponent's existing tuzdyk
 */
export function canMakeTuz(state: GameState, mover: PlayerId, targetPit: number): boolean {
  if (targetPit < 0 || targetPit > 7) return false
  if (state.tuz[mover] !== null) return false
  const opponent = opponentOf(mover)
  if (state.tuz[opponent] === targetPit) return false
  if (isTuzPit(state, opponent, targetPit)) return false
  return true
}

export function cloneState(state: GameState): GameState {
  return {
    pits: [state.pits[0].slice(), state.pits[1].slice()],
    kazan: [state.kazan[0], state.kazan[1]],
    tuz: [state.tuz[0], state.tuz[1]],
    currentPlayer: state.currentPlayer,
    phase: state.phase,
    winner: state.winner,
    reason: state.reason,
    moveCount: state.moveCount,
  }
}

export function emptyPits(): [number[], number[]] {
  return [Array(PIT_COUNT).fill(0), Array(PIT_COUNT).fill(0)]
}

export function createInitialState(start: PlayerId = 0): GameState {
  return {
    pits: [Array(PIT_COUNT).fill(INITIAL_PER_PIT), Array(PIT_COUNT).fill(INITIAL_PER_PIT)],
    kazan: [0, 0],
    tuz: [null, null],
    currentPlayer: start,
    phase: 'playing',
    winner: null,
    reason: null,
    moveCount: 0,
  }
}

export function makeState(partial: Partial<GameState> & Pick<GameState, 'pits'>): GameState {
  const base = createInitialState(partial.currentPlayer ?? 0)
  return {
    ...base,
    ...partial,
    pits: [partial.pits[0].slice(), partial.pits[1].slice()],
    kazan: partial.kazan ? [partial.kazan[0], partial.kazan[1]] : base.kazan,
    tuz: partial.tuz ? [partial.tuz[0], partial.tuz[1]] : base.tuz,
  }
}
