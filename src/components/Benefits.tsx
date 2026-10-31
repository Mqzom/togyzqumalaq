import { Brain, Calculator, Compass, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'
import { SectionHeading } from './SectionHeading'

const icons = [Brain, Calculator, Compass, Eye]

export function Benefits() {
  const { t } = useLanguage()
  return (
    <section id="benefits" className="section-anchor bg-milk py-20 text-ink md:py-28">
      <div className="mx-auto max-w-[1240px] px-4 md:px-6">
        <SectionHeading index={t.benefits.index} eyebrow={t.benefits.eyebrow} title={t.benefits.title} text={t.benefits.text} />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {t.benefits.cards.map((card, index) => {
            const Icon = icons[index]
            return (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="card-hover rounded-3xl border border-navy/10 bg-white p-6"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-navy text-gold-light">
                  <Icon size={20} />
                </span>
                <h3 className="mt-5 font-serif text-2xl leading-tight">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink/70">{card.text}</p>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
