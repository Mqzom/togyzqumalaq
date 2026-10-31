import { describe, expect, it } from 'vitest'
import { chooseMove } from './aiEngine'
import { createSession, normalizeState, playMove, sessionPlay, sessionUndo } from './gameEngine'
import { createInitialState, makeState, TOTAL_STONES, totalStones } from './gameRules'
import { validateState } from './gameValidation'
import type { GameState, PlayerId } from './gameTypes'

function zeros(): number[] {
  return [0, 0, 0, 0, 0, 0, 0, 0, 0]
}

function done(state: GameState, pit: number, tuz?: boolean) {
  const result = playMove(state, pit, tuz)
  if (!result.ok || result.choice) {
    throw new Error(`expected a completed move, got ${JSON.stringify(result)}`)
  }
  return result
}

describe('togyzqumalaq engine', () => {
  it('starts with 162 stones, nine in every pit, empty kazans', () => {
    const state = createInitialState()
    expect(totalStones(state)).toBe(162)
    expect(TOTAL_STONES).toBe(162)
    expect(state.pits[0].every((count) => count === 9)).toBe(true)
    expect(state.pits[1].every((count) => count === 9)).toBe(true)
    expect(state.kazan).toEqual([0, 0])
    expect(state.tuz).toEqual([null, null])
    expect(validateState(state, 162)).toEqual([])
  })

  it('leaves the first stone and deals the rest forward', () => {
    const result = done(createInitialState(), 0)
    expect(result.state.pits[0]).toEqual([1, 10, 10, 10, 10, 10, 10, 10, 10])
    expect(result.state.pits[1]).toEqual([9, 9, 9, 9, 9, 9, 9, 9, 9])
    expect(result.state.kazan).toEqual([0, 0])
    expect(result.state.currentPlayer).toBe(1)
    expect(totalStones(result.state)).toBe(162)
  })

  it('moves a single stone into the next pit', () => {
    const pits: [number[], number[]] = [zeros(), zeros()]
    pits[0][3] = 1
    pits[1][0] = 1
    const result = done(makeState({ pits, currentPlayer: 0 }), 3)
    expect(result.state.pits[0][3]).toBe(0)
    expect(result.state.pits[0][4]).toBe(1)
    expect(result.state.phase).toBe('playing')
    expect(totalStones(result.state)).toBe(2)
  })

  it('refuses an empty pit and does not change the position', () => {
    const state = createInitialState()
    state.pits[0][2] = 0
    const before = totalStones(state)
    const result = playMove(state, 2)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('empty')
    expect(state.pits[0][2]).toBe(0)
    expect(totalStones(state)).toBe(before)
  })

  it('captures an even number from the opponent pit', () => {
    const pits: [number[], number[]] = [zeros(), zeros()]
    pits[0][8] = 2
    pits[1][0] = 1
    const result = done(makeState({ pits, kazan: [80, 10], currentPlayer: 0 }), 8)
    expect(result.events.some((event) => event.type === 'capture' && event.count === 2)).toBe(true)
    expect(result.state.kazan[0]).toBe(82)
    expect(result.state.pits[1][0]).toBe(0)
    expect(result.state.pits[0][8]).toBe(1)
    expect(result.state.winner).toBe(0)
    expect(result.state.phase).toBe('over')
    expect(result.state.pits[1][8]).toBe(0)
  })

  it('does not capture an odd count, including on the player’s own side', () => {
    const pits: [number[], number[]] = [zeros(), zeros()]
    pits[0][8] = 2
    const odd = done(makeState({ pits, currentPlayer: 0 }), 8)
    expect(odd.state.pits[1][0]).toBe(1)
    expect(odd.state.kazan).toEqual([0, 0])
    expect(odd.events.filter((event) => event.type === 'capture')).toHaveLength(0)

    const own: [number[], number[]] = [zeros(), [1, 1, 1, 1, 1, 1, 1, 1, 1]]
    own[0][0] = 2
    own[0][1] = 1
    const stayed = done(makeState({ pits: own, currentPlayer: 0 }), 0)
    expect(stayed.state.pits[0][1]).toBe(2)
    expect(stayed.state.kazan[0]).toBe(0)
  })

  it('opens a tuzdyk and moves the three stones into the kazan', () => {
    const pits: [number[], number[]] = [zeros(), zeros()]
    pits[0][8] = 2
    pits[1][0] = 2
    pits[1][4] = 1
    const result = done(makeState({ pits, currentPlayer: 0 }), 8, true)
    expect(result.state.tuz[0]).toBe(0)
    expect(result.state.pits[1][0]).toBe(0)
    expect(result.state.pits[1][4]).toBe(1)
    expect(result.state.kazan[0]).toBe(3)
    expect(result.events.some((event) => event.type === 'tuz')).toBe(true)
    expect(validateState(result.state)).toEqual([])
  })

  it('asks before creating a tuzdyk and can decline it', () => {
    const pits: [number[], number[]] = [zeros(), zeros()]
    pits[0][8] = 2
    pits[1][0] = 2
    const state = makeState({ pits, currentPlayer: 0 })
    const pending = playMove(state, 8)
    expect(pending.ok && pending.choice).toBe(true)
    if (pending.ok && pending.choice) {
      expect(pending.state.pits[1][0]).toBe(3)
      expect(pending.targetPit).toBe(0)
    }
    const declined = done(state, 8, false)
    expect(declined.state.tuz[0]).toBeNull()
    expect(declined.state.pits[1][0]).toBe(3)
    expect(declined.state.kazan[0]).toBe(0)
  })

  it('forbids a tuzdyk in the ninth pit', () => {
    const pits: [number[], number[]] = [zeros(), zeros()]
    pits[0][8] = 10
    pits[1][8] = 2
    const result = done(makeState({ pits, currentPlayer: 0 }), 8, true)
    expect(result.state.tuz[0]).toBeNull()
    expect(result.state.pits[1][8]).toBe(3)
    expect(result.state.kazan[0]).toBe(0)
  })

  it('forbids a tuzdyk symmetric to the opponent’s tuzdyk', () => {
    const pits: [number[], number[]] = [zeros(), zeros()]
    pits[0][8] = 5
    pits[1][3] = 2
    const result = done(
      makeState({ pits, tuz: [null, 3], currentPlayer: 0 }),
      8,
      true,
    )
    expect(result.state.tuz[0]).toBeNull()
    expect(result.state.tuz[1]).toBe(3)
    expect(result.state.pits[1][3]).toBe(3)
  })

  it('forbids a second tuzdyk for the same player', () => {
    const pits: [number[], number[]] = [zeros(), zeros()]
    pits[0][8] = 2
    pits[1][0] = 2
    const result = done(makeState({ pits, tuz: [1, null], currentPlayer: 0 }), 8, true)
    expect(result.state.tuz[0]).toBe(1)
    expect(result.state.pits[1][0]).toBe(3)
    expect(result.state.kazan[0]).toBe(0)
  })

  it('sends every stone that falls into a tuzdyk straight to its owner', () => {
    const pits: [number[], number[]] = [zeros(), zeros()]
    pits[0][8] = 5
    const result = done(makeState({ pits, tuz: [2, null], currentPlayer: 0 }), 8)
    expect(result.state.pits[1][2]).toBe(0)
    expect(result.state.kazan[0]).toBe(1)
    expect(result.state.pits[1][0]).toBe(1)
    expect(result.state.pits[1][1]).toBe(1)
    expect(result.state.pits[1][3]).toBe(1)
    expect(result.events.some((event) => event.type === 'capture')).toBe(false)
  })

  it('lets the opponent win when a sown stone fills their tuzdyk to 82', () => {
    const pits: [number[], number[]] = [zeros(), [2, 2, 2, 2, 2, 2, 2, 2, 2]]
    pits[0][6] = 2
    const result = done(
      makeState({ pits, kazan: [0, 81], tuz: [null, 7], currentPlayer: 0 }),
      6,
    )
    expect(result.state.kazan[1]).toBe(82)
    expect(result.state.winner).toBe(1)
    expect(result.state.phase).toBe('over')
  })

  it('ends in atsyrau and gives the opponent the stones on their side', () => {
    const pits: [number[], number[]] = [zeros(), [4, 4, 3, 0, 0, 0, 0, 0, 0]]
    const resolved = normalizeState(
      makeState({ pits, kazan: [81, 70], currentPlayer: 0 }),
    )
    expect(resolved.events.some((event) => event.type === 'atsyrau')).toBe(true)
    expect(resolved.state.kazan).toEqual([81, 81])
    expect(resolved.state.winner).toBe('draw')
    expect(resolved.state.reason).toBe('atsyrau')
    expect(totalStones(resolved.state)).toBe(162)
    expect(resolved.state.pits[0].every((count) => count === 0)).toBe(true)
    expect(resolved.state.pits[1].every((count) => count === 0)).toBe(true)
  })

  it('declares a win as soon as a kazan reaches 82', () => {
    const pits: [number[], number[]] = [zeros(), zeros()]
    pits[0][8] = 2
    pits[1][0] = 1
    pits[1][4] = 9
    const result = done(makeState({ pits, kazan: [80, 20], currentPlayer: 0 }), 8)
    expect(result.state.kazan[0]).toBe(82)
    expect(result.state.winner).toBe(0)
    expect(result.state.reason).toBe('score')
    expect(result.state.pits[1][4]).toBe(9)
  })

  it('records an 81:81 draw', () => {
    const pits: [number[], number[]] = [zeros(), [1, 0, 0, 0, 0, 0, 0, 0, 0]]
    const resolved = normalizeState(
      makeState({ pits, kazan: [81, 80], currentPlayer: 0 }),
    )
    expect(resolved.state.winner).toBe('draw')
    expect(resolved.state.kazan).toEqual([81, 81])
  })

  it('restores the exact position on undo', () => {
    let session = createSession(0)
    const first = sessionPlay(session, 0, false)
    expect(first.type).toBe('done')
    if (first.type !== 'done') return
    session = first.session
    const second = sessionPlay(session, 0, false)
    expect(second.type).toBe('done')
    if (second.type !== 'done') return
    const once = sessionUndo(second.session)
    expect(once.state).toEqual(first.session.state)
    const twice = sessionUndo(once)
    expect(twice.state).toEqual(createInitialState())
    expect(sessionUndo(twice)).toEqual(twice)
  })

  it('conserves stones and never goes negative across a random party', () => {
    let seed = 20260331
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296
      return seed / 4294967296
    }
    let session = createSession(0)
    for (let turn = 0; turn < 48 && session.state.phase === 'playing'; turn += 1) {
      const pits = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(
        (pit) => session.state.pits[session.state.currentPlayer][pit] > 0,
      )
      const pit = pits[Math.floor(random() * pits.length)]
      const result = sessionPlay(session, pit, random() > 0.5)
      expect(result.type).not.toBe('illegal')
      if (result.type === 'choice') {
        const decision = sessionPlay(result.sessionBefore, pit, random() > 0.4)
        expect(decision.type).toBe('done')
        if (decision.type !== 'done') return
        session = decision.session
      } else if (result.type === 'done') {
        session = result.session
      }
      expect(validateState(session.state, 162)).toEqual([])
      for (const side of [0, 1] as PlayerId[]) {
        expect(session.state.pits[side].every((count) => count >= 0)).toBe(true)
      }
    }
  })

  it('makes the computer take a forced winning capture', () => {
    const pits: [number[], number[]] = [zeros(), zeros()]
    pits[0][0] = 1
    pits[0][8] = 2
    pits[1][0] = 1
    pits[1][3] = 4
    const state = makeState({ pits, kazan: [80, 10], currentPlayer: 0 })
    const move = chooseMove(state, 'hard', () => 0)
    expect(move.pit).toBe(8)
    const result = done(state, move.pit, move.tuz)
    expect(result.state.winner).toBe(0)
    expect(result.state.kazan[0]).toBeGreaterThanOrEqual(82)
  })

  it('returns a legal opening move for every difficulty', () => {
    const state = createInitialState()
    for (const level of ['easy', 'medium', 'hard'] as const) {
      const move = chooseMove(state, level, () => 0.2)
      const result = playMove(state, move.pit, move.tuz)
      expect(result.ok).toBe(true)
    }
  })
})
