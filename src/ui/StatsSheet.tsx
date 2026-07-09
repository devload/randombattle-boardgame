import { useState } from 'react'
import { Sheet } from './Sheet'
import { useStats, winratePct } from '../store/statsStore'

export function StatsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const stats = useStats()
  const resetStats = useStats((s) => s.resetStats)
  const [confirmReset, setConfirmReset] = useState(false)

  const wr = winratePct(stats)
  const totalMatches = stats.totalMatchesWon + stats.totalMatchesLost

  return (
    <Sheet open={open} onClose={onClose} eyebrow="// LIFETIME" title="Stats" maxHeight={0.75}>
      <div className="flex flex-col gap-4 pt-2">

        <StatRow label="Total tournaments" value={stats.totalTournaments} />
        <StatRow label="Championships" value={stats.championships} highlight />
        <StatRow label="Best fan total" value={stats.bestFans} />
        <div className="h-px bg-arena-lineDim my-1" />
        <StatRow label="Matches played" value={totalMatches} />
        <StatRow label="Matches won" value={stats.totalMatchesWon} />
        <StatRow label="Matches lost" value={stats.totalMatchesLost} />
        <StatRow label="Win rate" value={wr === null ? '—' : `${wr}%`} highlight />

        {stats.lastPlayedAt && (
          <div className="font-mono text-[10px] text-arena-textMuted text-center mt-2">
            Last played · {new Date(stats.lastPlayedAt).toLocaleDateString()}
          </div>
        )}

        <div className="mt-4">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full py-2.5 border border-neon-red text-neon-red font-mono text-xs tracking-widest uppercase
                         hover:bg-neon-red/10 transition"
            >
              Reset all stats
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 py-2.5 border border-white/20 text-white/60 font-mono text-xs uppercase"
              >
                cancel
              </button>
              <button
                onClick={() => {
                  resetStats()
                  setConfirmReset(false)
                }}
                className="flex-1 py-2.5 bg-neon-red text-white font-display font-bold text-xs uppercase tracking-widest"
              >
                confirm reset
              </button>
            </div>
          )}
        </div>
      </div>
    </Sheet>
  )
}

function StatRow({ label, value, highlight = false }: {
  label: string
  value: string | number
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between items-baseline">
      <div className="font-mono text-[11px] tracking-widest text-arena-textDim uppercase">
        {label}
      </div>
      <div
        className={`font-display font-black text-2xl ${highlight ? 'text-neon-yellow' : 'text-neon-cyan'}`}
        style={{ textShadow: highlight ? '0 0 8px rgba(255,230,0,0.6)' : '0 0 8px rgba(0,229,255,0.55)' }}
      >
        {value}
      </div>
    </div>
  )
}
