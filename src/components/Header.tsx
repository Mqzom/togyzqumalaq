import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'
import { cx, scrollToId } from '../utils/cx'
import { Logo } from './Logo'

const links = [
  { id: 'top', key: 'home' },
  { id: 'about', key: 'about' },
  { id: 'history', key: 'history' },
  { id: 'rules', key: 'rules' },
  { id: 'play', key: 'play' },
] as const

export function Header() {
  const { lang, setLang, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('top')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const nodes = links
      .map((link) => document.getElementById(link.id))
      .filter((node): node is HTMLElement => Boolean(node))
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target.id) setActive(visible.target.id)
      },
      { rootMargin: '-40% 0px -45% 0px', threshold: [0.1, 0.3, 0.6] },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const go = (id: string) => {
    setOpen(false)
    scrollToId(id)
  }

  return (
    <header
      className={cx(
        'fixed inset-x-0 top-0 z-40 transition-colors duration-300',
        scrolled || open ? 'border-b border-white/10 bg-navy/80 backdrop-blur-md' : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-4 md:px-6">
        <button type="button" onClick={() => go('top')} className="rounded-full" aria-label="TOĞYZQUMALAQ">
          <Logo compact />
        </button>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="primary">
          {links.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => go(link.id)}
              className={cx(
                'text-sm transition-colors',
                active === link.id ? 'text-gold-light' : 'text-milk/75 hover:text-milk',
              )}
            >
              {t.nav[link.key]}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-gold/40 p-0.5 text-xs font-semibold">
            {(['kz', 'ru'] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className={cx(
                  'rounded-full px-2.5 py-1 uppercase',
                  lang === code ? 'bg-gold text-navy' : 'text-gold-light',
                )}
                aria-pressed={lang === code}
              >
                {code}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-primary hidden !min-h-10 !px-4 md:inline-flex" onClick={() => go('play')}>
            {t.nav.cta}
          </button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-milk lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? 'Close' : 'Menu'}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-white/10 bg-navy/95 px-4 py-6 lg:hidden">
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => go(link.id)}
                className="rounded-xl px-3 py-3 text-left font-serif text-2xl text-milk"
              >
                {t.nav[link.key]}
              </button>
            ))}
            <button type="button" className="btn btn-primary mt-3" onClick={() => go('play')}>
              {t.nav.cta}
            </button>
          </div>
        </div>
      ) : null}
    </header>
  )
}
