import type { BenchStack, Level } from '../game/types.ts'

const LEVEL_COLOR: Record<Level, { border: string; text: string; shadow: string; tint: string }> = {
  S: { border: 'border-lvl-s/70', text: 'text-lvl-s', shadow: 'shadow-[0_0_6px_rgba(136,136,168,0.4)]', tint: 'rgba(136,136,168,0.06)' },
  A: { border: 'border-lvl-a/70', text: 'text-lvl-a', shadow: 'shadow-[0_0_8px_rgba(34,255,136,0.45)]', tint: 'rgba(34,255,136,0.08)' },
  B: { border: 'border-lvl-b/70', text: 'text-lvl-b', shadow: 'shadow-[0_0_8px_rgba(34,233,255,0.5)]', tint: 'rgba(34,233,255,0.08)' },
  C: { border: 'border-lvl-c/70', text: 'text-lvl-c', shadow: 'shadow-[0_0_8px_rgba(255,43,214,0.5)]', tint: 'rgba(255,43,214,0.08)' },
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
    <div className="flex flex-col gap-1">
      {(label || filled > 0) && (
        <div className="flex items-center justify-between px-1">
          <span className="font-mono text-[9px] tracking-widest uppercase text-arena-textDim">
            {label ?? '벤치'}
          </span>
          <span className={`font-mono text-[9px] tracking-widest ${
            isDanger ? 'text-neon-red'
            : filled >= 3 ? 'text-neon-yellow'
            : 'text-arena-textDim'
          }`}>
            <span className="font-display text-[13px]">{filled}</span>
            <span className="opacity-50"> / 6</span>
            {isDanger && <span className="ml-1 animate-pulse-neon">⚠</span>}
          </span>
        </div>
      )}
      <div className={`grid grid-cols-6 gap-1 p-1.5 bg-black/40 border rounded ${containerBorder}`}>
        {slots.map((stack, i) => {
          if (!stack) {
            return (
              <div
                key={i}
                className="aspect-[2/3] border border-dashed rounded-sm
                           border-arena-line/40 bg-black/20
                           flex items-center justify-center font-mono text-[9px] text-arena-textMuted/70"
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
                         flex items-center justify-center text-lg`}
              style={{ background: `linear-gradient(155deg, ${c.tint} 0%, #0f1830 70%)` }}
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
