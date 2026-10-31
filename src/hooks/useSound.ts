import { useCallback, useRef } from 'react'

export type SoundKind = 'drop' | 'capture' | 'tuz' | 'win'

export function useSound(enabled: boolean) {
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled
  const ctxRef = useRef<AudioContext | null>(null)

  return useCallback((kind: SoundKind) => {
    if (!enabledRef.current) return
    try {
      const Ctx = window.AudioContext
      if (!ctxRef.current) ctxRef.current = new Ctx()
      const ctx = ctxRef.current
      if (ctx.state === 'suspended') void ctx.resume()
      const now = ctx.currentTime
      const notes =
        kind === 'win' ? [523, 659, 784, 1046] : kind === 'tuz' ? [494, 659, 784] : kind === 'capture' ? [587, 784] : [620]
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        const start = now + index * 0.06
        gain.gain.setValueAtTime(0.0001, start)
        gain.gain.exponentialRampToValueAtTime(0.035, start + 0.015)
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(start)
        osc.stop(start + 0.18)
      })
    } catch {
      /* audio is optional */
    }
  }, [])
}
