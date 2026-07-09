import { useMemo, useState } from 'react'
import { Sheet } from './Sheet'
import { Card as CardView } from './Card'
import { CARDS } from '../game/cards'
import type { Card, CardSet, Level } from '../game/types'

/**
 * Card codex — browse the full 42-card database with set/level filters.
 * Used from the lobby ("도감" button) so new players can learn what
 * exists before they see it in a draft.
 */

const SET_META: Record<CardSet, { label: string; color: string }> = {
  basic:       { label: 'BASIC',       color: 'text-neon-cyan border-neon-cyan' },
  corpOps:     { label: 'CORP OPS',    color: 'text-neon-magenta border-neon-magenta' },
  underground: { label: 'UNDERGROUND', color: 'text-neon-green border-neon-green' },
}

const SET_HINT: Record<CardSet, string> = {
  basic:       '기본 · 견고한 파워',
  corpOps:     '기업 · 벤치 시너지',
  underground: '언더 · 즉시 부스트',
}

const LEVEL_META: Record<Level, { label: string; color: string }> = {
  S: { label: 'S', color: 'text-lvl-s border-lvl-s' },
  A: { label: 'A', color: 'text-lvl-a border-lvl-a' },
  B: { label: 'B', color: 'text-lvl-b border-lvl-b' },
  C: { label: 'C', color: 'text-lvl-c border-lvl-c' },
}

export function CardCodexSheet({
  open, onClose, onCardTap, currentDeck,
}: {
  open: boolean
  onClose: () => void
  onCardTap: (c: Card) => void
  /** Optional: shows "보유 N장" badge on cards you already have. */
  currentDeck?: readonly Card[]
}) {
  const [setFilter, setSetFilter] = useState<CardSet | 'all'>('all')
  const [levelFilter, setLevelFilter] = useState<Level | 'all'>('all')

  const filtered = useMemo(() => {
    return CARDS.filter((c) => {
      if (setFilter !== 'all' && c.set !== setFilter) return false
      if (levelFilter !== 'all' && c.level !== levelFilter) return false
      return true
    })
  }, [setFilter, levelFilter])

  const ownedByName = useMemo(() => {
    const m = new Map<string, number>()
    for (const c of currentDeck ?? []) m.set(c.name, (m.get(c.name) ?? 0) + 1)
    return m
  }, [currentDeck])

  return (
    <Sheet open={open} onClose={onClose} eyebrow={`// CODEX · 전체 ${CARDS.length}장`} title="카드 도감">
      <div className="flex flex-col gap-3 pt-2 pb-2">

        {/* Filters */}
        <div className="flex flex-col gap-2">
          <div className="font-mono text-[10px] tracking-widest text-arena-textDim">세트</div>
          <div className="flex gap-1.5 flex-wrap">
            <FilterChip active={setFilter === 'all'} onClick={() => setSetFilter('all')} label="전체" />
            {(Object.keys(SET_META) as CardSet[]).map((s) => (
              <FilterChip
                key={s}
                active={setFilter === s}
                onClick={() => setSetFilter(s)}
                label={SET_META[s].label}
                colorClass={setFilter === s ? SET_META[s].color : undefined}
              />
            ))}
          </div>

          <div className="font-mono text-[10px] tracking-widest text-arena-textDim mt-1">레벨</div>
          <div className="flex gap-1.5 flex-wrap">
            <FilterChip active={levelFilter === 'all'} onClick={() => setLevelFilter('all')} label="전체" />
            {(['S', 'A', 'B', 'C'] as Level[]).map((lv) => (
              <FilterChip
                key={lv}
                active={levelFilter === lv}
                onClick={() => setLevelFilter(lv)}
                label={LEVEL_META[lv].label}
                colorClass={levelFilter === lv ? LEVEL_META[lv].color : undefined}
              />
            ))}
          </div>
        </div>

        {/* Set descriptor if a specific set is picked */}
        {setFilter !== 'all' && (
          <div className={`px-3 py-2 border rounded font-body text-xs
                          ${SET_META[setFilter].color}`}
               style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
            {SET_HINT[setFilter]}
          </div>
        )}

        <div className="font-mono text-[10px] text-arena-textDim text-right">
          {filtered.length}장 표시
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="py-8 font-mono text-sm text-arena-textDim text-center">
            해당 조합의 카드가 없어요
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 place-items-center">
            {filtered.map((c) => {
              const owned = ownedByName.get(c.name) ?? 0
              return (
                <div key={c.id} className="relative">
                  <div onClick={() => onCardTap(c)} className="cursor-pointer">
                    <CardView card={c} size="md" />
                  </div>
                  {owned > 0 && (
                    <div className="absolute -top-1 -right-1 z-10 min-w-[28px] h-[24px] px-1
                                    rounded-sm bg-neon-yellow text-arena-void
                                    flex items-center justify-center
                                    font-display font-black text-[10px] tracking-widest
                                    border border-arena-void">
                      보유 {owned}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="font-mono text-[10px] text-arena-textMuted text-center pt-2 border-t border-arena-lineDim">
          카드를 탭하면 상세 능력을 볼 수 있어요
        </div>
      </div>
    </Sheet>
  )
}

function FilterChip({
  active, onClick, label, colorClass,
}: {
  active: boolean
  onClick: () => void
  label: string
  colorClass?: string
}) {
  const base = 'px-2.5 py-1 rounded-sm font-mono text-[11px] tracking-widest border transition'
  if (active) {
    return (
      <button onClick={onClick}
              className={`${base} ${colorClass ?? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10'}`}>
        {label}
      </button>
    )
  }
  return (
    <button onClick={onClick}
            className={`${base} border-arena-lineDim text-arena-textDim hover:border-white/40 hover:text-white`}>
      {label}
    </button>
  )
}
