import type { Difficulty } from '../../engine/gameTypes'
import { useLanguage } from '../../i18n/LanguageContext'
import { useGameContext } from '../../context/GameContext'
import { cx } from '../../utils/cx'

function Segment<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { id: T; label: string }[]
  onChange: (id: T) => void
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-gold">{label}</p>
      <div className="flex flex-wrap gap-1 rounded-full border border-white/10 bg-black/20 p-1">
        {options.map((option) => (
          <button
            key={String(option.id)}
            type="button"
            onClick={() => onChange(option.id)}
            className={cx(
              'rounded-full px-3 py-1.5 text-xs font-semibold',
              value === option.id ? 'bg-teal text-milk' : 'text-milk/70 hover:text-milk',
            )}
            aria-pressed={value === option.id}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function GameSettings() {
  const { t } = useLanguage()
  const { settings, update } = useGameContext()
  const levels: Difficulty[] = ['easy', 'medium', 'hard']
  return (
    <div className="mb-5 grid gap-4 lg:grid-cols-2">
      <Segment
        label={t.game.mode}
        value={settings.learn ? 'learn' : 'play'}
        options={[
          { id: 'play', label: t.game.playMode },
          { id: 'learn', label: t.game.learn },
        ]}
        onChange={(id) => update({ learn: id === 'learn' })}
      />
      {!settings.learn ? (
        <Segment
          label={t.game.mode}
          value={settings.mode}
          options={[
            { id: 'pvp' as const, label: t.game.twoPlayers },
            { id: 'pvc' as const, label: t.game.vsComputer },
          ]}
          onChange={(id) => update({ mode: id })}
        />
      ) : null}
      {!settings.learn && settings.mode === 'pvc' ? (
        <Segment
          label={t.game.level}
          value={settings.difficulty}
          options={levels.map((level) => ({ id: level, label: t.game.levels[level] }))}
          onChange={(id) => update({ difficulty: id })}
        />
      ) : null}
      {!settings.learn ? (
        <Segment
          label={t.game.starter}
          value={settings.starter}
          options={[
            { id: 0 as const, label: settings.mode === 'pvc' ? t.game.you : `${t.game.player} 1` },
            { id: 1 as const, label: settings.mode === 'pvc' ? t.game.computer : `${t.game.player} 2` },
          ]}
          onChange={(id) => update({ starter: id })}
        />
      ) : null}
      {!settings.learn ? (
        <Segment
          label={t.game.timer}
          value={settings.timer ? 'on' : 'off'}
          options={[
            { id: 'off', label: t.game.timerOff },
            { id: 'on', label: t.game.timerOn },
          ]}
          onChange={(id) => update({ timer: id === 'on' })}
        />
      ) : null}
    </div>
  )
}
