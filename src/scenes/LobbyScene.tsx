import { useState } from 'react'
import { useUI } from '../store/uiStore'
import { useTournament } from '../store/tournamentStore'
import { useStats, winratePct } from '../store/statsStore'
import { StatsSheet } from '../ui/StatsSheet'
import { CardCodexSheet } from '../ui/CardCodexSheet'
import { CardDetailSheet } from '../ui/CardDetailSheet'
import { openTutorial } from '../ui/OnboardingOverlay'
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
      <div className="scene-bg cyber-grid opacity-60" />
      <div className="scene-bg scanlines" />

      <div className="relative min-h-full flex flex-col justify-between px-6 py-10 pt-safe pb-safe z-10 gap-4">
        <div className="text-center mt-8">
          <div className="text-[10px] tracking-[0.3em] text-neon-cyan font-mono opacity-70 mb-2">
            // SYSTEM ONLINE
          </div>
          <h1 className="font-display font-black text-5xl leading-none tracking-wider text-holo">
            RANDOM<br />BATTLE
          </h1>
          <div className="text-xs tracking-[0.25em] text-arena-textDim font-mono mt-3">
            A U T O · D R A F T · A R E N A
          </div>
          <div className="inline-block mt-3 text-[10px] tracking-[0.15em] font-mono text-neon-magenta border border-neon-magenta px-2 py-0.5">
            v0.1 MVP
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              sfx.tap()
              reset()
              startTournament()
              recordTournamentStart()
              setScene('tourboard')
            }}
            className="w-full py-4 clip-cyber font-display font-bold text-sm tracking-[0.12em] uppercase
                       bg-holo-gradient text-arena-void shadow-neon-cyan
                       hover:-translate-y-0.5 transition"
          >
            ▶ NEW TOURNAMENT
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { sfx.tap(); openTutorial() }}
              className="py-2.5 clip-cyber font-display font-bold text-xs tracking-[0.12em] uppercase
                         border border-neon-cyan text-neon-cyan bg-neon-cyan/5
                         hover:-translate-y-0.5 transition"
            >
              📖 튜토리얼
            </button>
            <button
              onClick={() => { sfx.tap(); setCodexOpen(true) }}
              className="py-2.5 clip-cyber font-display font-bold text-xs tracking-[0.12em] uppercase
                         border border-neon-magenta text-neon-magenta bg-neon-magenta/5
                         hover:-translate-y-0.5 transition"
            >
              🎴 카드 도감
            </button>
          </div>
        </div>

        {stats.totalTournaments > 0 && (
          <div className="flex justify-around gap-2 py-2 px-3 bg-black/40 border border-arena-lineDim rounded font-mono text-[10px] text-arena-textDim">
            <div className="text-center">
              <div className="font-display font-black text-neon-cyan text-lg leading-none"
                   style={{ textShadow: '0 0 6px rgba(0,229,255,0.55)' }}>
                {stats.championships}
              </div>
              <div className="mt-0.5 tracking-widest">CHAMPS</div>
            </div>
            <div className="text-center">
              <div className="font-display font-black text-neon-cyan text-lg leading-none"
                   style={{ textShadow: '0 0 6px rgba(0,229,255,0.55)' }}>
                {stats.totalMatchesWon + stats.totalMatchesLost}
              </div>
              <div className="mt-0.5 tracking-widest">MATCHES</div>
            </div>
            <div className="text-center">
              <div className="font-display font-black text-neon-cyan text-lg leading-none"
                   style={{ textShadow: '0 0 6px rgba(0,229,255,0.55)' }}>
                {wr === null ? '—' : `${wr}%`}
              </div>
              <div className="mt-0.5 tracking-widest">WIN RATE</div>
            </div>
          </div>
        )}

        <div className="flex justify-around py-3 border-t border-arena-lineDim font-mono text-[11px] text-arena-textDim">
          <a href="/manual/" className="px-2 py-1 text-neon-cyan hover:underline">GUIDE</a>
          <button
            onClick={() => setStatsOpen(true)}
            className="px-2 py-1 text-neon-cyan hover:underline"
          >
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
