import { tuzOwner } from '../../engine/gameRules'
import { playerName, stoneWord } from '../../data/content'
import { useLanguage } from '../../i18n/LanguageContext'
import { useGameContext } from '../../context/GameContext'
import { GamePit } from './GamePit'
import { Kazan } from './Kazan'

const topOrder = [8, 7, 6, 5, 4, 3, 2, 1, 0]
const bottomOrder = [0, 1, 2, 3, 4, 5, 6, 7, 8]

export function GameBoard() {
  const { lang, t } = useLanguage()
  const game = useGameContext()
  const { view, focus, pulse, hintPit, legal, selectPit, settings } = game
  const boardMode = settings.learn ? 'pvp' : settings.mode
  const active = view.phase === 'playing' ? view.currentPlayer : null

  const tuzLine = (player: 0 | 1) => {
    const pit = view.tuz[player]
    return `${t.game.tuz}: ${pit === null ? t.game.noTuz : `${pit + 1}`}`
  }

  const renderRow = (player: 0 | 1, order: number[]) => (
    <div className={`row-shell ${active === player ? `is-active-${player}` : ''}`}>
      <div className="pit-row">
        {order.map((index) => {
          const owner = tuzOwner(view, player, index)
          const playable = legal.includes(index) && view.currentPlayer === player
          return (
            <GamePit
              key={`${player}-${index}`}
              player={player}
              index={index}
              count={view.pits[player][index]}
              tuzBy={owner}
              focused={focus?.player === player && focus.pit === index}
              hinted={hintPit === index && view.currentPlayer === player}
              playable={playable}
              stonesLabel={stoneWord(lang, view.pits[player][index])}
              tuzLabel={t.game.tuz}
              onSelect={selectPit}
            />
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="board-frame">
      <div className="board-wood">
        <div className="board-layout">
          <Kazan
            player={1}
            name={playerName(lang, 1, boardMode, settings.human)}
            score={view.kazan[1]}
            active={active === 1}
            pulse={pulse === 1}
            label={t.game.kazan}
            tuzText={tuzLine(1)}
          />
          <div className="pit-grid space-y-3">
            {renderRow(1, topOrder)}
            <p className="text-center text-[10px] uppercase tracking-[0.18em] text-gold-light/70">{t.game.direction}</p>
            {renderRow(0, bottomOrder)}
          </div>
          <Kazan
            player={0}
            name={playerName(lang, 0, boardMode, settings.human)}
            score={view.kazan[0]}
            active={active === 0}
            pulse={pulse === 0}
            label={t.game.kazan}
            tuzText={tuzLine(0)}
          />
        </div>
      </div>
    </div>
  )
}
