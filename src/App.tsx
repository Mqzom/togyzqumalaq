import { GameProvider } from './context/GameContext'
import { LanguageProvider } from './i18n/LanguageContext'
import { About } from './components/About'
import { Benefits } from './components/Benefits'
import { CulturalSection } from './components/CulturalSection'
import { FinalCta } from './components/FinalCta'
import { Footer } from './components/Footer'
import { GameSection } from './components/Game/GameSection'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { History } from './components/History'
import { Rules } from './components/Rules'

export default function App() {
  return (
    <LanguageProvider>
      <GameProvider>
        <Header />
        <main>
          <Hero />
          <About />
          <History />
          <Rules />
          <GameSection />
          <Benefits />
          <CulturalSection />
          <FinalCta />
        </main>
        <Footer />
      </GameProvider>
    </LanguageProvider>
  )
}
