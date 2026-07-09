import type { Card as CardData, Level, Trigger } from '../game/types.ts'

/**
 * Card view — #05 CHALLENGERS ROLL design language.
 *
 * Layout: big Bebas Neue power number top-left, small tier chip top-right,
 * icon center, Space Mono uppercase name bottom, trigger-keyword tag chip
 * at very bottom. Tier-colored glow border matches the mockup grid.
 */

const TRIGGER_LABEL: Record<Trigger, string> = {
  'immediate': '즉시',
  'during-attack': '공격 시',
  'from-bench': '벤치',
  'in-flag': '깃발 시',
  'flag-loss': '깃발 뺏김',
  'when-picked': '픽할 때',
}

const LEVEL_STYLES: Record<Level, {
  border: string
  text: string
  glow: string
  ringSoft: string
  bgTint: string
}> = {
  S: {
    border: 'border-lvl-s/60',
    text: 'text-lvl-s',
    glow: 'rgba(136,136,168,0.35)',
    ringSoft: 'shadow-[0_0_10px_rgba(136,136,168,0.35)]',
    bgTint: 'rgba(136,136,168,0.05)',
  },
  A: {
    border: 'border-lvl-a/70',
    text: 'text-lvl-a',
    glow: 'rgba(34,255,136,0.55)',
    ringSoft: 'shadow-[0_0_10px_rgba(34,255,136,0.45)]',
    bgTint: 'rgba(34,255,136,0.06)',
  },
  B: {
    border: 'border-lvl-b/70',
    text: 'text-lvl-b',
    glow: 'rgba(34,233,255,0.6)',
    ringSoft: 'shadow-[0_0_10px_rgba(34,233,255,0.5)]',
    bgTint: 'rgba(34,233,255,0.07)',
  },
  C: {
    border: 'border-lvl-c/70',
    text: 'text-lvl-c',
    glow: 'rgba(255,43,214,0.6)',
    ringSoft: 'shadow-[0_0_10px_rgba(255,43,214,0.5)]',
    bgTint: 'rgba(255,43,214,0.07)',
  },
}

const SIZE_STYLES = {
  xs: {
    box: 'w-[62px] h-[92px] p-1 text-[7px]',
    power: 'text-lg',
    icon: 'text-lg',
    name: 'text-[7px]',
    tier: 'text-[7px] px-1 py-0.5',
    hideEffect: true,
    hideKeyword: true,
    hideName: false,
  },
  sm: {
    box: 'w-[78px] h-[112px] p-1.5 text-[8px]',
    power: 'text-2xl',
    icon: 'text-2xl',
    name: 'text-[8px]',
    tier: 'text-[7px] px-1 py-0.5',
    hideEffect: true,
    hideKeyword: false,
    hideName: false,
  },
  md: {
    box: 'w-[100px] h-[145px] p-2 text-[10px]',
    power: 'text-3xl',
    icon: 'text-3xl',
    name: 'text-[9px]',
    tier: 'text-[8px] px-1.5 py-0.5',
    hideEffect: false,
    hideKeyword: false,
    hideName: false,
  },
  lg: {
    box: 'w-[180px] h-[264px] p-3 text-[12px]',
    power: 'text-6xl',
    icon: 'text-6xl',
    name: 'text-base',
    tier: 'text-[10px] px-2 py-0.5',
    hideEffect: false,
    hideKeyword: false,
    hideName: false,
  },
} as const

type Size = keyof typeof SIZE_STYLES

export function Card({
  card,
  size = 'md',
  highlight = false,
  dim = false,
  onClick,
}: {
  card: CardData
  size?: Size
  /** Yellow outline (draft pick, flag holder). */
  highlight?: boolean
  /** Reduce opacity (out of play). */
  dim?: boolean
  onClick?: () => void
}) {
  const lv = LEVEL_STYLES[card.level]
  const sz = SIZE_STYLES[size]
  const keyword = card.effects[0]?.trigger

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col rounded-lg border overflow-hidden
                  ${lv.border} ${lv.ringSoft} ${sz.box}
                  ${highlight ? 'ring-2 ring-neon-yellow ring-offset-2 ring-offset-arena-void' : ''}
                  ${dim ? 'opacity-40' : ''}
                  ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        background: `linear-gradient(155deg, ${lv.bgTint} 0%, #0f1830 70%)`,
      }}
    >
      {/* Subtle sheen */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.04) 48%, transparent 60%)',
        }}
      />

      {/* Top row: power (left) + tier chip (right) */}
      <div className="relative flex items-start justify-between">
        <div
          className={`font-display font-normal text-white leading-[0.9] ${sz.power}`}
          style={{ textShadow: `0 0 10px ${lv.glow}` }}
        >
          {card.basePower}
        </div>
        <div
          className={`font-mono border rounded-sm tracking-widest ${lv.border} ${lv.text} ${sz.tier}
                      bg-black/30`}
        >
          {card.level}
        </div>
      </div>

      {/* Icon center */}
      <div
        className={`relative flex-1 flex items-center justify-center ${sz.icon}`}
        style={{ filter: `drop-shadow(0 0 8px ${lv.glow})` }}
      >
        {card.icon}
      </div>

      {/* Name bottom */}
      {!sz.hideName && (
        <div
          className={`relative font-mono font-bold text-white text-center uppercase tracking-wider
                      pt-1 border-t border-arena-lineDim ${sz.name}`}
          style={{ letterSpacing: '0.12em' }}
        >
          {card.name}
        </div>
      )}

      {/* Effect text (md/lg only). line-clamp so long descriptions don't
          silently overflow the card box; users see full text in the detail sheet. */}
      {!sz.hideEffect && card.effects[0] && (
        <div
          className="relative font-body text-arena-textDim text-center leading-snug mt-1 text-[10px] overflow-hidden"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
          title={card.effects[0].text}
        >
          {card.effects[0].text}
        </div>
      )}

      {/* Keyword chip (bottom) */}
      {!sz.hideKeyword && keyword && (
        <div className="relative text-center mt-1">
          <span
            className={`inline-block font-mono border rounded-sm px-1 py-0.5
                        ${lv.border} ${lv.text} text-[8px] tracking-wider bg-black/30`}
          >
            {TRIGGER_LABEL[keyword]}
          </span>
        </div>
      )}
    </div>
  )
}
