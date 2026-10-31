import { useLanguage } from '../i18n/LanguageContext'
import { scrollToId } from '../utils/cx'
import { Logo } from './Logo'

export function Footer() {
  const { t } = useLanguage()
  const links = [
    { id: 'about', label: t.nav.about },
    { id: 'history', label: t.nav.history },
    { id: 'rules', label: t.nav.rules },
    { id: 'play', label: t.nav.play },
  ]
  return (
    <footer className="border-t border-white/10 bg-[#0c1f27] py-12 text-milk">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-8 px-4 md:flex-row md:items-end md:justify-between md:px-6">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-milk/70">{t.footer.note}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-gold">{t.footer.unesco}</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-milk/75">
          {links.map((link) => (
            <button key={link.id} type="button" onClick={() => scrollToId(link.id)} className="hover:text-gold-light">
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  )
}
