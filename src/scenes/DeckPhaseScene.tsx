import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useUI } from '../store/uiStore'
import { useTournament } from '../store/tournamentStore'
import { useMatch } from '../store/matchStore'
import { Card as CardView } from '../ui/Card'
import { CardDetailSheet } from '../ui/CardDetailSheet'
import { MyDeckSheet } from '../ui/MyDeckSheet'
import { CardCodexSheet } from '../ui/CardCodexSheet'
import { HintBadge } from '../ui/HintBadge'
import { hintsFor } from '../game/hints'
import { drawFromPile, draftBudget, openLevels, validatePicks } from '../game/deck'
import { mulberry32, hashSeed } from '../game/rng'
import { robotById } from '../game/robots'
import { cardById } from '../game/cards'
import { decideFirstPlayer } from '../game/tournament'
import { RoundDotBar } from '../ui/RoundDotBar'
import { Chip } from '../ui/Chip'
import { toast } from '../store/toastStore'
import { sfx } from '../audio/sfx'
import type { Card, Level } from '../game/types'

/**
 * Deck phase flow:
 *   1. Draw 5 from Level A (always).
 *   2. Draw 5 from Level B (if open).
 *   3. Draw 5 from Level C (if open, mutually exclusive with B).
 *   4. User picks per budget: A×2, B×2 OR C×1.
 *   5. One reroll available per pile (MVP: single reroll for A pile).
 *   6. Confirm → seed match store and jump to match scene.
 */

type Stage = 'pileA' | 'chooseBC' | 'pileB' | 'pileC' | 'review' | 'trim'

export function DeckPhaseScene() {
  const setScene = useUI((s) => s.setScene)
  const round = useTournament((s) => s.round)
  const humanDeck = useTournament((s) => s.humanDeck)
  const setHumanDeck = useTournament((s) => s.setHumanDeck)
  const applyHumanWhenPicked = useTournament((s) => s.applyHumanWhenPicked)
  const currentOpponentId = useTournament((s) => s.currentOpponentId)
  const currentSeed = useTournament((s) => s.currentSeed)
  const players = useTournament((s) => s.players)
  const robotDecks = useTournament((s) => s.robotDecks)
  const startMatch = useMatch((s) => s.start)

  const budget = draftBudget(round)
  const levels = openLevels(round)

  const [stage, setStage] = useState<Stage>('pileA')
  const [rerollUsed, setRerollUsed] = useState<Record<Level, boolean>>({ S: true, A: false, B: false, C: false })
  const [drawnSeeds, setDrawnSeeds] = useState<Record<Level, number>>({
    S: 0,
    A: hashSeed(`draft:${round}:${currentSeed}:A`),
    B: hashSeed(`draft:${round}:${currentSeed}:B`),
    C: hashSeed(`draft:${round}:${currentSeed}:C`),
  })
  const [pickedIds, setPickedIds] = useState<string[]>([])
  const [detailCard, setDetailCard] = useState<Card | null>(null)
  const [showRerollConfirm, setShowRerollConfirm] = useState(false)
  const [trimIndexes, setTrimIndexes] = useState<Set<number>>(new Set())
  const [deckSheetOpen, setDeckSheetOpen] = useState(false)
  const [codexOpen, setCodexOpen] = useState(false)

  const currentLevel: Level | null =
    stage === 'pileA' ? 'A' : stage === 'pileB' ? 'B' : stage === 'pileC' ? 'C' : null

  const drawn = useMemo(() => {
    if (!currentLevel) return []
    return drawFromPile(currentLevel, mulberry32(drawnSeeds[currentLevel]))
  }, [currentLevel, drawnSeeds])

  const picked: Card[] = pickedIds.map((id) => cardById(id))

  const remainingBudget = (() => {
    if (currentLevel === 'A') {
      const used = pickedInLevel('A')
      return budget.A - used
    }
    if (currentLevel === 'B') {
      return budget.B - pickedInLevel('B')
    }
    if (currentLevel === 'C') {
      return budget.C - pickedInLevel('C')
    }
    return 0
  })()

  function pickedInLevel(lv: Level): number {
    return picked.filter((c) => c.level === lv).length
  }

  function togglePick(card: Card) {
    if (card.level !== currentLevel) return
    if (remainingBudget <= 0 && !pickedIds.includes(card.id)) return
    setPickedIds((prev) => {
      const idx = prev.indexOf(card.id)
      if (idx >= 0) {
        const copy = [...prev]
        copy.splice(idx, 1)
        return copy
      }
      sfx.pick()
      return [...prev, card.id]
    })
  }

  function advanceStage() {
    // A → B/C decision (if both open) or skip to review.
    if (stage === 'pileA') {
      if (levels.includes('B') && levels.includes('C')) {
        setStage('chooseBC')
      } else if (levels.includes('B')) {
        setStage('pileB')
      } else if (levels.includes('C')) {
        setStage('pileC')
      } else {
        setStage('review')
      }
      return
    }
    if (stage === 'pileB' || stage === 'pileC') {
      setStage('review')
      return
    }
  }

  function confirmReroll() {
    if (!currentLevel) return
    setDrawnSeeds((s) => ({ ...s, [currentLevel]: s[currentLevel] ^ 0x9E3779B9 }))
    setRerollUsed((s) => ({ ...s, [currentLevel]: true }))
    // Remove picks from this pile after reroll.
    setPickedIds((prev) => prev.filter((id) => cardById(id).level !== currentLevel))
    setShowRerollConfirm(false)
  }

  function confirmReviewGoTrim() {
    const validation = validatePicks(round, picked)
    if (validation) {
      toast.warn(validation)
      return
    }
    // Fire when-picked triggers once, at commit time. Any later trim/reroll
    // must NOT re-trigger — that's why this is here (after review, before
    // trim) rather than inside togglePick.
    const gained = applyHumanWhenPicked(picked)
    if (gained > 0) {
      toast.info(`픽 보너스 팬 +${gained}`)
    }
    setStage('trim')
  }

  /** Compute the *tentative* full deck: current deck + picks - trimmed. */
  const trimPool: Card[] = [...humanDeck, ...picked]
  function toggleTrim(idx: number) {
    setTrimIndexes((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  function confirmDeckAndGo() {
    const kept = trimPool.filter((_, i) => !trimIndexes.has(i))
    setHumanDeck(kept)

    // Kick off match.
    const opponent = currentOpponentId ? robotById(currentOpponentId) : null
    if (!opponent) return
    const human = players.find((p) => p.isHuman)
    const opponentPlayer = players.find((p) => p.id === opponent.id)
    const firstPlayer = human && opponentPlayer
      ? decideFirstPlayer(round, human, { trophies: opponentPlayer.trophies }, currentSeed)
      : 'A'
    const opponentDeck = robotDecks[opponent.id] ?? opponent.makeDeck()
    startMatch({
      deckA: kept,
      deckB: opponentDeck,
      seed: currentSeed,
      firstPlayer,
      labelA: { name: 'YOU', icon: '👤' },
      labelB: { name: opponent.name, icon: opponent.icon },
    })
    setScene('match')
  }

  return (
    <div className="absolute inset-0 flex flex-col pt-safe pb-safe">
      <div className="scene-bg cyber-grid opacity-40" />

      <div className="relative flex-1 flex flex-col p-3 z-10 gap-2 min-h-0">

        {/* Header — title chip + round dot bar */}
        <div className="flex justify-between items-center px-1 pb-1.5 border-b border-arena-lineDim">
          <Chip variant="cyan" size="xs">DECK PHASE</Chip>
          <RoundDotBar current={round} total={7} label="R" />
        </div>

        {/* Deck summary + shortcuts */}
        <div className="flex gap-2 items-stretch">
          <button
            onClick={() => { sfx.tap(); setDeckSheetOpen(true) }}
            className="flex-1 min-w-0 flex items-center gap-2 px-2.5 py-1.5 bg-black/40
                       border border-neon-cyan/40 rounded text-left hover:bg-neon-cyan/10 transition"
          >
            <span className="font-mono text-[10px] tracking-widest text-arena-textDim shrink-0">내 덱</span>
            <span className="font-display font-black text-neon-cyan text-lg leading-none shrink-0"
                  style={{ textShadow: '0 0 6px rgba(0,229,255,0.55)' }}>
              {humanDeck.length}
            </span>
            <span className="text-neon-cyan text-[10px] font-mono ml-auto shrink-0">보기 ▸</span>
          </button>
          <button
            onClick={() => { sfx.tap(); setCodexOpen(true) }}
            className="shrink-0 px-3 border border-neon-magenta/60 text-neon-magenta bg-neon-magenta/5
                       font-mono text-[10px] tracking-widest rounded hover:bg-neon-magenta/15 transition"
          >
            🎴 도감
          </button>
        </div>

        {/* Instruction + inline help */}
        <Instruction stage={stage} budget={budget} currentLevel={currentLevel} remaining={remainingBudget} />
        <StageHelp stage={stage} currentLevel={currentLevel} />

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {stage === 'review' ? (
            <ReviewStage picked={picked} onDetail={setDetailCard} />
          ) : stage === 'trim' ? (
            <TrimStage
              pool={trimPool}
              trimmed={trimIndexes}
              onToggle={toggleTrim}
              onDetail={setDetailCard}
            />
          ) : stage === 'chooseBC' ? (
            <ChooseBCStage
              onChoose={(c) => setStage(c === 'B' ? 'pileB' : 'pileC')}
            />
          ) : (
            <PileGrid
              cards={drawn}
              currentLevel={currentLevel}
              pickedIds={pickedIds}
              onToggle={togglePick}
              onDetail={setDetailCard}
              currentDeck={humanDeck}
            />
          )}
        </div>

        {/* Reroll row */}
        {stage !== 'review' && currentLevel && !rerollUsed[currentLevel] && (
          <div className="flex justify-between items-center px-2.5 py-2 bg-black/30 rounded">
            <div className="font-mono text-[10px] text-arena-textDim">↻ 5장 재드로우 (1회)</div>
            <button
              onClick={() => setShowRerollConfirm(true)}
              className="clip-cyber border border-neon-cyan text-neon-cyan bg-neon-cyan/5
                         font-display font-bold text-[11px] tracking-widest uppercase px-3 py-1.5"
            >
              REROLL
            </button>
          </div>
        )}

        {/* Bottom CTA */}
        <div>
          {stage === 'review' ? (
            <button
              onClick={confirmReviewGoTrim}
              className="w-full py-4 clip-cyber font-display font-bold text-sm tracking-widest
                         bg-holo-gradient text-arena-void shadow-neon-cyan"
            >
              덱 정리 →
            </button>
          ) : stage === 'trim' ? (
            <button
              onClick={confirmDeckAndGo}
              className="w-full py-4 clip-cyber font-display font-bold text-sm tracking-widest
                         bg-holo-gradient text-arena-void shadow-neon-cyan"
            >
              전투 시작 →
            </button>
          ) : (
            <button
              onClick={advanceStage}
              disabled={remainingBudget > 0}
              className={`w-full py-4 clip-cyber font-display font-bold text-sm tracking-widest
                          ${remainingBudget > 0
                            ? 'border border-arena-line text-arena-textDim'
                            : 'bg-holo-gradient text-arena-void shadow-neon-cyan'}`}
            >
              {remainingBudget > 0
                ? `${remainingBudget}장 더 픽`
                : stage === 'pileA' ? '다음 파일 →' : '리뷰 →'}
            </button>
          )}
        </div>
      </div>

      {/* Reroll confirm modal */}
      <AnimatePresence>
        {showRerollConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-arena-void/80 backdrop-blur"
          >
            <div className="border border-neon-cyan bg-arena-deep p-6 clip-cyber min-w-[260px] text-center">
              <div className="font-display text-lg text-neon-cyan tracking-widest mb-3">REROLL?</div>
              <div className="font-mono text-xs text-arena-textDim mb-4">
                5장을 다시 뽑습니다.<br />이 파일에서 다시 못 씁니다.
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowRerollConfirm(false)}
                        className="flex-1 py-2 border border-white/20 text-white/60 font-mono text-xs uppercase">
                  cancel
                </button>
                <button onClick={confirmReroll}
                        className="flex-1 py-2 bg-holo-gradient text-arena-void font-display font-bold text-xs uppercase">
                  reroll
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CardDetailSheet card={detailCard} onClose={() => setDetailCard(null)} currentDeck={humanDeck} />
      <MyDeckSheet
        open={deckSheetOpen}
        onClose={() => setDeckSheetOpen(false)}
        deck={humanDeck}
        onCardTap={(c) => { setDeckSheetOpen(false); setDetailCard(c) }}
      />
      <CardCodexSheet
        open={codexOpen}
        onClose={() => setCodexOpen(false)}
        currentDeck={humanDeck}
        onCardTap={(c) => { setCodexOpen(false); setDetailCard(c) }}
      />
    </div>
  )
}

function StageHelp({ stage, currentLevel }: { stage: Stage; currentLevel: Level | null }) {
  let msg: string | null = null
  if (stage === 'pileA' || stage === 'pileB' || stage === 'pileC') {
    msg = currentLevel === 'A'
      ? '📖 카드 탭 = 선택 · 옐로 = 픽됨'
      : currentLevel === 'B'
      ? '📖 B는 강함 · 시너지 카드는 옐로 뱃지'
      : currentLevel === 'C'
      ? '📖 C 최상급 · 한 장만 가능'
      : null
  } else if (stage === 'chooseBC') {
    msg = '📖 B×2(안정) or C×1(고파워)'
  } else if (stage === 'review') {
    msg = '📖 다음 단계에서 약한 카드 제거 가능'
  } else if (stage === 'trim') {
    msg = '📖 (선택) 스타터 카드 빼면 덱 강해짐'
  }
  if (!msg) return null
  return (
    <div className="px-2.5 py-1.5 border border-neon-cyan/40 bg-neon-cyan/5 rounded
                    font-body text-[11px] text-white/85 leading-tight">
      {msg}
    </div>
  )
}

function Instruction({
  stage, budget, currentLevel, remaining,
}: {
  stage: Stage
  budget: ReturnType<typeof draftBudget>
  currentLevel: Level | null
  remaining: number
}) {
  if (stage === 'review') {
    return (
      <div className="text-center py-2">
        <div className="font-mono text-[10px] tracking-widest text-neon-yellow">// 리뷰</div>
        <div className="font-display text-sm mt-1">픽한 카드 확인</div>
      </div>
    )
  }
  if (stage === 'trim') {
    return (
      <div className="text-center py-2">
        <div className="font-mono text-[10px] tracking-widest text-neon-magenta">// 덱 정리</div>
        <div className="font-display text-sm mt-1">
          뺄 카드를 <span className="text-neon-red">탭</span> (선택)
        </div>
      </div>
    )
  }
  if (!currentLevel) return null
  const label = currentLevel === 'A' ? `A 레벨에서 ${budget.A}장 픽`
    : currentLevel === 'B' ? `B 레벨에서 ${budget.B}장 픽`
    : `C 레벨에서 ${budget.C}장 픽`
  return (
    <div className="text-center py-1">
      <div className="font-mono text-[10px] tracking-widest text-neon-yellow">// DRAFT</div>
      <div className="font-display text-sm mt-0.5">
        {label} <span className="text-neon-cyan">({remaining}장 남음)</span>
      </div>
    </div>
  )
}

function PileGrid({
  cards, currentLevel, pickedIds, onToggle, onDetail, currentDeck,
}: {
  cards: readonly Card[]
  currentLevel: Level | null
  pickedIds: string[]
  onToggle: (c: Card) => void
  onDetail: (c: Card) => void
  currentDeck: readonly Card[]
}) {
  if (!currentLevel) return null
  return (
    <div className="grid grid-cols-3 gap-2 py-1 place-items-start justify-items-center">
      {cards.map((card, i) => {
        const picked = pickedIds.includes(card.id)
        const hints = hintsFor(card, currentDeck)
        return (
          <div key={`${card.id}-${i}`} className="relative flex flex-col items-center gap-1">
            {picked && (
              <div className="absolute top-1 left-1 z-10 bg-neon-yellow text-arena-void
                              font-display font-black text-[9px] tracking-widest px-1 rounded-sm">
                픽함
              </div>
            )}
            <div onClick={() => onToggle(card)}>
              <CardView card={card} size="md" highlight={picked} />
            </div>
            {hints.length > 0 && (
              <div className="flex flex-col gap-0.5 items-center max-w-full w-[110px]">
                {hints.slice(0, 2).map((h, hi) => (
                  <HintBadge key={hi} hint={h} />
                ))}
              </div>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onDetail(card) }}
              className="text-[9px] font-mono text-neon-cyan px-1 opacity-70 hover:opacity-100"
            >
              상세
            </button>
          </div>
        )
      })}
    </div>
  )
}

function TrimStage({
  pool, trimmed, onToggle, onDetail,
}: {
  pool: Card[]
  trimmed: Set<number>
  onToggle: (idx: number) => void
  onDetail: (c: Card) => void
}) {
  const keptCount = pool.length - trimmed.size

  // Sort ascending by base power (weakest first), then by name so
  // same-name duplicates sit next to each other. Original index is kept
  // so trim toggles still target the right card.
  const ordered = pool
    .map((card, idx) => ({ card, idx }))
    .sort((a, b) =>
      a.card.basePower - b.card.basePower ||
      a.card.name.localeCompare(b.card.name) ||
      a.idx - b.idx,
    )

  return (
    <div className="flex flex-col items-center gap-3 py-3">
      <div className="font-mono text-[11px] text-arena-textDim">
        남는 카드 {keptCount}장 · 제거 {trimmed.size}장
      </div>
      <div className="grid grid-cols-3 gap-2 place-items-center">
        {ordered.map(({ card: c, idx: i }) => {
          const isTrimmed = trimmed.has(i)
          return (
            <div key={`${c.id}-${i}`} className="relative">
              {isTrimmed && (
                <div className="absolute top-1 left-1 z-10 bg-neon-red text-white
                                font-display font-black text-[9px] tracking-widest px-1 rounded-sm">
                  제거
                </div>
              )}
              <div onClick={() => onToggle(i)}>
                <CardView card={c} size="md" dim={isTrimmed} />
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDetail(c) }}
                className="absolute -bottom-1 right-0 text-[9px] font-mono text-neon-cyan px-1 opacity-70 hover:opacity-100"
              >
                상세
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ReviewStage({ picked, onDetail }: { picked: Card[]; onDetail: (c: Card) => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-3">
      <div className="font-mono text-[11px] text-arena-textDim">
        {picked.length} cards added to your deck
      </div>
      <div className="grid grid-cols-3 gap-2 place-items-center">
        {picked.map((c, i) => (
          <div key={`${c.id}-${i}`} onClick={() => onDetail(c)}>
            <CardView card={c} size="md" />
          </div>
        ))}
      </div>
    </div>
  )
}

function ChooseBCStage({ onChoose }: { onChoose: (c: 'B' | 'C') => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-8">
      <div className="text-center">
        <div className="font-mono text-[10px] tracking-widest text-neon-magenta">// CHOICE</div>
        <div className="font-display text-lg mt-1">Choose your next pile</div>
      </div>
      <div className="w-full grid grid-cols-2 gap-3 px-2">
        <button
          onClick={() => onChoose('B')}
          className="p-4 border-2 border-lvl-b bg-lvl-b/10 rounded-lg
                     flex flex-col items-center gap-2 shadow-neon-cyan hover:-translate-y-0.5 transition"
        >
          <div className="font-display font-black text-4xl text-lvl-b"
               style={{ textShadow: '0 0 8px rgba(0,229,255,0.55)' }}>
            B
          </div>
          <div className="font-display font-bold text-sm text-white tracking-widest">×2 PICKS</div>
          <div className="font-mono text-[10px] text-arena-textDim">balanced</div>
        </button>
        <button
          onClick={() => onChoose('C')}
          className="p-4 border-2 border-lvl-c bg-lvl-c/10 rounded-lg
                     flex flex-col items-center gap-2 shadow-neon-magenta hover:-translate-y-0.5 transition"
        >
          <div className="font-display font-black text-4xl text-lvl-c"
               style={{ textShadow: '0 0 8px rgba(255,43,214,0.55)' }}>
            C
          </div>
          <div className="font-display font-bold text-sm text-white tracking-widest">×1 PICK</div>
          <div className="font-mono text-[10px] text-arena-textDim">elite</div>
        </button>
      </div>
    </div>
  )
}

