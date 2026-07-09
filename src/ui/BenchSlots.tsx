import type { BenchStack, Level } from '../game/types.ts'

const LEVEL_COLOR: Record<Level, { border: string; text: string; shadow: string }> = {
  S: { border: 'border-lvl-s/70', text: 'text-lvl-s', shadow: 'shadow-[0_0_6px_rgba(136,136,168,0.4)]' },
  A: { border: 'border-lvl-a/70', text: 'text-lvl-a', shadow: 'shadow-neon-green' },
  B: { border: 'border-lvl-b/70', text: 'text-lvl-b', shadow: 'shadow-neon-cyan' },
  C: { border: 'border-lvl-c/70', text: 'text-lvl-c', shadow: 'shadow-neon-magenta' },
}

export function BenchSlots({ bench, label }: {
  bench: readonly BenchStack[]
  /** Optional strip label ("내 벤치" / "상대 벤치") shown above the row. */
  label?: string
}) {
  // Always render 6 slots; fill from left.
  const slots = Array.from({ length: 6 }, (_, i) => bench[i] ?? null)
  const filled = bench.length
  const isDanger = filled >= 5   // 5/6 filled — one more distinct name loses the match
  const containerBorder = isDanger
    ? 'border-neon-red/70'
    : filled >= 3 ? 'border-neon-yellow/50' : 'border-arena-lineDim'

  return (
    <div className="flex flex-col gap-0.5">
      {(label || filled > 0) && (
        <div className="flex items-center justify-between px-1 text-[9px] font-mono tracking-widest">
          <span className="text-arena-textDim">{label ?? '벤치'}</span>
          <span className={
            isDanger ? 'text-neon-red'
            : filled >= 3 ? 'text-neon-yellow'
            : 'text-arena-textDim'
          }>
            {filled} / 6
            {isDanger && <span className="ml-1 animate-pulse-neon">⚠</span>}
          </span>
        </div>
      )}
      <div className={`grid grid-cols-6 gap-1 p-1.5 bg-black/40 border rounded ${containerBorder}`}>
        {slots.map((stack, i) => {
          if (!stack) {
            // Empty slot — clearer outline so the player can count remaining space.
            return (
              <div
                key={i}
                className="aspect-[2/3] border-2 border-dashed rounded-sm
                           border-arena-line/40 bg-black/20
                           flex items-center justify-center font-mono text-[9px] text-arena-textMuted/80"
              >
                {i + 1}
              </div>
            )
          }
          const card = stack.cards[0]!
          const c = LEVEL_COLOR[card.level]
          return (
            <div
              key={i}
              className={`relative aspect-[2/3] border rounded-sm ${c.border} ${c.shadow}
                         bg-gradient-to-b from-arena-panel2 to-arena-panel
                         flex items-center justify-center text-lg`}
            >
              {card.icon}
              {stack.cards.length > 1 && (
                <div className={`absolute bottom-0.5 right-0.5 font-mono text-[8px] ${c.text}`}
                     style={{ textShadow: '0 0 4px currentColor' }}>
                  ×{stack.cards.length}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
