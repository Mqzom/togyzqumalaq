import type { PlayerId } from '../../engine/gameTypes'
import { cx } from '../../utils/cx'

export function Kazan({
  player,
  name,
  score,
  active,
  pulse,
  label,
  tuzText,
}: {
  player: PlayerId
  name: string
  score: number
  active: boolean
  pulse: boolean
  label: string
  tuzText: string
}) {
  return (
    <div className={cx('kazan', player === 0 ? 'kazan-p0' : 'kazan-p1', pulse && 'is-pulse', active && 'ring-1 ring-teal/70')}>
      <p className="text-[10px] uppercase tracking-[0.16em] text-gold-light/70">{label}</p>
      <p className="kazan-score">{score}</p>
      <p className="max-w-[8rem] text-xs text-milk/80">{name}</p>
      <p className="text-[10px] text-gold-light/80">{tuzText}</p>
    </div>
  )
}
