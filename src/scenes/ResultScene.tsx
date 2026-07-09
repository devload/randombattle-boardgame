import { useEffect, useRef } from 'react'
import { useUI } from '../store/uiStore'
import { useTournament } from '../store/tournamentStore'
import { useStats } from '../store/statsStore'
import { leaderboard, totalFans } from '../game/tournament'
import { ROBOTS } from '../game/robots'
import { TrophyBadge } from '../ui/TrophyIcon'
import { Confetti } from '../ui/Confetti'
import { sfx } from '../audio/sfx'

export function ResultScene() {
  const setScene = useUI((s) => s.setScene)
  const players = useTournament((s) => s.players)
  const reset = useTournament((s) => s.reset)
  const startTournament = useTournament((s) => s.startTournament)
  const recordChampionship = useStats((s) => s.recordChampionship)

  const sorted = leaderboard(players)
  const winner = sorted[0]
  const winnerIsHuman = winner?.isHuman ?? false
  const winnerIcon = winnerIsHuman ? '👤' : (ROBOTS.find((r) => r.id === winner?.id)?.icon ?? '🤖')

  // Fire championship stats once per scene enter, only when human won.
  const recordedRef = useRef(false)
  useEffect(() => {
    const human = sorted.find((p) => p.isHuman)
    if (!recordedRef.current && winnerIsHuman && human) {
      recordChampionship(totalFans(human))
      recordedRef.current = true
    }
  }, [winnerIsHuman, sorted, recordChampionship])

  useEffect(() => {
    if (winnerIsHuman) sfx.win()
    else sfx.lose()
  }, [winnerIsHuman])

  return (
    <div className="absolute inset-0 scene-scroll">
      <div className="scene-bg cyber-grid opacity-40" />
      {winnerIsHuman && <Confetti count={60} />}

      <div className="relative min-h-full flex flex-col p-5 pt-safe pb-safe z-10 gap-3">

        {/* Banner */}
        <div className="text-center mt-8">
          <div className="font-mono text-[11px] tracking-widest text-neon-magenta mb-2">
            // TOURNAMENT COMPLETE
          </div>
          <div className="font-display font-black text-5xl leading-none tracking-wider text-holo">
            {winnerIsHuman ? 'CHAMPION' : 'DEFEATED'}
          </div>
          <div className="font-mono text-[10px] tracking-widest text-neon-cyan mt-1">
            A U T O · D R A F T · {winnerIsHuman ? 'VICTORY' : 'RETRY'}
          </div>
        </div>

        {/* Winner hero */}
        <div className="flex justify-center py-2 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-4xl"
               style={{ filter: 'drop-shadow(0 0 12px rgba(255,230,0,0.6))' }}>
            👑
          </div>
          <div className="w-24 h-24 rounded-xl flex items-center justify-center text-6xl bg-holo-gradient shadow-neon-cyan">
            {winnerIcon}
          </div>
        </div>

        {/* Winner stats */}
        {winner && (
          <div className="flex justify-around p-3 bg-black/50 border border-neon-cyan rounded-lg shadow-[0_0_20px_rgba(0,229,255,0.15)]">
            <StatBlock label="FANS" value={totalFans(winner)} />
            <StatBlock label="TROPHIES" value={winner.trophies.length} />
            <StatBlock label="NAME" value={winner.name} />
          </div>
        )}

        {/* Final board */}
        <div className="bg-black/40 border border-arena-lineDim rounded p-2.5">
          {sorted.map((p, i) => {
            const bot = ROBOTS.find((r) => r.id === p.id)
            const icon = p.isHuman ? '👤' : bot?.icon ?? '🤖'
            const isWinner = i === 0
            return (
              <div
                key={p.id}
                className={`grid grid-cols-[20px_1fr_auto_auto] items-center gap-2 px-2 py-1.5
                            font-body text-[12px] border-b border-arena-lineDim last:border-b-0
                            ${isWinner ? 'bg-gradient-to-r from-neon-yellow/10 to-transparent' : ''}`}
              >
                <div className={`font-display font-black text-center ${isWinner ? 'text-neon-yellow' : 'text-neon-cyan'}`}
                     style={isWinner ? { textShadow: '0 0 6px rgba(255,230,0,0.6)' } : undefined}>
                  {i + 1}
                </div>
                <div className="flex items-center gap-1.5">
                  {icon}
                  <span className={`font-display font-bold ${p.isHuman ? 'text-white' : ''}`}>{p.name}</span>
                </div>
                <TrophyBadge trophies={p.trophies} />
                <div className={`font-display font-bold min-w-[32px] text-right
                                 ${isWinner ? 'text-neon-yellow' : 'text-neon-cyan'}`}
                     style={isWinner ? { textShadow: '0 0 6px rgba(255,230,0,0.6)' } : undefined}>
                  {totalFans(p)}
                </div>
              </div>
            )
          })}
        </div>

        {/* CTAs */}
        <div className="mt-auto flex flex-col gap-2">
          <button
            onClick={() => {
              reset()
              startTournament()
              setScene('tourboard')
            }}
            className="w-full py-4 clip-cyber font-display font-bold text-sm tracking-widest uppercase
                       bg-holo-gradient text-arena-void shadow-neon-cyan"
          >
            ▶ PLAY AGAIN
          </button>
          <button
            onClick={() => {
              reset()
              setScene('lobby')
            }}
            className="w-full py-3 clip-cyber font-display font-bold text-xs tracking-widest uppercase
                       border border-neon-cyan text-neon-cyan bg-neon-cyan/5"
          >
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  )
}

function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center font-mono text-[10px] text-arena-textDim tracking-widest">
      <div className="font-display font-black text-2xl text-neon-cyan"
           style={{ textShadow: '0 0 8px rgba(0,229,255,0.55)' }}>
        {value}
      </div>
      <div>{label}</div>
    </div>
  )
}
