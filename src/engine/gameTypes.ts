export type PlayerId = 0 | 1

export type GamePhase = 'playing' | 'over'

export type Winner = PlayerId | 'draw' | null

export type EndReason = 'score' | 'atsyrau' | null

/** tuz[player] is the pit index on the opponent's side, or null. */
export interface GameState {
  pits: [number[], number[]]
  kazan: [number, number]
  tuz: [number | null, number | null]
  currentPlayer: PlayerId
  phase: GamePhase
  winner: Winner
  reason: EndReason
  moveCount: number
}

export interface PitFocus {
  player: PlayerId
  pit: number
}

export type StepType = 'lift' | 'drop' | 'collect' | 'capture' | 'tuz' | 'award'

export interface Step {
  type: StepType
  snapshot: GameState
  focus?: PitFocus
  kazanPulse?: PlayerId
}

export type GameEvent =
  | { type: 'capture'; player: PlayerId; count: number; pit: number }
  | { type: 'tuz'; player: PlayerId; pit: number }
  | { type: 'atsyrau'; beneficiary: PlayerId }
  | { type: 'win'; winner: PlayerId; reason: EndReason }
  | { type: 'draw'; reason: EndReason }

export interface MoveOutcome {
  ok: true
  choice: false
  state: GameState
  steps: Step[]
  events: GameEvent[]
}

export interface ChoiceOutcome {
  ok: true
  choice: true
  state: GameState
  steps: Step[]
  targetPit: number
  mover: PlayerId
}

export interface IllegalOutcome {
  ok: false
  reason: 'empty' | 'tuz-pit' | 'finished' | 'range'
}

export type MoveResult = MoveOutcome | ChoiceOutcome | IllegalOutcome

export interface Session {
  state: GameState
  history: GameState[]
}

export type SessionResult =
  | {
      type: 'done'
      session: Session
      steps: Step[]
      events: GameEvent[]
    }
  | {
      type: 'choice'
      sessionBefore: Session
      sown: GameState
      steps: Step[]
      targetPit: number
      mover: PlayerId
    }
  | { type: 'illegal'; session: Session; reason: IllegalOutcome['reason'] }

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface AiAction {
  pit: number
  tuz: boolean
}
