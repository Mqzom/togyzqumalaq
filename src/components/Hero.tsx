import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'
import { scrollToId } from '../utils/cx'

const top = [9, 8, 7, 6, 5, 4, 3, 2, 1]
const bottom = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function MiniPit({ label }: { label: number }) {
  return (
    <div className="relative aspect-square min-w-0 rounded-full bg-[radial-gradient(circle_at_50%_40%,#3a291e,#100c09_70%)] shadow-[inset_0_6px_8px_rgba(0,0,0,0.7),0_1px_0_rgba(228,204,150,0.3)]">
      <span className="absolute left-0 right-0 top-1 text-center font-display text-[9px] text-gold-light/70">{label}</span>
      <span className="absolute left-1/2 top-[46%] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#e6d3b0] shadow" />
      <span className="absolute left-[30%] top-[58%] h-1.5 w-1.5 rounded-full bg-[#c4b49a]" />
      <span className="absolute left-[52%] top-[60%] h-1.5 w-1.5 rounded-full bg-[#b7c0b4]" />
    </div>
  )
}

export function HeroBoard() {
  return (
    <div className="float-board board-frame w-full min-w-0">
      <div className="board-wood px-4 py-5 sm:px-6 sm:py-7">
        <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-gold-light/70">
          <span>162</span>
          <span>отау</span>
          <span>82</span>
        </div>
        <div className="grid min-w-0 grid-cols-[34px_minmax(0,1fr)_34px] items-center gap-1.5 sm:grid-cols-[68px_minmax(0,1fr)_68px] sm:gap-3">
          <div className="flex h-full min-h-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_50%_40%,#3d2a1d,#140e0a_72%)] font-display text-lg text-gold-light shadow-[inset_0_10px_14px_rgba(0,0,0,0.65)] sm:min-h-28 sm:text-2xl">
            0
          </div>
          <div className="min-w-0 space-y-1.5 sm:space-y-2">
            <div className="grid grid-cols-9 gap-1">
              {top.map((label) => (
                <MiniPit key={`t${label}`} label={label} />
              ))}
            </div>
            <div className="grid grid-cols-9 gap-1">
              {bottom.map((label) => (
                <MiniPit key={`b${label}`} label={label} />
              ))}
            </div>
          </div>
          <div className="flex h-full min-h-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_50%_40%,#3d2a1d,#140e0a_72%)] font-display text-lg text-gold-light shadow-[inset_0_10px_14px_rgba(0,0,0,0.65)] sm:min-h-28 sm:text-2xl">
            0
          </div>
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  const { t } = useLanguage()
  return (
    <section id="top" className="section-anchor relative overflow-hidden bg-navy grain">
      <div className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-teal/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
      <div className="mx-auto grid min-h-screen max-w-[1240px] grid-cols-1 items-center gap-12 px-4 pb-16 pt-28 md:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:pt-24">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[11px] font-semibold uppercase tracking-eyebrow text-gold"
          >
            {t.hero.eyebrow}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-4 font-serif text-[clamp(4rem,8.4vw,7.1rem)] font-semibold leading-[0.92] text-milk"
          >
            {t.hero.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="mt-6 max-w-xl font-serif text-xl italic leading-snug text-gold-light md:text-2xl"
          >
            {t.hero.subtitle}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            className="mt-5 max-w-xl text-base leading-8 text-milk/75"
          >
            {t.hero.text}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <button type="button" className="btn btn-primary" onClick={() => scrollToId('play')}>
              {t.hero.play}
            </button>
            <button type="button" className="btn btn-gold" onClick={() => scrollToId('history')}>
              {t.hero.history}
            </button>
            <span className="ml-1 rounded-full border border-gold/40 px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-gold-light">
              {t.hero.badge}
            </span>
          </motion.div>
        </div>
        <motion.div
          className="min-w-0"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
        >
          <HeroBoard />
        </motion.div>
      </div>
    </section>
  )
}
