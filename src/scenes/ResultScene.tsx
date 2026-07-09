import { useEffect, useRef } from 'react'
import { useUI } from '../store/uiStore'
import { useTournament } from '../store/tournamentStore'
import { useStats } from '../store/statsStore'
import { leaderboard, totalFans } from '../game/tournament'
import { ROBOTS } from '../game/robots'
import { TrophyBadge } from '../ui/TrophyIcon'
import { Confetti } from '../ui/Confetti'
import { HoloCTA } from '../ui/HoloCTA'
import { Chip } from '../ui/Chip'
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

        {/* Header — title chip */}
        <div className="flex items-center justify-between">
          <Chip variant="cyan" size="xs">RESULT</Chip>
          <Chip variant="magenta" size="xs">// TOURNAMENT COMPLETE</Chip>
        </div>

        {/* Banner */}
        <div className="text-center mt-6">
          <div className={`font-display font-normal text-6xl leading-[0.9] tracking-widest ${winnerIsHuman ? 'text-holo' : 'text-neon-red'}`}
               style={winnerIsHuman ? undefined : { textShadow: '0 0 20px rgba(255,51,85,0.7)' }}>
            {winnerIsHuman ? 'CHAMPION' : 'DEFEATED'}
          </div>
          <div className="font-mono text-[10px] tracking-[0.3em] text-arena-textDim mt-3 uppercase">
            {winnerIsHuman ? '// Underground Auto-Draft Victory' : '// Rematch Available'}
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
          <HoloCTA fullWidth
                   onClick={() => {
                     reset()
                     startTournament()
                     setScene('tourboard')
                   }}>
            ▶ PLAY AGAIN
          </HoloCTA>
          <HoloCTA variant="secondary" size="md" fullWidth
                   onClick={() => {
                     reset()
                     setScene('lobby')
                   }}>
            MAIN MENU
          </HoloCTA>
        </div>
      </div>
    </div>
  )
}

function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center font-mono text-[10px] text-arena-textDim tracking-widest uppercase">
      <div className="font-display font-normal text-2xl text-neon-cyan leading-none"
           style={{ textShadow: '0 0 8px rgba(34,233,255,0.55)' }}>
        {value}
      </div>
      <div className="mt-1">{label}</div>
    </div>
  )
}
