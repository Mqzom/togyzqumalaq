import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { copy, type Lang } from '../data/content'

interface LanguageValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (typeof copy)['kz']
}

const LanguageContext = createContext<LanguageValue | null>(null)

function readLang(): Lang {
  try {
    return localStorage.getItem('togyz-lang') === 'ru' ? 'ru' : 'kz'
  } catch {
    return 'kz'
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang)

  useEffect(() => {
    try {
      localStorage.setItem('togyz-lang', lang)
    } catch {
      /* ignore private mode */
    }
    document.documentElement.lang = lang === 'kz' ? 'kk' : 'ru'
  }, [lang])

  const value = useMemo<LanguageValue>(
    () => ({
      lang,
      setLang: setLangState,
      t: copy[lang],
    }),
    [lang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const value = useContext(LanguageContext)
  if (!value) throw new Error('useLanguage must be used within LanguageProvider')
  return value
}
