import type { Card as CardData, Level, Trigger } from '../game/types.ts'

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
  shadow: string
  glowVar: string
}> = {
  S: {
    border: 'border-lvl-s/70',
    text: 'text-lvl-s',
    shadow: 'shadow-[0_0_12px_rgba(136,136,168,0.4)]',
    glowVar: 'rgba(136,136,168,0.4)',
  },
  A: {
    border: 'border-lvl-a/70',
    text: 'text-lvl-a',
    shadow: 'shadow-neon-green',
    glowVar: 'rgba(34, 255, 136, 0.5)',
  },
  B: {
    border: 'border-lvl-b/70',
    text: 'text-lvl-b',
    shadow: 'shadow-neon-cyan',
    glowVar: 'rgba(0, 229, 255, 0.55)',
  },
  C: {
    border: 'border-lvl-c/70',
    text: 'text-lvl-c',
    shadow: 'shadow-neon-magenta',
    glowVar: 'rgba(255, 43, 214, 0.55)',
  },
}

const SIZE_STYLES = {
  xs: {
    box: 'w-[62px] h-[92px] p-0.5 text-[7px]',
    power: 'text-lg',
    icon: 'text-xl',
    name: 'text-[7px]',
    hideEffect: true,
    hideKeyword: false,
  },
  sm: {
    box: 'w-[78px] h-[112px] p-1 text-[8px]',
    power: 'text-xl',
    icon: 'text-2xl',
    name: 'text-[8px]',
    hideEffect: true,
    hideKeyword: false,
  },
  md: {
    box: 'w-[100px] h-[145px] p-1.5 text-[10px]',
    power: 'text-2xl',
    icon: 'text-3xl',
    name: 'text-[9px]',
    hideEffect: false,
    hideKeyword: false,
  },
  lg: {
    box: 'w-[180px] h-[264px] p-3 text-[12px]',
    power: 'text-5xl',
    icon: 'text-6xl',
    name: 'text-base',
    hideEffect: false,
    hideKeyword: false,
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
                  bg-gradient-to-b from-arena-panel2 to-arena-panel
                  ${lv.border} ${lv.shadow} ${sz.box}
                  ${highlight ? 'ring-2 ring-neon-yellow ring-offset-2 ring-offset-arena-void' : ''}
                  ${dim ? 'opacity-40' : ''}
                  ${onClick ? 'cursor-pointer' : ''}`}
      style={{ '--card-glow': lv.glowVar } as React.CSSProperties}
    >
      {/* Holo overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.05) 45%, transparent 55%)',
        }}
      />

      {/* Level badge */}
      <div
        className={`absolute top-1 right-1 px-1 rounded-sm font-mono border ${lv.border} ${lv.text}
                    text-[9px] tracking-wider`}
      >
        {card.level}
      </div>

      {/* Icon */}
      <div
        className={`self-center ${sz.icon}`}
        style={{ filter: `drop-shadow(0 0 8px ${lv.glowVar})` }}
      >
        {card.icon}
      </div>

      {/* Power */}
      <div className={`font-display font-black text-white leading-none ${sz.power}`}
           style={{ textShadow: `0 0 10px ${lv.glowVar}` }}>
        {card.basePower}
      </div>

      {/* Name */}
      <div className={`font-display font-bold text-white text-center mt-auto pt-1 border-t border-arena-lineDim tracking-wide ${sz.name}`}>
        {card.name}
      </div>

      {/* Effect text */}
      {!sz.hideEffect && card.effects[0] && (
        <div className="font-mono text-arena-textDim text-center leading-tight mt-1 text-[9px]">
          {card.effects[0].text}
        </div>
      )}

      {/* Keyword tag */}
      {!sz.hideKeyword && keyword && (
        <div className="text-center mt-1">
          <span className={`inline-block font-mono border ${lv.border} ${lv.text} text-[9px] px-1 rounded-sm tracking-wider`}>
            {TRIGGER_LABEL[keyword]}
          </span>
        </div>
      )}
    </div>
  )
}
