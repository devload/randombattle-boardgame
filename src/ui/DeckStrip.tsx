import type { Card, Level } from '../game/types.ts'

const LEVEL_COLOR: Record<Level, string> = {
  S: 'border-lvl-s text-lvl-s',
  A: 'border-lvl-a text-lvl-a',
  B: 'border-lvl-b text-lvl-b',
  C: 'border-lvl-c text-lvl-c',
}

/** Deck summary strip — total count + per-level chips. */
export function DeckStrip({ deck, label = 'MY DECK' }: { deck: readonly Card[]; label?: string }) {
  const counts = deck.reduce(
    (acc, c) => {
      acc[c.level] = (acc[c.level] ?? 0) + 1
      return acc
    },
    {} as Record<Level, number>,
  )

  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-black/40 border border-arena-lineDim rounded">
      <div className="font-mono text-[10px] tracking-widest text-arena-textDim">{label}</div>
      <div className="font-display font-black text-neon-cyan text-lg leading-none"
           style={{ textShadow: '0 0 6px rgba(0,229,255,0.55)' }}>
        {deck.length}
      </div>
      <div className="flex gap-1 ml-auto">
        {(['S', 'A', 'B', 'C'] as Level[]).map((lv) =>
          counts[lv] ? (
            <span key={lv} className={`px-1.5 py-0.5 font-mono text-[10px] border rounded-sm ${LEVEL_COLOR[lv]}`}>
              {lv}×{counts[lv]}
            </span>
          ) : null,
        )}
      </div>
    </div>
  )
}
