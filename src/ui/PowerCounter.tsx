import { AnimatedNumber } from './AnimatedNumber.tsx'

type Variant = 'attacker' | 'defender' | 'neutral'

const VARIANT: Record<Variant, { text: string; glow: string }> = {
  attacker: { text: 'text-neon-cyan', glow: '0 0 12px rgba(0,229,255,0.55)' },
  defender: { text: 'text-neon-red', glow: '0 0 12px rgba(255,51,85,0.55)' },
  neutral: { text: 'text-white', glow: '0 0 8px rgba(255,255,255,0.3)' },
}

export function PowerCounter({
  value,
  label,
  variant = 'neutral',
  delta,
}: {
  value: number
  label: string
  variant?: Variant
  delta?: string | null
}) {
  const v = VARIANT[variant]
  return (
    <div className="text-center">
      <div className="font-mono text-[9px] tracking-[0.15em] text-arena-textDim mb-0.5 whitespace-nowrap">
        {label}
      </div>
      <div
        className={`font-display font-black text-2xl leading-none ${v.text}`}
        style={{ textShadow: v.glow }}
      >
        <AnimatedNumber value={value} />
      </div>
      {delta && (
        <div className="font-mono text-[10px] text-neon-green mt-1">{delta}</div>
      )}
    </div>
  )
}
