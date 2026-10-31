import { BookOpen, Lightbulb, RotateCcw, Undo2, Volume2, VolumeX } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'
import { useGameContext } from '../../context/GameContext'

export function GameControls() {
  const { t } = useLanguage()
  const game = useGameContext()
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" className="btn btn-primary !min-h-11" onClick={game.newGame}>
        <RotateCcw size={16} />
        {t.game.newGame}
      </button>
      <button type="button" className="btn btn-ghost !min-h-11" onClick={game.undo} disabled={!game.canUndo}>
        <Undo2 size={16} />
        {t.game.undo}
      </button>
      <button type="button" className="btn btn-ghost !min-h-11" onClick={game.hint} disabled={!game.interactive}>
        <Lightbulb size={16} />
        {t.game.hint}
      </button>
      <button type="button" className="btn btn-ghost !min-h-11" onClick={() => game.setRulesOpen(true)}>
        <BookOpen size={16} />
        {t.game.rules}
      </button>
      <button
        type="button"
        className="btn btn-ghost !min-h-11"
        onClick={() => game.update({ sound: !game.settings.sound })}
        aria-pressed={game.settings.sound}
      >
        {game.settings.sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
        {game.settings.sound ? t.game.soundOn : t.game.soundOff}
      </button>
    </div>
  )
}
