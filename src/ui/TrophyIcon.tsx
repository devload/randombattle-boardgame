import type { Trophy } from '../game/types.ts'

export function TrophyBadge({ trophies }: { trophies: readonly Trophy[] }) {
  if (trophies.length === 0) {
    return <span className="font-mono text-[10px] text-arena-textMuted">🏆×0</span>
  }
  return (
    <span className="font-mono text-[11px] text-neon-yellow"
          style={{ textShadow: '0 0 6px rgba(255,230,0,0.6)' }}>
      🏆×{trophies.length}
    </span>
  )
}
