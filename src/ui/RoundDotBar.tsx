/**
 * Round progress dot bar. Fills `current` dots out of `total`.
 * Filled dots use the neon-cyan glow, upcoming dots are dim.
 * Used in headers of Match/Deck/Result scenes per the #05 language.
 */
export function RoundDotBar({
  current,
  total,
  label,
}: {
  current: number   // 1-indexed round number
  total: number
  /** Optional prefix label, e.g. "R" for R3/7. */
  label?: string
}) {
  return (
    <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-arena-textDim">
      {label && <span>{label}{current}/{total}</span>}
      <div className="flex items-center gap-1">
        {Array.from({ length: total }).map((_, i) => {
          const filled = i < current
          return (
            <span
              key={i}
              className={`inline-block w-1.5 h-1.5 rounded-full transition-colors ${
                filled ? 'bg-neon-cyan' : 'bg-arena-lineDim'
              }`}
              style={filled ? { boxShadow: '0 0 6px rgba(34,233,255,0.7)' } : undefined}
            />
          )
        })}
      </div>
    </div>
  )
}
