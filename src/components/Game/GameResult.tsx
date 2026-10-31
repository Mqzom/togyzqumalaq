import { playerName } from '../../data/content'
import { useLanguage } from '../../i18n/LanguageContext'
import { useGameContext } from '../../context/GameContext'

export function GameResult() {
  const { lang, t } = useLanguage()
  const { view, settings, resultOpen, setResultOpen, newGame } = useGameContext()
  if (!resultOpen || view.phase !== 'over') return null
  const draw = view.winner === 'draw'
  const winnerName = draw
    ? t.game.resultDraw
    : playerName(lang, view.winner === 1 ? 1 : 0, settings.learn ? 'pvp' : settings.mode, settings.human)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-[28px] border border-gold/40 bg-[#14323c] p-7 text-center text-milk">
        <p className="text-[11px] uppercase tracking-eyebrow text-gold">
          {view.reason === 'atsyrau' ? t.game.resultAtsyrau : t.game.resultScore}
        </p>
        <h3 className="mt-3 font-serif text-4xl">{draw ? t.game.resultDraw : `${t.game.resultWin}: ${winnerName}`}</h3>
        <p className="mt-5 font-display text-6xl text-gold-light">
          {view.kazan[0]}
          <span className="mx-3 text-milk/30">:</span>
          {view.kazan[1]}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" className="btn btn-primary" onClick={newGame}>
            {t.game.again}
          </button>
          <button type="button" className="btn btn-gold" onClick={() => setResultOpen(false)}>
            {t.game.close}
          </button>
        </div>
      </div>
    </div>
  )
}
