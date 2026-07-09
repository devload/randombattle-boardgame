import type { PickHint } from '../game/hints'

const TONE: Record<PickHint['tone'], { bg: string; border: string; text: string }> = {
  good: { bg: 'bg-neon-yellow/90', border: 'border-neon-yellow', text: 'text-arena-void' },
  warn: { bg: 'bg-neon-red/90',    border: 'border-neon-red',    text: 'text-white' },
  info: { bg: 'bg-neon-cyan/90',   border: 'border-neon-cyan',   text: 'text-arena-void' },
}

export function HintBadge({ hint }: { hint: PickHint }) {
  const t = TONE[hint.tone]
  return (
    <span className={`inline-flex items-center px-1.5 py-[1px] rounded-sm border
                      font-display font-black text-[8px] tracking-widest uppercase
                      whitespace-nowrap max-w-full truncate
                      ${t.bg} ${t.border} ${t.text}`}>
      {hint.short}
    </span>
  )
}

/** Full list rendered inside card detail sheet. */
export function HintList({ hints }: { hints: readonly PickHint[] }) {
  if (hints.length === 0) return null
  return (
    <div className="w-full flex flex-col gap-1.5 mt-2">
      {hints.map((h, i) => (
        <div key={i}
             className="p-2 border border-neon-yellow/60 bg-neon-yellow/5 rounded flex gap-2 items-start">
          <HintBadge hint={h} />
          <span className="font-body text-xs text-white/85 leading-snug">{h.reason}</span>
        </div>
      ))}
    </div>
  )
}
