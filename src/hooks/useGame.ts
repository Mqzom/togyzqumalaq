import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameEvent, GameState, PitFocus, PlayerId, Session, Step } from '../engine/gameTypes'
import type { Difficulty } from '../engine/gameTypes'
import { chooseMove, suggestMove } from '../engine/aiEngine'
import {
  createSession,
  sessionDecide,
  sessionFromState,
  sessionPlay,
  sessionUndo,
} from '../engine/gameEngine'
import { lessons } from '../engine/learnScript'
import { legalPits } from '../engine/gameRules'
import { useLanguage } from '../i18n/LanguageContext'
import { useSound } from './useSound'

export interface GameSettings {
  mode: 'pvp' | 'pvc'
  difficulty: Difficulty
  human: PlayerId
  starter: PlayerId
  timer: boolean
  sound: boolean
  learn: boolean
}

export interface PendingTuz {
  sessionBefore: Session
  sown: GameState
  targetPit: number
  mover: PlayerId
}

const STORAGE_KEY = 'togyz-settings'

function loadSettings(): GameSettings {
  const base: GameSettings = {
    mode: 'pvc',
    difficulty: 'medium',
    human: 0,
    starter: 0,
    timer: false,
    sound: false,
    learn: false,
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw) as Partial<GameSettings>
    return {
      ...base,
      mode: parsed.mode === 'pvp' ? 'pvp' : 'pvc',
      difficulty: parsed.difficulty === 'easy' || parsed.difficulty === 'hard' ? parsed.difficulty : 'medium',
      starter: parsed.starter === 1 ? 1 : 0,
      timer: Boolean(parsed.timer),
      sound: Boolean(parsed.sound),
    }
  } catch {
    return base
  }
}

function persist(settings: GameSettings) {
  try {
    const stored = {
      mode: settings.mode,
      difficulty: settings.difficulty,
      starter: settings.starter,
      timer: settings.timer,
      sound: settings.sound,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch {
    /* ignore */
  }
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function messageFor(events: GameEvent[], text: ReturnType<typeof useLanguage>['t']['game']) {
  if (events.some((event) => event.type === 'atsyrau')) return text.atsyrau
  const tuz = events.find((event) => event.type === 'tuz')
  if (tuz && tuz.type === 'tuz') return `${text.tuzMade}: ${tuz.pit + 1}`
  const capture = events.find((event) => event.type === 'capture')
  if (capture && capture.type === 'capture') return `${text.captured}: ${capture.count}`
  return null
}

export function useGame() {
  const { t } = useLanguage()
  const boot = useRef<{ settings: GameSettings; session: Session } | null>(null)
  if (!boot.current) {
    const settings = loadSettings()
    boot.current = { settings, session: createSession(settings.starter) }
  }

  const [settings, setSettings] = useState<GameSettings>(boot.current.settings)
  const [session, setSession] = useState<Session>(boot.current.session)
  const [view, setView] = useState<GameState>(boot.current.session.state)
  const [busy, setBusy] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [pending, setPending] = useState<PendingTuz | null>(null)
  const [focus, setFocus] = useState<PitFocus | null>(null)
  const [pulse, setPulse] = useState<PlayerId | null>(null)
  const [hintPit, setHintPit] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [seconds, setSeconds] = useState(60)
  const [resultOpen, setResultOpen] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [lessonIndex, setLessonIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [token, setToken] = useState(0)

  const playSound = useSound(settings.sound)
  const gen = useRef(0)
  const busyRef = useRef(false)
  const sessionRef = useRef(session)
  const settingsRef = useRef(settings)
  const tRef = useRef(t)
  const seenResult = useRef('')
  const timerFired = useRef(false)
  const lessonTimer = useRef(0)

  sessionRef.current = session
  settingsRef.current = settings
  tRef.current = t

  const announce = useCallback(
    (events: GameEvent[]) => {
      const text = messageFor(events, tRef.current.game)
      if (text) setToast(text)
      if (events.some((event) => event.type === 'win' || event.type === 'draw')) playSound('win')
      else if (events.some((event) => event.type === 'tuz')) playSound('tuz')
      else if (events.some((event) => event.type === 'capture')) playSound('capture')
    },
    [playSound],
  )

  const animate = useCallback(
    async (steps: Step[], finalState: GameState, id: number) => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced || steps.length === 0) {
        setView(finalState)
        setFocus(steps[steps.length - 1]?.focus ?? null)
        return
      }
      const delay = Math.min(120, Math.max(42, 1700 / steps.length))
      for (let index = 0; index < steps.length; index += 1) {
        if (gen.current !== id) return
        const step = steps[index]
        setView(step.snapshot)
        setFocus(step.focus ?? null)
        setPulse(step.kazanPulse ?? null)
        if ((step.type === 'drop' || step.type === 'lift') && (steps.length < 16 || index % 2 === 0)) {
          playSound('drop')
        }
        await wait(delay)
      }
      if (gen.current !== id) return
      setView(finalState)
      setPulse(null)
    },
    [playSound],
  )

  const runFrom = useCallback(
    async (base: Session, pit: number, tuz?: boolean) => {
      if (busyRef.current) return
      if (base.state.phase !== 'playing') return
      if (!legalPits(base.state).includes(pit)) return
      busyRef.current = true
      setBusy(true)
      setHintPit(null)
      const id = ++gen.current
      try {
        const result = sessionPlay(base, pit, tuz)
        if (result.type === 'illegal') return
        if (result.type === 'choice') {
          await animate(result.steps, result.sown, id)
          if (gen.current !== id) return
          setView(result.sown)
          setFocus({ player: result.mover === 0 ? 1 : 0, pit: result.targetPit })
          setPending({
            sessionBefore: result.sessionBefore,
            sown: result.sown,
            targetPit: result.targetPit,
            mover: result.mover,
          })
          return
        }
        await animate(result.steps, result.session.state, id)
        if (gen.current !== id) return
        setSession(result.session)
        setView(result.session.state)
        announce(result.events)
      } finally {
        if (gen.current === id) {
          busyRef.current = false
          setBusy(false)
          setThinking(false)
        }
      }
    },
    [animate, announce],
  )

  const answerTuz = useCallback(
    async (accept: boolean) => {
      const current = pending
      if (!current || busyRef.current) return
      busyRef.current = true
      setBusy(true)
      setPending(null)
      const id = ++gen.current
      try {
        const decision = sessionDecide(current.sessionBefore, current.sown, current.targetPit, accept)
        await animate(decision.steps, decision.session.state, id)
        if (gen.current !== id) return
        setSession(decision.session)
        setView(decision.session.state)
        announce(decision.events)
        if (settingsRef.current.learn) setRevealed(true)
      } finally {
        if (gen.current === id) {
          busyRef.current = false
          setBusy(false)
        }
      }
    },
    [animate, announce, pending],
  )

  const selectPit = useCallback(
    (pit: number) => {
      if (settingsRef.current.learn) setRevealed(true)
      void runFrom(sessionRef.current, pit)
    },
    [runFrom],
  )

  const applyFresh = useCallback((next: Session) => {
    window.clearTimeout(lessonTimer.current)
    gen.current += 1
    busyRef.current = false
    setBusy(false)
    setThinking(false)
    setPending(null)
    setHintPit(null)
    setFocus(null)
    setPulse(null)
    setResultOpen(false)
    setSession(next)
    setView(next.state)
    sessionRef.current = next
  }, [])

  useEffect(() => {
    if (settings.learn) {
      setLessonIndex(0)
      setRevealed(false)
      applyFresh(sessionFromState(lessons[0].state))
      return
    }
    applyFresh(createSession(settings.starter))
  }, [applyFresh, settings.learn, settings.mode, settings.starter, token])

  useEffect(() => {
    if (settings.learn || settings.mode !== 'pvc') return
    if (busy || pending) return
    if (session.state.phase !== 'playing') return
    if (session.state.currentPlayer === settings.human) return
    const snapshot = session
    const id = gen.current
    setThinking(true)
    const handle = window.setTimeout(() => {
      if (gen.current !== id) return
      const move = chooseMove(snapshot.state, settingsRef.current.difficulty)
      void runFrom(snapshot, move.pit, move.tuz)
    }, 520)
    return () => window.clearTimeout(handle)
  }, [busy, pending, runFrom, session, settings.difficulty, settings.human, settings.learn, settings.mode])

  useEffect(() => {
    if (!toast) return
    const handle = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(handle)
  }, [toast])

  useEffect(() => {
    if (busy || session.state.phase !== 'over') return
    const key = `${session.state.moveCount}:${session.state.kazan[0]}:${session.state.kazan[1]}:${session.state.reason}`
    if (seenResult.current === key) return
    seenResult.current = key
    setResultOpen(true)
  }, [busy, session])

  useEffect(() => {
    timerFired.current = false
    if (!settings.timer || settings.learn || busy || pending || session.state.phase !== 'playing') return
    if (settings.mode === 'pvc' && session.state.currentPlayer !== settings.human) return
    setSeconds(60)
    const handle = window.setInterval(() => {
      setSeconds((value) => (value <= 1 ? 0 : value - 1))
    }, 1000)
    return () => window.clearInterval(handle)
  }, [
    busy,
    pending,
    session.state.currentPlayer,
    session.state.moveCount,
    session.state.phase,
    settings.human,
    settings.learn,
    settings.mode,
    settings.timer,
  ])

  useEffect(() => {
    if (seconds !== 0 || !settings.timer || settings.learn || busy || pending) return
    if (timerFired.current) return
    if (session.state.phase !== 'playing') return
    if (settings.mode === 'pvc' && session.state.currentPlayer !== settings.human) return
    const move = suggestMove(session.state)
    if (!legalPits(session.state).includes(move.pit)) return
    timerFired.current = true
    setToast(t.game.timeout)
    void runFrom(sessionRef.current, move.pit, move.tuz)
  }, [busy, pending, runFrom, seconds, session, settings.human, settings.learn, settings.mode, settings.timer, t.game.timeout])

  const update = useCallback((patch: Partial<GameSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      persist(next)
      return next
    })
  }, [])

  const newGame = useCallback(() => {
    setSettings((prev) => {
      const next = { ...prev, learn: false }
      persist(next)
      return next
    })
    setToken((value) => value + 1)
  }, [])

  const undo = useCallback(() => {
    if (busyRef.current || pending) return
    let next = sessionUndo(sessionRef.current)
    const current = settingsRef.current
    if (
      current.mode === 'pvc' &&
      !current.learn &&
      next.state.phase === 'playing' &&
      next.state.currentPlayer !== current.human
    ) {
      const again = sessionUndo(next)
      if (again !== next) next = again
    }
    applyFresh(next)
    seenResult.current = ''
  }, [applyFresh, pending])

  const hint = useCallback(() => {
    const state = sessionRef.current.state
    if (busyRef.current || state.phase !== 'playing') return
    const move = suggestMove(state)
    if (!legalPits(state).includes(move.pit)) return
    setHintPit(move.pit)
    setFocus({ player: state.currentPlayer, pit: move.pit })
    setToast(`${tRef.current.game.hintText}: ${move.pit + 1}`)
  }, [])

  const setLesson = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(lessons.length - 1, index))
      setLessonIndex(next)
      setRevealed(false)
      seenResult.current = ''
      applyFresh(sessionFromState(lessons[next].state))
    },
    [applyFresh],
  )

  const showLesson = useCallback(() => {
    const lesson = lessons[lessonIndex]
    if (lesson.pit === undefined) return
    const fresh = sessionFromState(lesson.state)
    setRevealed(true)
    applyFresh(fresh)
    lessonTimer.current = window.setTimeout(() => {
      void runFrom(fresh, lesson.pit as number, lesson.askTuz ? undefined : false)
    }, 40)
  }, [applyFresh, lessonIndex, runFrom])

  const interactive =
    !busy &&
    !pending &&
    !thinking &&
    view.phase === 'playing' &&
    (settings.learn || settings.mode === 'pvp' || view.currentPlayer === settings.human)

  const legal = interactive ? legalPits(view) : []

  return {
    settings,
    update,
    view,
    session,
    busy,
    thinking,
    pending,
    focus,
    pulse,
    hintPit,
    toast,
    seconds,
    resultOpen,
    setResultOpen,
    rulesOpen,
    setRulesOpen,
    lessonIndex,
    revealed,
    selectPit,
    answerTuz,
    newGame,
    undo,
    hint,
    showLesson,
    resetLesson: () => setLesson(lessonIndex),
    setLesson,
    interactive,
    legal,
    canUndo: session.history.length > 0 && !busy && !pending,
  }
}

export type GameController = ReturnType<typeof useGame>
