import { cx } from '../utils/cx'

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <rect x="1.2" y="1.2" width="33.6" height="33.6" rx="9" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="18" cy="18" r="6.5" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="18" cy="18" r="1.7" fill="#1B9A91" />
      <path
        d="M18 6.5v3.2M18 26.3V29.5M6.5 18h3.2M26.3 18H29.5M10 10l2.2 2.2M23.8 23.8 26 26M26 10l-2.2 2.2M12.2 23.8 10 26"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Logo({ light = true, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <span className={cx('inline-flex items-center gap-2.5', light ? 'text-gold-light' : 'text-navy')}>
      <Mark className="h-9 w-9" />
      <span className={cx('font-display text-[1.35rem] font-semibold tracking-[0.14em]', compact && 'hidden sm:inline')}>
        TOĞYZQUMALAQ
      </span>
    </span>
  )
}
