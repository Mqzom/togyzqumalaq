import { useLanguage } from '../i18n/LanguageContext'

export function CulturalSection() {
  const { t } = useLanguage()
  return (
    <section id="heritage" className="section-anchor relative overflow-hidden bg-[#0d242e] py-24 text-milk md:py-32">
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1440 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#102C3A" />
            <stop offset="55%" stopColor="#153F48" />
            <stop offset="100%" stopColor="#1a140f" />
          </linearGradient>
        </defs>
        <rect width="1440" height="640" fill="url(#sky)" />
        <circle cx="1080" cy="150" r="46" fill="none" stroke="#E4CC96" strokeWidth="1.2" opacity="0.8" />
        <path d="M0 390 C 220 330 380 430 620 380 C 860 330 1040 450 1440 360 V640 H0 Z" fill="#1c140f" opacity="0.85" />
        <path d="M0 450 C 260 400 480 500 760 450 C 1040 400 1220 490 1440 440 V640 H0 Z" fill="#2a1c14" />
        <path d="M0 520 C 300 490 640 560 1440 500 V640 H0 Z" fill="#3a291c" />
      </svg>
      <div className="relative mx-auto max-w-4xl px-4 text-center md:px-6">
        <div className="mx-auto mb-6 h-px w-16 bg-gold" />
        <h2 className="font-serif text-[clamp(2.4rem,5vw,4.4rem)] font-semibold leading-[1.12] text-balance">
          {t.culture.title}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-milk/80">{t.culture.text}</p>
      </div>
    </section>
  )
}
