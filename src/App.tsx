import { motion } from 'framer-motion'
import { useUI } from './store/uiStore'
import { LobbyScene } from './scenes/LobbyScene'
import { TournamentBoardScene } from './scenes/TournamentBoardScene'
import { DeckPhaseScene } from './scenes/DeckPhaseScene'
import { MatchPhaseScene } from './scenes/MatchPhaseScene'
import { FinalScene } from './scenes/FinalScene'
import { ResultScene } from './scenes/ResultScene'
import { SceneSwitcher } from './ui/SceneSwitcher'
import { OnboardingOverlay } from './ui/OnboardingOverlay'
import { ToastStack } from './ui/ToastStack'
import { useServiceWorker } from './hooks/useServiceWorker'
import { Analytics } from '@vercel/analytics/react'

export default function App() {
  const scene = useUI((s) => s.scene)
  useServiceWorker()

  return (
    <div className="w-full h-full relative">
      <motion.div
        key={scene}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0"
      >
        {scene === 'lobby' && <LobbyScene />}
        {scene === 'tourboard' && <TournamentBoardScene />}
        {scene === 'deck' && <DeckPhaseScene />}
        {scene === 'match' && <MatchPhaseScene />}
        {scene === 'final' && <FinalScene />}
        {scene === 'result' && <ResultScene />}
      </motion.div>
      <SceneSwitcher />
      <ToastStack />
      <OnboardingOverlay />
      <Analytics />
    </div>
  )
}
