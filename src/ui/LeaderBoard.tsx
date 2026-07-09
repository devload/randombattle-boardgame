import type { TournamentPlayer } from '../game/types.ts'
import { totalFans, leaderboard } from '../game/tournament.ts'
import { TrophyBadge } from './TrophyIcon.tsx'
import { ROBOTS } from '../game/robots.ts'

/** Full leaderboard: human highlighted, top row gold. */
export function LeaderBoard({ players }: { players: readonly TournamentPlayer[] }) {
  const sorted = leaderboard(players)
  return (
    <div className="flex flex-col gap-1">
      {sorted.map((p, i) => (
        <Row key={p.id} player={p} rank={i + 1} />
      ))}
    </div>
  )
}

function Row({ player, rank }: { player: TournamentPlayer; rank: number }) {
  const isMe = player.isHuman
  const isTop = rank === 1
  const bot = ROBOTS.find((r) => r.id === player.id)
  const icon = player.isHuman ? '👤' : bot?.icon ?? '🤖'

  const base = 'grid grid-cols-[24px_1fr_auto_auto] items-center gap-2 px-3 py-2 rounded border font-body text-[13px]'
  const flavor = isMe
    ? 'border-neon-cyan bg-gradient-to-r from-neon-cyan/10 to-transparent shadow-[0_0_12px_rgba(0,229,255,0.15)]'
    : isTop
    ? 'border-neon-yellow bg-gradient-to-r from-neon-yellow/10 to-transparent'
    : 'border-arena-lineDim bg-black/30'

  const rankColor = isTop ? 'text-neon-yellow' : 'text-neon-cyan'
  const fanColor = isTop ? 'text-neon-yellow' : 'text-neon-cyan'

  return (
    <div className={`${base} ${flavor}`}>
      <div className={`font-display font-black text-center ${rankColor}`}
           style={isTop ? { textShadow: '0 0 8px rgba(255,230,0,0.6)' } : undefined}>
        {rank}
      </div>
      <div className="flex items-center gap-1.5 font-semibold">
        {icon} <span>{player.name}</span>
        {isMe && <span className="ml-1 bg-neon-cyan text-arena-void font-mono text-[8px] px-1 py-0.5 rounded-sm tracking-widest">ME</span>}
        {!isMe && <span className="ml-1 bg-arena-panel2 border border-arena-line text-arena-textDim font-mono text-[8px] px-1 py-0.5 rounded-sm tracking-widest">BOT</span>}
      </div>
      <TrophyBadge trophies={player.trophies} />
      <div className={`font-display font-bold min-w-[32px] text-right ${fanColor}`}
           style={isTop ? { textShadow: '0 0 6px rgba(255,230,0,0.6)' } : undefined}>
        {totalFans(player)}
      </div>
    </div>
  )
}
