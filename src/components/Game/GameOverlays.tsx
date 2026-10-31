import { lessons } from '../../engine/learnScript'
import { useLanguage } from '../../i18n/LanguageContext'
import { useGameContext } from '../../context/GameContext'

export function LearnMode() {
  const { t } = useLanguage()
  const game = useGameContext()
  if (!game.settings.learn) return null
  const step = t.learn.steps[game.lessonIndex]
  const lesson = lessons[game.lessonIndex]
  return (
    <div className="mb-5 rounded-3xl border border-gold/30 bg-white/5 p-5">
      <p className="text-[11px] uppercase tracking-eyebrow text-gold">
        {t.game.lesson} {game.lessonIndex + 1} / {t.learn.steps.length}
      </p>
      <h3 className="mt-2 font-serif text-2xl text-milk">{step.title}</h3>
      <p className="mt-2 text-sm leading-7 text-milk/75">{step.body}</p>
      {game.revealed ? <p className="mt-3 text-sm leading-7 text-gold-light">{step.result}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn btn-ghost !min-h-10" onClick={() => game.setLesson(game.lessonIndex - 1)} disabled={game.lessonIndex === 0}>
          {t.game.prev}
        </button>
        <button
          type="button"
          className="btn btn-primary !min-h-10"
          onClick={game.showLesson}
          disabled={lesson.pit === undefined || game.busy}
        >
          {t.game.showMove}
        </button>
        <button type="button" className="btn btn-ghost !min-h-10" onClick={game.resetLesson}>
          {t.game.resetLesson}
        </button>
        <button
          type="button"
          className="btn btn-ghost !min-h-10"
          onClick={() => game.setLesson(game.lessonIndex + 1)}
          disabled={game.lessonIndex === lessons.length - 1}
        >
          {t.game.next}
        </button>
      </div>
    </div>
  )
}

export function TuzDialog() {
  const { t } = useLanguage()
  const { pending, answerTuz, busy } = useGameContext()
  if (!pending) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/55 p-4 sm:items-center" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-[28px] border border-gold/40 bg-[#14323c] p-6 text-milk">
        <h3 className="font-serif text-3xl">{t.game.tuzTitle}</h3>
        <p className="mt-3 text-sm leading-7 text-milk/75">
          {t.game.tuzText} · {pending.targetPit + 1}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void answerTuz(true)}>
            {t.game.tuzYes}
          </button>
          <button type="button" className="btn btn-gold" disabled={busy} onClick={() => void answerTuz(false)}>
            {t.game.tuzNo}
          </button>
        </div>
      </div>
    </div>
  )
}

export function RulesDialog() {
  const { t } = useLanguage()
  const { rulesOpen, setRulesOpen } = useGameContext()
  if (!rulesOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/60 p-4 sm:items-center" role="dialog" aria-modal="true">
      <div className="max-h-[80vh] w-full max-w-lg overflow-auto rounded-[28px] border border-gold/30 bg-[#14323c] p-6 text-milk">
        <h3 className="font-serif text-3xl">{t.game.rulesTitle}</h3>
        <div className="mt-4 space-y-4">
          {t.rules.items.map((item) => (
            <div key={item.id}>
              <h4 className="font-semibold text-gold-light">{item.title}</h4>
              <p className="mt-1 text-sm leading-6 text-milk/75">{item.body}</p>
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-gold mt-5" onClick={() => setRulesOpen(false)}>
          {t.game.close}
        </button>
      </div>
    </div>
  )
}
