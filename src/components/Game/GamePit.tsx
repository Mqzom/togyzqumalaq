import type { PlayerId } from '../../engine/gameTypes'
import { cx } from '../../utils/cx'
import { GameStone } from './GameStone'

interface GamePitProps {
  player: PlayerId
  index: number
  count: number
  tuzBy: PlayerId | null
  focused: boolean
  hinted: boolean
  playable: boolean
  stonesLabel: string
  tuzLabel: string
  onSelect: (index: number) => void
}

export function GamePit({
  player,
  index,
  count,
  tuzBy,
  focused,
  hinted,
  playable,
  stonesLabel,
  tuzLabel,
  onSelect,
}: GamePitProps) {
  const visible = Math.min(count, 7)
  return (
    <button
      type="button"
      className={cx('pit', playable && 'can-play', focused && 'is-live', hinted && 'is-hint', tuzBy !== null && 'is-tuz')}
      disabled={!playable}
      data-pit={`${player}-${index}`}
      data-count={count}
      aria-label={`${index + 1}. ${count} ${stonesLabel}${tuzBy !== null ? `. ${tuzLabel}` : ''}`}
      onClick={() => onSelect(index)}
    >
      <span className="pit-index">{index + 1}</span>
      {tuzBy !== null ? (
        <span className="relative z-[1] font-serif text-[10px] uppercase tracking-[0.14em] text-gold-light sm:text-xs">
          {tuzLabel}
        </span>
      ) : (
        <>
          {Array.from({ length: visible }, (_, stone) => (
            <GameStone key={stone} seed={player * 40 + index * 7 + stone} index={stone} total={visible} />
          ))}
          {count > 0 ? <span className="pit-count">{count}</span> : null}
        </>
      )}
    </button>
  )
}
