import { Sheet } from './Sheet'
import { Card as CardView } from './Card'
import { HintList } from './HintBadge'
import { hintsFor } from '../game/hints'
import type { Card, Trigger } from '../game/types'

const TRIGGER_LABEL: Record<Trigger, string> = {
  'immediate': '즉시 발동',
  'during-attack': '공격 중',
  'from-bench': '벤치에 있을 때',
  'in-flag': '깃발 상태일 때',
  'flag-loss': '깃발을 뺏길 때',
  'when-picked': '픽할 때',
}

/**
 * Bottom sheet with a large card preview + effect list + flavor text.
 * Used by Deck Phase, Match Phase (tap bench card), Result Screen.
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
      eyebrow={card ? `// LEVEL ${card.level} · ${card.set.toUpperCase()}` : ''}
      title={card?.name}
    >
      {card && (
        <div className="flex flex-col items-center gap-4 pt-2">
          <CardView card={card} size="lg" />

          {card.effects.length > 0 ? (
            <div className="w-full flex flex-col gap-2 mt-2">
              {card.effects.map((e, i) => (
                <div key={i}
                     className="p-3 border border-arena-lineDim rounded bg-black/40">
                  <div className="font-mono text-[10px] tracking-widest text-neon-cyan mb-1">
                    {TRIGGER_LABEL[e.trigger]}
                  </div>
                  <div className="font-body text-sm text-white">
                    {e.text}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-arena-textDim font-mono text-xs">특수 능력 없음</div>
          )}

          {hints.length > 0 && (
            <div className="w-full">
              <div className="font-mono text-[10px] tracking-widest text-neon-yellow mb-1">
                // 조합 힌트
              </div>
              <HintList hints={hints} />
            </div>
          )}

          {card.flavor && (
            <div className="w-full mt-2 pt-3 border-t border-arena-lineDim">
              <div className="font-body italic text-arena-textDim text-sm text-center leading-relaxed">
                "{card.flavor}"
              </div>
            </div>
          )}
        </div>
      )}
    </Sheet>
  )
}
