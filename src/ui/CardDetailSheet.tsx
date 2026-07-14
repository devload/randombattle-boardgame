import { Sheet } from './Sheet'
import { Card as CardView } from './Card'
import { Chip } from './Chip'
import { HintList } from './HintBadge'
import { hintsFor } from '../game/hints'
import type { Card, CardSet, Level, Trigger } from '../game/types'

const TRIGGER_LABEL: Record<Trigger, string> = {
  'immediate': '즉시 발동',
  'during-attack': '공격 중',
  'from-bench': '벤치에 있을 때',
  'in-flag': '깃발 상태일 때',
  'flag-loss': '깃발을 뺏길 때',
  'when-picked': '픽할 때',
}

/** Match trigger to a Chip color variant so the panel color-codes at a glance. */
const TRIGGER_VARIANT: Record<Trigger, 'cyan' | 'magenta' | 'green' | 'gold' | 'red' | 'default'> = {
  'immediate':      'cyan',
  'during-attack':  'magenta',
  'from-bench':     'green',
  'in-flag':        'gold',
  'flag-loss':      'red',
  'when-picked':    'default',
}

const LEVEL_TINT: Record<Level, string> = {
  S: 'text-lvl-s',
  A: 'text-lvl-a',
  B: 'text-lvl-b',
  C: 'text-lvl-c',
}

const LEVEL_LABEL: Record<Level, string> = {
  S: 'STARTER',
  A: 'COMMON',
  B: 'RARE',
  C: 'ELITE',
}

/** Pretty display name per set (fallback: uppercase key). */
const SET_DISPLAY: Record<CardSet, string> = {
  basic:        'BASIC',
  corpOps:      'CORP OPS',
  underground:  'UNDERGROUND',
  neoCitadel:   'NEO-CITADEL',
  neonPark:     'NEON PARK',
  ghostNetwork: 'GHOST NETWORK',
  orbitZero:    'ORBIT ZERO',
}

/**
 * Bottom sheet with the full card breakdown.
 * Layout (top-to-bottom):
 *   1. Big card preview centered
 *   2. Level / set / power stat strip
 *   3. Every effect in its own panel (trigger chip + full body, never clipped)
 *   4. Synergy hints against current deck (optional)
 *   5. Flavor text (optional)
 */
export function CardDetailSheet({
  card, onClose, currentDeck,
}: {
  card: Card | null
  onClose: () => void
  /** If provided, synergy hints against this deck are shown. */
  currentDeck?: readonly Card[]
}) {
  const hints = card && currentDeck ? hintsFor(card, currentDeck) : []

  return (
    <Sheet
      open={!!card}
      onClose={onClose}
      eyebrow={card ? `// CARD DOSSIER · ${SET_DISPLAY[card.set] ?? card.set.toUpperCase()}` : ''}
      title={card?.name}
    >
      {card && (
        <div className="flex flex-col items-center gap-5 pt-2">

          {/* Big card preview */}
          <div className="relative">
            <CardView card={card} size="lg" />
          </div>

          {/* Stat strip — LEVEL / POWER / EFFECTS */}
          <div className="grid grid-cols-3 gap-2 w-full">
            <StatBlock
              label="LEVEL"
              value={card.level}
              sublabel={LEVEL_LABEL[card.level]}
              colorClass={LEVEL_TINT[card.level]}
            />
            <StatBlock
              label="POWER"
              value={card.basePower}
              sublabel="BASE"
              colorClass="text-neon-cyan"
            />
            <StatBlock
              label="EFFECTS"
              value={card.effects.length}
              sublabel={card.effects.length === 0 ? 'NONE' : 'ACTIVE'}
              colorClass={card.effects.length > 0 ? 'text-neon-magenta' : 'text-arena-textMuted'}
            />
          </div>

          {/* Effects list */}
          {card.effects.length > 0 ? (
            <div className="w-full flex flex-col gap-2">
              <SectionLabel>// EFFECTS</SectionLabel>
              {card.effects.map((e, i) => (
                <div
                  key={i}
                  className="p-3 border border-arena-lineDim rounded bg-black/40 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2">
                    <Chip variant={TRIGGER_VARIANT[e.trigger]} size="sm">
                      {TRIGGER_LABEL[e.trigger]}
                    </Chip>
                  </div>
                  <div className="font-body text-[13px] text-white leading-relaxed break-keep whitespace-pre-wrap">
                    {e.text}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full text-center py-4 border border-arena-lineDim rounded bg-black/30 font-mono text-[11px] tracking-widest text-arena-textDim uppercase">
              특수 능력 없음
            </div>
          )}

          {/* Synergy hints */}
          {hints.length > 0 && (
            <div className="w-full">
              <SectionLabel color="gold">// SYNERGY HINTS</SectionLabel>
              <div className="mt-1">
                <HintList hints={hints} />
              </div>
            </div>
          )}

          {/* Flavor */}
          {card.flavor && (
            <div className="w-full pt-4 border-t border-arena-lineDim">
              <div className="font-body italic text-arena-textDim text-[13px] text-center leading-relaxed whitespace-pre-wrap">
                “{card.flavor}”
              </div>
            </div>
          )}
        </div>
      )}
    </Sheet>
  )
}

function StatBlock({
  label, value, sublabel, colorClass,
}: {
  label: string
  value: number | string
  sublabel?: string
  colorClass: string
}) {
  return (
    <div className="text-center p-2.5 border border-arena-lineDim rounded bg-black/40">
      <div className={`font-display font-normal text-3xl leading-none ${colorClass}`}
           style={{ textShadow: '0 0 8px currentColor', letterSpacing: '0.02em' }}>
        {value}
      </div>
      <div className="font-mono text-[9px] tracking-widest text-arena-textDim mt-1.5 uppercase">
        {label}
      </div>
      {sublabel && (
        <div className="font-mono text-[8px] tracking-widest text-arena-textMuted mt-0.5 uppercase">
          {sublabel}
        </div>
      )}
    </div>
  )
}

function SectionLabel({
  children, color = 'cyan',
}: {
  children: React.ReactNode
  color?: 'cyan' | 'magenta' | 'gold'
}) {
  const colorClass = color === 'cyan'
    ? 'text-neon-cyan/70'
    : color === 'magenta'
      ? 'text-neon-magenta/70'
      : 'text-neon-gold/70'
  return (
    <div className={`font-mono text-[10px] tracking-widest uppercase ${colorClass}`}>
      {children}
    </div>
  )
}
