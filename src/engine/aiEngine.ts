import type { AiAction, Difficulty, GameState, PlayerId } from './gameTypes'
import { playMove } from './gameEngine'
import { legalPits, opponentOf, WIN_SCORE } from './gameRules'

interface ScoredAction extends AiAction {
  state: GameState
  immediate: number
}

function terminal(state: GameState, ai: PlayerId): number | null {
  if (state.phase !== 'over') return null
  if (state.winner === 'draw') return 0
  if (state.winner === ai) return 100000 + state.kazan[ai] - state.kazan[opponentOf(ai)]
  return -100000 - (state.kazan[state.winner as PlayerId] - state.kazan[ai])
}

function heuristic(state: GameState, ai: PlayerId): number {
  const opp = opponentOf(ai)
  let score = (state.kazan[ai] - state.kazan[opp]) * 14
  if (state.tuz[ai] !== null) score += 28
  if (state.tuz[opp] !== null) score -= 28
  score += legalPits(state, ai).length * 2
  score -= legalPits(state, opp).length * 1.2
  if (state.kazan[ai] >= 70) score += (state.kazan[ai] - 70) * 6
  if (state.kazan[opp] >= 70) score -= (state.kazan[opp] - 70) * 6
  if (state.kazan[ai] >= WIN_SCORE) score += 5000
  if (state.kazan[opp] >= WIN_SCORE) score -= 5000

  for (let pit = 0; pit < 9; pit += 1) {
    const own = state.pits[ai][pit]
    const enemy = state.pits[opp][pit]
    if (own > 0) score += Math.min(own, 12) * 0.15
    if (enemy > 0 && enemy % 2 === 1) score += 0.4
  }
  return score
}

function expand(state: GameState): ScoredAction[] {
  const mover = state.currentPlayer
  const actions: ScoredAction[] = []
  for (const pit of legalPits(state, mover)) {
    const probe = playMove(state, pit)
    if (!probe.ok) continue
    if (probe.choice) {
      for (const tuz of [true, false]) {
        const resolved = playMove(state, pit, tuz)
        if (!resolved.ok || resolved.choice) continue
        actions.push({
          pit,
          tuz,
          state: resolved.state,
          immediate: resolved.state.kazan[mover] - state.kazan[mover],
        })
      }
    } else {
      actions.push({
        pit,
        tuz: false,
        state: probe.state,
        immediate: probe.state.kazan[mover] - state.kazan[mover],
      })
    }
  }
  actions.sort((a, b) => b.immediate - a.immediate)
  return actions
}

function search(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  ai: PlayerId,
  budget: { left: number },
): number {
  const done = terminal(state, ai)
  if (done !== null) return done
  if (depth === 0 || budget.left <= 0) return heuristic(state, ai)

  const actions = expand(state)
  if (actions.length === 0) return heuristic(state, ai)

  const maximizing = state.currentPlayer === ai
  if (maximizing) {
    let best = -Infinity
    for (const action of actions) {
      budget.left -= 1
      const value = search(action.state, depth - 1, alpha, beta, ai, budget)
      if (value > best) best = value
      if (value > alpha) alpha = value
      if (beta <= alpha) break
    }
    return best
  }

  let best = Infinity
  for (const action of actions) {
    budget.left -= 1
    const value = search(action.state, depth - 1, alpha, beta, ai, budget)
    if (value < best) best = value
    if (value < beta) beta = value
    if (beta <= alpha) break
  }
  return best
}

function depthFor(difficulty: Difficulty, moves: number): number {
  if (difficulty === 'easy') return 2
  if (difficulty === 'medium') return moves > 6 ? 3 : 4
  return moves > 6 ? 4 : 5
}

export function chooseMove(state: GameState, difficulty: Difficulty, random: () => number = Math.random): AiAction {
  const ai = state.currentPlayer
  const actions = expand(state)
  if (actions.length === 0) return { pit: 0, tuz: false }

  const depth = depthFor(difficulty, actions.length)
  const budget = { left: difficulty === 'hard' ? 40000 : 12000 }
  let bestValue = -Infinity
  const ranked: { action: ScoredAction; value: number }[] = []

  for (const action of actions) {
    const value = search(action.state, depth - 1, -Infinity, Infinity, ai, budget)
    ranked.push({ action, value })
    if (value > bestValue) bestValue = value
  }

  ranked.sort((a, b) => b.value - a.value)
  if (difficulty === 'easy' && ranked.length > 1) {
    const band = ranked.filter((item) => bestValue - item.value < 18)
    const pool = band.length > 0 ? band : ranked.slice(0, 2)
    const pick = pool[Math.floor(random() * pool.length)]
    return { pit: pick.action.pit, tuz: pick.action.tuz }
  }

  const top = ranked[0]
  return { pit: top.action.pit, tuz: top.action.tuz }
}

export function suggestMove(state: GameState): AiAction {
  return chooseMove(state, 'medium', () => 0)
}
