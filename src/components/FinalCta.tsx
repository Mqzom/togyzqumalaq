import { useLanguage } from '../i18n/LanguageContext'
import { useGameContext } from '../context/GameContext'
import { scrollToId } from '../utils/cx'

export function FinalCta() {
  const { t } = useLanguage()
  const { newGame } = useGameContext()
  return (
    <section id="start" className="section-anchor bg-navy py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
        <h2 className="font-serif text-[clamp(2.8rem,6vw,5rem)] font-semibold leading-[1.05] text-milk">
          {t.cta.title}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-milk/75">{t.cta.text}</p>
        <button
          type="button"
          className="btn btn-primary mt-8"
          onClick={() => {
            newGame()
            scrollToId('play')
          }}
        >
          {t.cta.button}
        </button>
      </div>
    </section>
  )
}
