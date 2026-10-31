import { useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { SectionHeading } from './SectionHeading'

function Counter({ value, start }: { value: number; start: boolean }) {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    if (!start) return
    const began = performance.now()
    const duration = 1200
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min(1, (now - began) / duration)
      const eased = 1 - (1 - progress) ** 3
      setCurrent(Math.round(value * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [start, value])
  return <>{current}</>
}

export function About() {
  const { t } = useLanguage()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })

  return (
    <section id="about" className="section-anchor bg-milk py-20 text-ink md:py-28">
      <div className="mx-auto max-w-[1240px] px-4 md:px-6">
        <SectionHeading index={t.about.index} eyebrow={t.about.eyebrow} title={t.about.title} text={t.about.text} />
        <div ref={ref} className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.about.cards.map((card, index) => (
            <motion.article
              key={card.label + card.value}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06, duration: 0.5 }}
              className="card-hover rounded-3xl border border-navy/10 bg-white px-5 py-6 shadow-[0_10px_30px_rgba(16,44,58,0.04)]"
            >
              <div className="mb-6 h-px w-10 bg-gold" />
              <p className="font-display text-5xl text-navy md:text-6xl">
                <Counter value={card.value} start={inView} />
              </p>
              <h3 className="mt-2 font-serif text-2xl text-ink">{card.label}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/70">{card.note}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
