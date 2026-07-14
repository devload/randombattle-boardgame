import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUI } from '../store/uiStore'
import { useTournament } from '../store/tournamentStore'
import { useMatch } from '../store/matchStore'
import { robotById } from '../game/robots'
import { decideFirstPlayer } from '../game/tournament'
import { sfx } from '../audio/sfx'

/**
 * Final round — top-2 fan holders face off.
 *
 * Original rules: no card picks before the final, only optional trim.
 * MVP: skip trim UI too; player fights with the deck they built through R7.
 */
export function FinalScene() {
  const setScene = useUI((s) => s.setScene)
  const humanDeck = useTournament((s) => s.humanDeck)
  const currentOpponentId = useTournament((s) => s.currentOpponentId)
  const currentSeed = useTournament((s) => s.currentSeed)
  const players = useTournament((s) => s.players)
  const robotDecks = useTournament((s) => s.robotDecks)
  const finalOpponentName = useTournament((s) => s.finalOpponentName)
  const startMatch = useMatch((s) => s.start)

  const opponent = currentOpponentId ? robotById(currentOpponentId) : null

  useEffect(() => { sfx.intro() }, [])

  function enterFinal() {
    sfx.tap()
    if (!opponent) return
    const human = players.find((p) => p.isHuman)
    const opponentPlayer = players.find((p) => p.id === opponent.id)
    const firstPlayer = human && opponentPlayer
      ? decideFirstPlayer(8, human, { trophies: opponentPlayer.trophies }, currentSeed)
      : 'A'
    const opponentDeck = robotDecks[opponent.id] ?? opponent.makeDeck()
    startMatch({
      deckA: humanDeck,
      deckB: opponentDeck,
      seed: currentSeed,
      firstPlayer,
      labelA: { name: 'YOU', icon: '👤' },
      labelB: { name: opponent.name, icon: opponent.icon },
    })
    setScene('match')
  }

  return (
    <div className="absolute inset-0 scene-scroll">
      <div className="scene-bg cyber-grid opacity-40" />
      <div className="scene-bg scanlines" />

      <div className="relative min-h-full flex flex-col items-center justify-between p-6 pt-safe pb-safe z-10 gap-4">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-12"
        >
          <div className="font-mono text-[11px] tracking-widest text-neon-magenta mb-2">
            // FINAL ROUND
          </div>
          <h1 className="font-display font-black text-5xl leading-none tracking-wider text-holo">
            THE FINAL
          </h1>
          <div className="font-mono text-[10px] tracking-widest text-neon-cyan mt-2">
            C H A M P I O N S H I P · M A T C H
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: 'spring' }}
          className="flex items-center gap-6"
        >
          <div className="text-center">
            <div className="w-24 h-24 rounded-xl flex items-center justify-center text-5xl
                            bg-arena-panel2 border-2 border-neon-cyan shadow-neon-cyan">
              👤
            </div>
            <div className="font-display font-bold text-white mt-2 tracking-widest">YOU</div>
          </div>
          <div className="font-display font-black text-4xl text-neon-magenta"
               style={{ textShadow: '0 0 12px rgba(255,43,214,0.55)' }}>
            VS
          </div>
          <div className="text-center">
            <div className="w-24 h-24 rounded-xl flex items-center justify-center text-5xl
                            bg-arena-panel2 border-2 border-neon-red shadow-neon-red">
              {opponent?.icon ?? '🤖'}
            </div>
            <div className="font-display font-bold text-white mt-2 tracking-widest">
              {finalOpponentName ?? opponent?.name ?? 'BOT'}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center font-body text-arena-textDim"
        >
          <p className="text-sm">Winner takes <span className="text-neon-yellow">10 fans</span></p>
          <p className="text-xs mt-1 opacity-60">No draft. Fight with the deck you built.</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          onClick={enterFinal}
          className="w-full py-4 clip-cyber font-display font-bold text-sm tracking-widest uppercase
                     bg-holo-gradient text-arena-void shadow-neon-cyan"
        >
          FIGHT →
        </motion.button>
      </div>
    </div>
  )
}
