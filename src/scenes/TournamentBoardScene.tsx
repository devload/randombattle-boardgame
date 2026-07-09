import { useEffect } from 'react'
import { useUI } from '../store/uiStore'
import { useTournament } from '../store/tournamentStore'
import { LeaderBoard } from '../ui/LeaderBoard'
import { openLevels } from '../game/deck'
import { robotById } from '../game/robots'
import { TOTAL_ROUNDS } from '../game/tournament'

export function TournamentBoardScene() {
  const setScene = useUI((s) => s.setScene)
  const { players, round, currentOpponentId, startTournament } = useTournament()

  // Auto-start on entry if no roster yet.
  useEffect(() => {
    if (players.length === 0) startTournament()
  }, [players.length, startTournament])

  const opponent = currentOpponentId ? robotById(currentOpponentId) : null
  const levels = openLevels(round)

  return (
    <div className="absolute inset-0 scene-scroll">
      <div className="scene-bg cyber-grid opacity-40" />

      <div className="relative min-h-full flex flex-col p-4 pt-safe pb-safe z-10 gap-3">

        {/* Header */}
        <div className="flex justify-between items-center px-1">
          <div className="font-display text-sm tracking-widest text-neon-cyan">TOURNAMENT</div>
          <div className="font-mono text-[11px] tracking-widest text-neon-magenta">
            ROUND {String(round).padStart(2, '0')} / {String(TOTAL_ROUNDS).padStart(2, '0')}
          </div>
        </div>

        {/* Round dots */}
        <RoundTrack round={round} />

        {/* Leaderboard */}
        <SectionTitle>LEADERBOARD</SectionTitle>
        {players.length > 0 ? (
          <LeaderBoard players={players} />
        ) : (
          <div className="font-mono text-xs text-arena-textDim text-center py-3">
            initializing roster…
          </div>
        )}

        {/* Next match card */}
        <SectionTitle>NEXT MATCH</SectionTitle>
        {opponent ? (
          <div className="flex items-center gap-3 p-3.5 border border-neon-magenta bg-gradient-to-br from-neon-magenta/10 to-neon-cyan/5 rounded-lg shadow-[0_0_20px_rgba(255,43,214,0.2)]">
            <div className="w-14 h-14 rounded-md flex items-center justify-center text-3xl bg-holo-gradient shadow-neon-magenta">
              {opponent.icon}
            </div>
            <div className="flex-1">
              <div className="font-mono text-[10px] tracking-widest text-neon-magenta">// OPPONENT</div>
              <div className="font-display font-black text-lg tracking-wide">{opponent.name}</div>
              <div className="font-body text-[12px] text-arena-textDim italic">"{opponent.hint}"</div>
            </div>
          </div>
        ) : null}

        {/* Piles open */}
        <SectionTitle>DRAFT PILES OPEN</SectionTitle>
        <div className="flex gap-2 justify-center py-1">
          {(['A', 'B', 'C'] as const).map((lv) => {
            const open = levels.includes(lv)
            return (
              <div
                key={lv}
                className={`px-3 py-1.5 rounded font-mono text-[10px] tracking-widest border
                            ${open
                              ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/5 shadow-[0_0_8px_rgba(0,229,255,0.2)]'
                              : 'border-dashed border-arena-lineDim text-arena-textMuted'}`}
              >
                LEVEL {lv}
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-auto">
          <button
            onClick={() => setScene('deck')}
            disabled={!opponent}
            className="w-full py-4 clip-cyber font-display font-bold text-sm tracking-widest uppercase
                       bg-holo-gradient text-arena-void shadow-neon-cyan"
          >
            ENTER THE ARENA →
          </button>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display text-[11px] tracking-widest text-neon-cyan uppercase flex items-center gap-1.5 m-0">
      <span className="w-1 h-3 bg-neon-cyan shadow-neon-cyan inline-block" />
      {children}
    </h3>
  )
}

function RoundTrack({ round }: { round: number }) {
  return (
    <div className="flex gap-1.5 items-center">
      {Array.from({ length: TOTAL_ROUNDS }, (_, i) => {
        const idx = i + 1
        const done = idx < round
        const current = idx === round
        return (
          <div
            key={i}
            className={`h-1 flex-1 rounded-sm ${
              done ? 'bg-neon-cyan shadow-neon-cyan'
              : current ? 'bg-neon-yellow shadow-neon-yellow animate-pulse-neon'
              : 'bg-arena-lineDim'
            }`}
          />
        )
      })}
    </div>
  )
}
