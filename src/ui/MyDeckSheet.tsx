import { Sheet } from './Sheet'
import { Card as CardView } from './Card'
import { summarizeDeck } from '../game/hints'
import type { Card } from '../game/types'

/**
 * "내 덱" bottom sheet. Shows every card the player currently has, grouped
 * by name (same-name cards stack visually), plus quick deck stats.
 *
 * Used from the deck-phase scene so newcomers can see what they already
 * own before deciding what to add.
 */
export function MyDeckSheet({
  open, onClose, deck, onCardTap,
}: {
  open: boolean
  onClose: () => void
  deck: readonly Card[]
  onCardTap?: (c: Card) => void
}) {
  const stats = summarizeDeck(deck)

  return (
    <Sheet open={open} onClose={onClose} eyebrow="// MY DECK" title="내 덱">
      <div className="flex flex-col gap-4 pt-2">

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <StatBlock label="총 카드" value={stats.count} />
          <StatBlock label="종류" value={stats.uniqueNames} />
          <StatBlock label="평균 파워" value={stats.avgPower.toFixed(1)} />
        </div>

        <div className="flex justify-center gap-1.5">
          {(['S', 'A', 'B', 'C'] as const).map((lv) => (
            stats.byLevel[lv] > 0 ? (
              <span key={lv}
                    className={`font-mono text-[11px] px-2 py-1 border rounded-sm
                                border-lvl-${lv.toLowerCase()} text-lvl-${lv.toLowerCase()}`}
                    style={{
                      borderColor: lv === 'S' ? '#8888a8' : lv === 'A' ? '#22ff88' : lv === 'B' ? '#00e5ff' : '#ff2bd6',
                      color: lv === 'S' ? '#8888a8' : lv === 'A' ? '#22ff88' : lv === 'B' ? '#00e5ff' : '#ff2bd6',
                    }}>
                {lv} × {stats.byLevel[lv]}
              </span>
            ) : null
          ))}
        </div>

        <div className="h-px bg-arena-lineDim my-1" />

        {/* Every card, shown individually so you can spot duplicates.
            Sorted by level then name so same-name copies sit adjacent. */}
        {deck.length === 0 ? (
          <div className="text-arena-textDim text-center py-6 font-mono text-sm">
            아직 카드가 없어요
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 place-items-center pb-2">
            {[...deck]
              .sort((a, b) =>
                // Ascending power first, then name to keep dupes adjacent.
                a.basePower - b.basePower ||
                a.name.localeCompare(b.name),
              )
              .map((card, i, sorted) => {
                const dupCount = stats.byName.get(card.name) ?? 1
                const dupIdx = sorted.slice(0, i).filter((c) => c.name === card.name).length + 1
                return (
                  <div key={`${card.id}-${i}`} className="relative">
                    <div onClick={() => onCardTap?.(card)}>
                      <CardView card={card} size="md" />
                    </div>
                    {dupCount > 1 && (
                      <div className="absolute -top-1 -right-1 z-10 min-w-[30px] h-[22px] px-1
                                      rounded-sm bg-neon-yellow text-arena-void
                                      flex items-center justify-center
                                      font-display font-black text-[10px] tracking-wider
                                      border border-arena-void">
                        {dupIdx}/{dupCount}
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        )}

        <div className="font-mono text-[10px] text-arena-textMuted text-center pt-2 leading-relaxed">
          같은 이름 카드는 벤치에서 한 칸에 <span className="text-neon-yellow">스택</span>됩니다<br/>
          <span className="opacity-70">뱃지 <span className="text-neon-yellow font-bold">N/M</span>: 같은 이름 M장 중 N번째</span>
        </div>
      </div>
    </Sheet>
  )
}

function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-3 border border-arena-lineDim rounded bg-black/40">
      <div className="font-display font-black text-2xl text-neon-cyan leading-none"
           style={{ textShadow: '0 0 6px rgba(0,229,255,0.55)' }}>
        {value}
      </div>
      <div className="font-mono text-[10px] tracking-widest text-arena-textDim mt-1">{label}</div>
    </div>
  )
}
