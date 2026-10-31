import { playerName } from '../../data/content'
import { useLanguage } from '../../i18n/LanguageContext'
import { useGameContext } from '../../context/GameContext'

export function GameStatus() {
  const { lang, t } = useLanguage()
  const { view, settings, thinking, seconds, interactive } = useGameContext()
  const name = playerName(lang, view.currentPlayer, settings.learn ? 'pvp' : settings.mode, settings.human)
  let status = `${t.game.waiting}: ${name}`
  if (view.phase === 'over') {
    status = view.winner === 'draw' ? t.game.resultDraw : t.game.resultWin
  } else if (thinking) status = t.game.thinking
  else if (interactive && (settings.mode === 'pvp' || view.currentPlayer === settings.human)) status = t.game.yourTurn

  const showTimer =
    settings.timer &&
    !settings.learn &&
    view.phase === 'playing' &&
    (settings.mode === 'pvp' || view.currentPlayer === settings.human)

  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3" aria-live="polite">
      <div>
        <p className="text-[11px] uppercase tracking-eyebrow text-gold">{t.game.turn}</p>
        <h3 className="mt-1 font-serif text-3xl text-milk">{name}</h3>
        <p className="mt-1 text-sm text-milk/70">{status}</p>
      </div>
      {showTimer ? (
        <p className={`font-display text-4xl ${seconds <= 10 ? 'text-gold-light' : 'text-milk'}`}>{seconds}</p>
      ) : (
        <p className="font-display text-3xl text-gold-light">
          {view.kazan[0]}
          <span className="mx-2 text-milk/40">:</span>
          {view.kazan[1]}
        </p>
      )}
    </div>
  )
}
