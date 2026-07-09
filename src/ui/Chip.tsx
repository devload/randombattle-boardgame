import type { ReactNode } from 'react'

type Variant = 'default' | 'cyan' | 'magenta' | 'gold' | 'green' | 'red'

const VARIANT: Record<Variant, { border: string; text: string; bg: string }> = {
  default: { border: 'border-arena-line', text: 'text-arena-textDim', bg: 'bg-black/30' },
  cyan:    { border: 'border-neon-cyan/70', text: 'text-neon-cyan', bg: 'bg-neon-cyan/5' },
  magenta: { border: 'border-neon-magenta/70', text: 'text-neon-magenta', bg: 'bg-neon-magenta/5' },
  gold:    { border: 'border-neon-gold/70', text: 'text-neon-gold', bg: 'bg-neon-gold/5' },
  green:   { border: 'border-neon-green/70', text: 'text-neon-green', bg: 'bg-neon-green/5' },
  red:     { border: 'border-neon-red/70', text: 'text-neon-red', bg: 'bg-neon-red/5' },
}

/**
 * Micro chip used for labels, badges, tags. Space Mono uppercase tracked.
 * Standard element of the #05 language HUD.
 */
export function Chip({
  children,
  variant = 'default',
  size = 'sm',
}: {
  children: ReactNode
  variant?: Variant
  size?: 'xs' | 'sm' | 'md'
}) {
  const v = VARIANT[variant]
  const sizes = {
    xs: 'text-[9px] px-1 py-0.5',
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-[11px] px-2 py-1',
  }
  return (
    <span
      className={`inline-flex items-center font-mono uppercase tracking-widest rounded-sm border
                  ${v.border} ${v.text} ${v.bg} ${sizes[size]}`}
    >
      {children}
    </span>
  )
}
