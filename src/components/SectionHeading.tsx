import { cx } from '../utils/cx'

export function Ornament({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" className={cx('text-gold', className)} fill="none" aria-hidden="true">
      <rect x="28" y="28" width="104" height="104" stroke="currentColor" strokeWidth="0.6" />
      <circle cx="80" cy="80" r="34" stroke="currentColor" strokeWidth="0.7" />
      <path d="M80 18 L90 40 H70 Z" stroke="currentColor" strokeWidth="0.7" />
      <path d="M80 142 L70 120 H90 Z" stroke="currentColor" strokeWidth="0.7" />
      <path d="M18 80 L40 70 V90 Z" stroke="currentColor" strokeWidth="0.7" />
      <path d="M142 80 L120 90 V70 Z" stroke="currentColor" strokeWidth="0.7" />
      <path d="M80 46 v68 M46 80 h68" stroke="currentColor" strokeWidth="0.45" />
    </svg>
  )
}

export function SectionHeading({
  index,
  eyebrow,
  title,
  text,
  light = false,
}: {
  index: string
  eyebrow: string
  title: string
  text?: string
  light?: boolean
}) {
  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 text-gold">
        <span className="font-display text-sm tracking-eyebrow">{index}</span>
        <span className="h-px w-10 bg-gold/80" />
        <span className="text-[11px] font-semibold uppercase tracking-eyebrow">{eyebrow}</span>
      </div>
      <h2
        className={cx(
          'mt-4 font-serif text-[clamp(2.15rem,4.4vw,3.7rem)] font-semibold leading-[1.12] text-balance',
          light ? 'text-milk' : 'text-ink',
        )}
      >
        {title}
      </h2>
      {text ? (
        <p className={cx('mt-5 max-w-2xl text-base leading-8 md:text-lg', light ? 'text-milk/75' : 'text-ink/75')}>
          {text}
        </p>
      ) : null}
    </div>
  )
}
