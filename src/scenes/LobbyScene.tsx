import { useState } from 'react'
import { useUI } from '../store/uiStore'
import { useTournament } from '../store/tournamentStore'
import { useStats, winratePct } from '../store/statsStore'
import { StatsSheet } from '../ui/StatsSheet'
import { CardCodexSheet } from '../ui/CardCodexSheet'
import { CardDetailSheet } from '../ui/CardDetailSheet'
import { openTutorial } from '../ui/OnboardingOverlay'
import { HoloCTA } from '../ui/HoloCTA'
import { Chip } from '../ui/Chip'
import { sfx } from '../audio/sfx'
import type { Card } from '../game/types'

export function LobbyScene() {
  const setScene = useUI((s) => s.setScene)
  const startTournament = useTournament((s) => s.startTournament)
  const reset = useTournament((s) => s.reset)
  const recordTournamentStart = useStats((s) => s.recordTournamentStart)
  const stats = useStats()
  const [statsOpen, setStatsOpen] = useState(false)
  const [codexOpen, setCodexOpen] = useState(false)
  const [codexDetail, setCodexDetail] = useState<Card | null>(null)
  const [sfxOn, setSfxOn] = useState(() => sfx.isEnabled())
  const wr = winratePct(stats)

  return (
    <div className="absolute inset-0 scene-scroll">
      <div className="scene-bg cyber-grid opacity-50" />
      <div className="scene-bg scanlines" />

      <div className="relative min-h-full flex flex-col justify-between px-6 py-8 pt-safe pb-safe z-10 gap-4">

        {/* Header — title chip + SYSTEM ONLINE indicator */}
        <div className="flex items-center justify-between">
          <Chip variant="cyan" size="xs">LOBBY</Chip>
          <div className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.25em] text-arena-textDim uppercase">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-neon-red animate-pulse-neon" />
            SYSTEM ONLINE
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mt-4">
          <h1 className="font-display font-normal text-6xl leading-[0.9] tracking-widest text-holo"
              style={{ letterSpacing: '0.06em' }}>
            RANDOM<br />BATTLE
          </h1>
          <div className="text-[11px] tracking-[0.3em] text-arena-textDim font-mono mt-4 uppercase">
            // Underground Auto-Draft Arena
          </div>
          <div className="inline-block mt-3">
            <Chip variant="magenta" size="xs">v0.1 · MVP</Chip>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <HoloCTA
            fullWidth
            onClick={() => {
              sfx.tap()
              reset()
              startTournament()
              recordTournamentStart()
              setScene('tourboard')
            }}
          >
            ▶ NEW TOURNAMENT
          </HoloCTA>
          <div className="grid grid-cols-2 gap-3">
            <HoloCTA variant="secondary" size="md" fullWidth
                     onClick={() => { sfx.tap(); openTutorial() }}>
              📖 튜토리얼
            </HoloCTA>
            <HoloCTA variant="secondary" size="md" fullWidth
                     onClick={() => { sfx.tap(); setCodexOpen(true) }}>
              🎴 카드 도감
            </HoloCTA>
          </div>
        </div>

        {/* Stats snapshot */}
        {stats.totalTournaments > 0 && (
          <div className="grid grid-cols-3 gap-2 px-1">
            <StatBlock label="CHAMPS" value={stats.championships} />
            <StatBlock label="MATCHES" value={stats.totalMatchesWon + stats.totalMatchesLost} />
            <StatBlock label="WIN RATE" value={wr === null ? '—' : `${wr}%`} />
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-around py-3 border-t border-arena-lineDim font-mono text-[10px] tracking-widest text-arena-textDim uppercase">
          <a href="/manual/" className="px-2 py-1 text-neon-cyan hover:underline">GUIDE</a>
          <button onClick={() => setStatsOpen(true)}
                  className="px-2 py-1 text-neon-cyan hover:underline">
            STATS
          </button>
          <button
            onClick={() => {
              const next = !sfxOn
              sfx.setEnabled(next)
              setSfxOn(next)
              if (next) sfx.tap()
            }}
            className={`px-2 py-1 ${sfxOn ? 'text-neon-cyan' : 'text-arena-textMuted'} hover:underline`}
          >
            {sfxOn ? 'SFX ●' : 'SFX ○'}
          </button>
        </div>
      </div>

      <StatsSheet open={statsOpen} onClose={() => setStatsOpen(false)} />
      <CardCodexSheet
        open={codexOpen}
        onClose={() => setCodexOpen(false)}
        onCardTap={(c) => setCodexDetail(c)}
      />
      <CardDetailSheet card={codexDetail} onClose={() => setCodexDetail(null)} />
    </div>
  )
}

function StatBlock({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="text-center p-2 border border-arena-lineDim rounded bg-black/40">
      <div className="font-display font-normal text-neon-cyan text-2xl leading-none"
           style={{ textShadow: '0 0 8px rgba(34,233,255,0.55)' }}>
        {value}
      </div>
      <div className="font-mono text-[9px] tracking-widest text-arena-textDim mt-1 uppercase">
        {label}
      </div>
    </div>
  )
}
