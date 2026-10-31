import { Component, type ReactNode } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { SectionHeading } from '../SectionHeading'
import { GameBoard } from './GameBoard'
import { GameControls } from './GameControls'
import { GameResult } from './GameResult'
import { GameSettings } from './GameSettings'
import { GameStatus } from './GameStatus'
import { LearnMode, RulesDialog, TuzDialog } from './GameOverlays'
import { useGameContext } from '../../context/GameContext'

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="rounded-3xl border border-gold/30 p-6 text-milk">
          <p>Тоғызқұмалақ</p>
          <button type="button" className="btn btn-primary mt-4" onClick={() => this.setState({ failed: false })}>
            OK
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function GameBody() {
  const { t } = useLanguage()
  const { toast } = useGameContext()
  return (
    <section id="play" className="section-anchor relative bg-[#0e2832] py-20 text-milk md:py-28">
      <div className="mx-auto max-w-[1100px] px-2 sm:px-4 md:px-6">
        <SectionHeading index={t.game.index} eyebrow={t.game.eyebrow} title={t.game.title} text={t.game.text} light />
        <div className="mt-8">
          <GameSettings />
          <LearnMode />
          <div className="relative">
            <GameStatus />
            <GameBoard />
            <GameControls />
            {toast ? (
              <p className="mt-3 text-sm text-gold-light" aria-live="polite">
                {toast}
              </p>
            ) : null}
            <GameResult />
            <TuzDialog />
            <RulesDialog />
          </div>
        </div>
      </div>
    </section>
  )
}

export function GameSection() {
  return (
    <Boundary>
      <GameBody />
    </Boundary>
  )
}
