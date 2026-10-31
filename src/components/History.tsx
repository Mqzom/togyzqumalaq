import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'
import { Ornament, SectionHeading } from './SectionHeading'

export function History() {
  const { t } = useLanguage()
  return (
    <section id="history" className="section-anchor relative overflow-hidden bg-navy py-20 text-milk md:py-28">
      <Ornament className="pointer-events-none absolute -right-16 top-10 h-64 w-64 opacity-20" />
      <div className="mx-auto max-w-[1240px] px-4 md:px-6">
        <SectionHeading
          index={t.history.index}
          eyebrow={t.history.eyebrow}
          title={t.history.title}
          light
        />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="space-y-5 text-base leading-8 text-milk/75">
            {t.history.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
          <aside className="relative overflow-hidden rounded-[28px] border border-gold/30 bg-deep/70 p-7">
            <p className="font-display text-7xl leading-none text-gold-light/90">2020</p>
            <h3 className="mt-4 font-serif text-3xl text-milk">{t.history.unescoTitle}</h3>
            <p className="mt-4 text-sm leading-7 text-milk/75">{t.history.unescoText}</p>
          </aside>
        </div>
        <ol className="relative mt-14 space-y-0 border-l border-gold/30 pl-0">
          {t.history.timeline.map((item, index) => (
            <motion.li
              key={item.year}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: index * 0.04 }}
              className="relative grid gap-2 py-5 pl-8 md:grid-cols-[140px_1fr] md:gap-8"
            >
              <span className="absolute -left-[5px] top-7 h-2.5 w-2.5 rounded-full bg-gold" />
              <p className="font-display text-2xl text-gold-light">{item.year}</p>
              <div>
                <h3 className="font-serif text-2xl">{item.title}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-milk/70">{item.text}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
