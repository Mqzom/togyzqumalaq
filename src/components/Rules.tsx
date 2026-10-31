import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { cx } from '../utils/cx'
import { SectionHeading } from './SectionHeading'

function SowingDemo() {
  const frames = [
    [3, 0, 0, 0, 0],
    [1, 1, 0, 0, 0],
    [1, 1, 1, 0, 0],
    [1, 1, 1, 1, 0],
  ]
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setFrame((value) => (value + 1) % frames.length), 850)
    return () => window.clearInterval(id)
  }, [frames.length])
  const pits = frames[frame]
  return (
    <div className="mt-4 flex items-center gap-2" aria-hidden="true">
      {pits.map((count, index) => (
        <div
          key={index}
          className={cx(
            'flex h-12 w-12 items-center justify-center rounded-full font-display text-lg text-gold-light',
            index === frame ? 'ring-2 ring-teal' : '',
          )}
          style={{ background: 'radial-gradient(circle at 50% 40%, #3a291e, #120c09 70%)' }}
        >
          {count}
        </div>
      ))}
    </div>
  )
}

function WinMark() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-navy px-4 py-3 text-milk">
        <p className="font-display text-4xl text-gold-light">82</p>
        <p className="text-xs uppercase tracking-[0.14em] text-milk/60">+</p>
      </div>
      <div className="rounded-2xl border border-navy/10 px-4 py-3">
        <p className="font-display text-4xl text-navy">81</p>
        <p className="text-xs uppercase tracking-[0.14em] text-ink/50">=</p>
      </div>
    </div>
  )
}

export function Rules() {
  const { t } = useLanguage()
  const [open, setOpen] = useState(0)
  const current = t.rules.items[open]

  return (
    <section id="rules" className="section-anchor bg-milk py-20 text-ink md:py-28">
      <div className="mx-auto max-w-[1240px] px-4 md:px-6">
        <SectionHeading index={t.rules.index} eyebrow={t.rules.eyebrow} title={t.rules.title} text={t.rules.intro} />
        <div className="mt-10 grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {t.rules.items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setOpen(index)}
                className={cx(
                  'shrink-0 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-colors',
                  open === index ? 'border-teal bg-navy text-milk' : 'border-navy/10 bg-white text-ink hover:border-gold',
                )}
                aria-pressed={open === index}
              >
                {item.title}
              </button>
            ))}
          </div>
          <article className="rounded-[28px] border border-navy/10 bg-white p-6 md:p-8">
            <h3 className="font-serif text-3xl">{current.title}</h3>
            <p className="mt-3 max-w-2xl leading-7 text-ink/75">{current.body}</p>
            <ul className="mt-5 space-y-3">
              {current.points.map((point) => (
                <li key={point} className="flex gap-3 text-sm leading-6 text-ink/80">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            {current.id === 'move' ? <SowingDemo /> : null}
            {current.id === 'win' ? <WinMark /> : null}
            {current.id === 'board' ? (
              <div className="mt-5 grid grid-cols-9 gap-1.5">
                {Array.from({ length: 9 }, (_, index) => (
                  <div
                    key={index}
                    className="flex aspect-square items-center justify-center rounded-full font-display text-sm text-gold-light"
                    style={{ background: 'radial-gradient(circle at 50% 40%, #3a291e, #120c09 70%)' }}
                  >
                    9
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        </div>
      </div>
    </section>
  )
}
