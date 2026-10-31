import type {
  ChoiceOutcome,
  GameEvent,
  GameState,
  IllegalOutcome,
  MoveOutcome,
  MoveResult,
  PlayerId,
  Session,
  SessionResult,
  Step,
} from './gameTypes'
import {
  PIT_COUNT,
  WIN_SCORE,
  canMakeTuz,
  cloneState,
  createInitialState,
  cycleIndex,
  CYCLE,
  hasLegalMove,
  legalPits,
  opponentOf,
  tuzOwner,
} from './gameRules'

export interface Finished {
  state: GameState
  steps: Step[]
  events: GameEvent[]
}

function pushStep(steps: Step[], type: Step['type'], state: GameState, extra: Omit<Step, 'type' | 'snapshot'> = {}) {
  steps.push({ type, snapshot: cloneState(state), ...extra })
}

function closeScores(state: GameState, reason: 'score' | 'atsyrau'): GameEvent[] {
  state.phase = 'over'
  state.reason = reason
  if (state.kazan[0] === state.kazan[1]) {
    state.winner = 'draw'
    return [{ type: 'draw', reason }]
  }
  const winner: PlayerId = state.kazan[0] > state.kazan[1] ? 0 : 1
  state.winner = winner
  return [{ type: 'win', winner, reason }]
}

function awardRemaining(state: GameState): void {
  for (const side of [0, 1] as PlayerId[]) {
    for (let pit = 0; pit < PIT_COUNT; pit += 1) {
      const count = state.pits[side][pit]
      if (count <= 0) continue
      state.kazan[side] += count
      state.pits[side][pit] = 0
    }
  }
}

/**
 * If the side about to move has no legal pit, the side that still holds
 * stones receives them and the party ends (атсырау).
 */
export function normalizeState(state: GameState): Finished {
  if (state.phase === 'over') {
    return { state: cloneState(state), steps: [], events: [] }
  }
  if (hasLegalMove(state, state.currentPlayer)) {
    return { state: cloneState(state), steps: [], events: [] }
  }

  const next = cloneState(state)
  const beneficiary = opponentOf(next.currentPlayer)
  awardRemaining(next)
  const steps: Step[] = []
  pushStep(steps, 'award', next, { kazanPulse: beneficiary })
  const events: GameEvent[] = [{ type: 'atsyrau', beneficiary }]
  events.push(...closeScores(next, 'atsyrau'))
  return { state: next, steps, events }
}

function finishAfterMove(state: GameState, mover: PlayerId): Finished {
  const next = cloneState(state)
  next.moveCount += 1
  const steps: Step[] = []
  const events: GameEvent[] = []

  if (next.kazan[0] >= WIN_SCORE || next.kazan[1] >= WIN_SCORE) {
    events.push(...closeScores(next, 'score'))
    pushStep(steps, 'award', next)
    return { state: next, steps, events }
  }

  const upcoming = opponentOf(mover)
  if (!hasLegalMove({ ...next, currentPlayer: upcoming }, upcoming)) {
    const beneficiary = mover
    awardRemaining(next)
    pushStep(steps, 'award', next, { kazanPulse: beneficiary })
    events.push({ type: 'atsyrau', beneficiary })
    events.push(...closeScores(next, 'atsyrau'))
    return { state: next, steps, events }
  }

  if (next.kazan[0] === 81 && next.kazan[1] === 81) {
    events.push(...closeScores(next, 'score'))
    pushStep(steps, 'award', next)
    return { state: next, steps, events }
  }

  next.currentPlayer = upcoming
  return { state: next, steps, events }
}

function applyDecision(
  sown: GameState,
  mover: PlayerId,
  targetPit: number,
  accept: boolean,
): { state: GameState; steps: Step[]; events: GameEvent[] } {
  const state = cloneState(sown)
  const steps: Step[] = []
  const events: GameEvent[] = []
  const count = state.pits[opponentOf(mover)][targetPit]
  const allowed = count === 3 && canMakeTuz(state, mover, targetPit)

  if (allowed && accept) {
    state.pits[opponentOf(mover)][targetPit] = 0
    state.kazan[mover] += 3
    state.tuz[mover] = targetPit
    pushStep(steps, 'tuz', state, {
      focus: { player: opponentOf(mover), pit: targetPit },
      kazanPulse: mover,
    })
    events.push({ type: 'tuz', player: mover, pit: targetPit })
  } else if (count > 0 && count % 2 === 0) {
    state.pits[opponentOf(mover)][targetPit] = 0
    state.kazan[mover] += count
    pushStep(steps, 'capture', state, {
      focus: { player: opponentOf(mover), pit: targetPit },
      kazanPulse: mover,
    })
    events.push({ type: 'capture', player: mover, count, pit: targetPit })
  }

  const finished = finishAfterMove(state, mover)
  return {
    state: finished.state,
    steps: [...steps, ...finished.steps],
    events: [...events, ...finished.events],
  }
}

export function playMove(state: GameState, pit: number, tuz?: boolean): MoveResult {
  if (state.phase !== 'playing') return { ok: false, reason: 'finished' }
  if (pit < 0 || pit >= PIT_COUNT) return { ok: false, reason: 'range' }

  const mover = state.currentPlayer
  if (tuzOwner(state, mover, pit) !== null) return { ok: false, reason: 'tuz-pit' }
  const count = state.pits[mover][pit]
  if (count <= 0) return { ok: false, reason: 'empty' }

  const sown = cloneState(state)
  const steps: Step[] = []
  let hand: number
  if (count === 1) {
    sown.pits[mover][pit] = 0
    hand = 1
  } else {
    sown.pits[mover][pit] = 1
    hand = count - 1
  }
  pushStep(steps, 'lift', sown, { focus: { player: mover, pit } })

  let idx = cycleIndex(mover, pit)
  let lastSide: PlayerId = mover
  let lastPit = pit
  let lastWasTuz = false

  while (hand > 0) {
    idx = (idx + 1) % CYCLE.length
    const [side, index] = CYCLE[idx]
    hand -= 1
    const owner = tuzOwner(sown, side, index)
    if (owner !== null) {
      sown.kazan[owner] += 1
      lastWasTuz = true
      pushStep(steps, 'collect', sown, {
        focus: { player: side, pit: index },
        kazanPulse: owner,
      })
    } else {
      sown.pits[side][index] += 1
      lastWasTuz = false
      pushStep(steps, 'drop', sown, { focus: { player: side, pit: index } })
    }
    lastSide = side
    lastPit = index
  }

  if (!lastWasTuz && lastSide !== mover) {
    const landed = sown.pits[lastSide][lastPit]
    const tuzOk = landed === 3 && canMakeTuz(sown, mover, lastPit)
    if (tuzOk && tuz === undefined) {
      const choice: ChoiceOutcome = {
        ok: true,
        choice: true,
        state: sown,
        steps,
        targetPit: lastPit,
        mover,
      }
      return choice
    }
    const decision = applyDecision(sown, mover, lastPit, tuzOk && tuz === true)
    const outcome: MoveOutcome = {
      ok: true,
      choice: false,
      state: decision.state,
      steps: [...steps, ...decision.steps],
      events: decision.events,
    }
    return outcome
  }

  const finished = finishAfterMove(sown, mover)
  const outcome: MoveOutcome = {
    ok: true,
    choice: false,
    state: finished.state,
    steps: [...steps, ...finished.steps],
    events: finished.events,
  }
  return outcome
}

export function decideTuz(sown: GameState, targetPit: number, accept: boolean): MoveOutcome {
  const decision = applyDecision(sown, sown.currentPlayer, targetPit, accept)
  return {
    ok: true,
    choice: false,
    state: decision.state,
    steps: decision.steps,
    events: decision.events,
  }
}

export function createSession(start: PlayerId = 0): Session {
  const normalized = normalizeState(createInitialState(start))
  return { state: normalized.state, history: [] }
}

export function sessionFromState(state: GameState): Session {
  const normalized = normalizeState(state)
  return { state: normalized.state, history: [] }
}

export function sessionPlay(session: Session, pit: number, tuz?: boolean): SessionResult {
  const result = playMove(session.state, pit, tuz)
  if (!result.ok) return { type: 'illegal', session, reason: result.reason }
  if (result.choice) {
    return {
      type: 'choice',
      sessionBefore: session,
      sown: result.state,
      steps: result.steps,
      targetPit: result.targetPit,
      mover: result.mover,
    }
  }
  return {
    type: 'done',
    session: {
      state: result.state,
      history: [...session.history, cloneState(session.state)],
    },
    steps: result.steps,
    events: result.events,
  }
}

export function sessionDecide(
  sessionBefore: Session,
  sown: GameState,
  targetPit: number,
  accept: boolean,
): { session: Session; steps: Step[]; events: GameEvent[] } {
  const decision = decideTuz(sown, targetPit, accept)
  return {
    session: {
      state: decision.state,
      history: [...sessionBefore.history, cloneState(sessionBefore.state)],
    },
    steps: decision.steps,
    events: decision.events,
  }
}

export function sessionUndo(session: Session): Session {
  if (session.history.length === 0) return session
  const previous = session.history[session.history.length - 1]
  return {
    state: cloneState(previous),
    history: session.history.slice(0, -1),
  }
}

export function isIllegal(result: MoveResult): result is IllegalOutcome {
  return result.ok === false
}

export { legalPits }
