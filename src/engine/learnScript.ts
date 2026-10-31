import { createInitialState, makeState } from './gameRules'
import type { GameState } from './gameTypes'

export interface LessonStep {
  state: GameState
  /** Pit to demonstrate. Omitted for the overview step. */
  pit?: number
  /** When true, the demo stops and asks about a tuzdyk. */
  askTuz?: boolean
}

function row(): number[] {
  return [0, 0, 0, 0, 0, 0, 0, 0, 0]
}

const single = [row(), row()]
single[0][3] = 1
single[1][2] = 6

const capture = [row(), row()]
capture[0][8] = 2
capture[1][0] = 1
capture[1][4] = 4

const tuz = [row(), row()]
tuz[0][8] = 2
tuz[1][0] = 2
tuz[1][5] = 5

const win = [row(), row()]
win[0][8] = 2
win[1][0] = 1
win[1][4] = 6

export const lessons: LessonStep[] = [
  { state: createInitialState(0) },
  { state: createInitialState(0), pit: 4 },
  { state: makeState({ pits: [single[0], single[1]], currentPlayer: 0 }), pit: 3 },
  { state: makeState({ pits: [capture[0], capture[1]], currentPlayer: 0 }), pit: 8 },
  { state: makeState({ pits: [tuz[0], tuz[1]], currentPlayer: 0 }), pit: 8, askTuz: true },
  {
    state: makeState({
      pits: [win[0], win[1]],
      kazan: [80, 20],
      currentPlayer: 0,
    }),
    pit: 8,
  },
]
