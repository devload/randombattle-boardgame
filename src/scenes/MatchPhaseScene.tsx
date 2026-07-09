import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useUI } from '../store/uiStore'
import { useMatch, replay, type Snapshot } from '../store/matchStore'
import { useTournament, recoverHumanDeck } from '../store/tournamentStore'
import { useStats } from '../store/statsStore'
import { sfx } from '../audio/sfx'
import { Card } from '../ui/Card'
import { BenchSlots } from '../ui/BenchSlots'
import { AnimatedNumber } from '../ui/AnimatedNumber'
import { PowerBar } from '../ui/PowerBar'
import { RoundDotBar } from '../ui/RoundDotBar'
import { Chip } from '../ui/Chip'
import { ScorePop } from '../ui/ScorePop'
import { PowerBreakdown } from '../ui/PowerBreakdown'
import { revealBreakdown } from '../game/effects'
import { CardDetailSheet } from '../ui/CardDetailSheet'
import { SlashOverlay, type SlashVariant } from '../ui/SlashOverlay'
import { Burst } from '../ui/Burst'
import { cardById, makeStarterDeck } from '../game/cards'
import type { Card as CardData, PlayerId } from '../game/types'

/**
 * Per-event delay so pacing feels intentional.
 * Big moments (flag taken, match end) get more air so the slash overlay
 * and shake read cleanly before the next event fires.
 */
function delayForEvent(type: string): number {
  switch (type) {
    case 'reveal':            return 900
    case 'flagInit':          return 1000
    case 'effectTriggered':   return 500
    // Flag taken needs time for: slash (0.3s delay + 1.5s show)
    // + board settling (~0.8s) + breather before next event.
    case 'flagTaken':         return 2800
    case 'benchOverflow':     return 2500
    case 'attackerExhausted': return 2000
    case 'matchEnd':          return 500    // modal will take over
    default:                  return 900
  }
}

export function MatchPhaseScene() {
  const setScene = useUI((s) => s.setScene)
  const { result, cursor, playing, mode, deckSizes, labels, start, next, setPlaying, setMode } = useMatch()
  const round = useTournament((s) => s.round)
  const inFinal = useTournament((s) => s.inFinal)
  const [detailCard, setDetailCard] = useState<CardData | null>(null)
  // Intro cutscene removed — it was blocking gameplay behind a dim overlay
  // when timers throttled. Match SFX intro is still played on first render.
  const introDone = true
  const [slash, setSlash] = useState<{ variant: SlashVariant; keyId: number } | null>(null)
  const [burstKey, setBurstKey] = useState<number | null>(null)
  const [scorePop, setScorePop] = useState<{ value: number; tone: 'me' | 'foe'; keyId: number } | null>(null)
  const shakeRef = useRef<HTMLDivElement | null>(null)

  const triggerShake = () => {
    const el = shakeRef.current
    if (!el) return
    // Restart CSS animation by toggling the class
    el.classList.remove('shake-anim')
    void el.offsetWidth // reflow
    el.classList.add('shake-anim')
  }

  // Boot: if no match is loaded, spin up a demo one so the scene works standalone.
  useEffect(() => {
    if (!result) {
      const playerDeck: CardData[] = [
        ...makeStarterDeck(),
        cardById('a_ghost'),
        cardById('a_stim'),
        cardById('b_overclock'),
        cardById('b_synth'),
      ]
      const robotDeck: CardData[] = [
        ...makeStarterDeck(),
        cardById('a_ghost'),
        cardById('a_blade'),
        cardById('b_netrunner'),
      ]
      start({
        deckA: playerDeck,
        deckB: robotDeck,
        seed: Date.now() & 0xffffffff,
        firstPlayer: 'A',
        labelA: { name: 'YOU', icon: '👤' },
        labelB: { name: 'GHOST.BOT', icon: '🥷' },
      })
    }
  }, [result, start])

  // Auto-advance cursor while playing (paused during intro).
  // Each event carries its own delay so big moments get room to breathe.
  useEffect(() => {
    if (!introDone) return
    if (!playing || mode !== 'auto' || !result) return
    if (cursor >= result.events.length - 1) return
    const nextEvent = result.events[cursor + 1]
    const delay = nextEvent ? delayForEvent(nextEvent.type) : 900
    // Also give the CURRENT event a chance to breathe; use the max of both.
    const currentEvent = cursor >= 0 ? result.events[cursor] : null
    const currentDelay = currentEvent ? delayForEvent(currentEvent.type) : 900
    const chosen = Math.max(delay, currentDelay)
    const t = setTimeout(() => next(), chosen)
    return () => clearTimeout(t)
  }, [playing, mode, cursor, result, next, introDone])

  // Play intro SFX once when the match starts (no visual cutscene).
  useEffect(() => {
    if (!result) return
    sfx.intro()
  }, [result])

  // Trigger SFX + visual FX on event transitions.
  useEffect(() => {
    if (!result || cursor < 0) return
    const e = result.events[cursor]
    if (!e) return
    switch (e.type) {
      case 'reveal':
        sfx.reveal()
        break
      case 'flagInit':
        sfx.reveal()
        break
      case 'flagTaken': {
        sfx.flagTaken()
        // Delay slash 300ms so the player can process the final reveal card first.
        const variant: SlashVariant = e.to === 'A' ? 'flag-taken-by-me' : 'flag-taken-by-foe'
        setTimeout(() => {
          setSlash({ variant, keyId: cursor })
          triggerShake()
          setBurstKey(cursor)
        }, 300)
        setTimeout(() => setSlash(null), 1500)
        setTimeout(() => setBurstKey(null), 2200) // clear so it doesn't linger

        // Score pop — sum of flag-loss fan effects from cards leaving flag possession.
        // The LOSER (e.from) gains those fans as consolation, so the pop shows on
        // their side (tone based on who benefits).
        const fansGained = e.benched.reduce((sum, c) => {
          return sum + c.effects.reduce((s, ef) => {
            if (ef.trigger === 'flag-loss' && ef.body.kind === 'gain-fans') {
              return s + ef.body.value
            }
            return s
          }, 0)
        }, 0)
        if (fansGained > 0) {
          const tone: 'me' | 'foe' = e.from === 'A' ? 'me' : 'foe'
          setTimeout(() => setScorePop({ value: fansGained, tone, keyId: cursor }), 550)
          setTimeout(() => setScorePop(null), 2200)
        }
        break
      }
      case 'benchOverflow': {
        const variant: SlashVariant = e.player === 'A' ? 'bench-full-me' : 'bench-full-foe'
        setTimeout(() => {
          setSlash({ variant, keyId: cursor })
          triggerShake()
        }, 400)
        setTimeout(() => setSlash(null), 2000)
        break
      }
      case 'attackerExhausted': {
        const variant: SlashVariant = e.player === 'A' ? 'attacker-empty-me' : 'attacker-empty-foe'
        setTimeout(() => setSlash({ variant, keyId: cursor }), 300)
        setTimeout(() => setSlash(null), 1600)
        break
      }
      case 'matchEnd':
        if (e.winner === 'A') {
          sfx.win()
          setSlash({ variant: 'match-win', keyId: cursor })
        } else {
          sfx.lose()
          setSlash({ variant: 'match-lose', keyId: cursor })
        }
        triggerShake()
        break
    }
  }, [cursor, result])

  const snapshot: Snapshot | null = useMemo(() => {
    if (!result) return null
    return replay(result.events, cursor, deckSizes.A, deckSizes.B)
  }, [result, cursor, deckSizes.A, deckSizes.B])

  if (!snapshot || !result) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-arena-textDim font-mono">
        Loading match…
      </div>
    )
  }

  const finished = snapshot.finished
  const winnerIsA = snapshot.winner === 'A'

  return (
    <div className="absolute inset-0 flex flex-col pt-safe pb-safe bg-arena-void scene-scroll">
      <div className="scene-bg cyber-grid opacity-40" />
      <div className="scene-bg scanlines" />

      <div ref={shakeRef}
           className="relative min-h-full flex flex-col p-2 z-10 gap-1.5"
      >

        {/* Scene header: title chip + round dot bar */}
        <div className="flex items-center justify-between px-1">
          <Chip variant="cyan" size="xs">MATCH</Chip>
          {inFinal
            ? <Chip variant="gold" size="xs">FINAL</Chip>
            : <RoundDotBar current={round} total={7} label="R" />}
        </div>

        {/* Opponent strip */}
        <PlayerStrip
          side="foe"
          label={labels.B}
          deckRemaining={snapshot.players.B.deck}
          deckTotal={deckSizes.B}
          role={snapshot.attacker === 'B' ? 'attack' : 'defend'}
        />

        <div className="shrink-0">
          <BenchSlots bench={snapshot.players.B.bench} label="상대 벤치" />
        </div>

        {/* Arena — sized to content. */}
        <div className="flex flex-col justify-center items-center relative"
             style={{ background: 'radial-gradient(ellipse at center, rgba(0,229,255,0.06) 0%, transparent 60%)' }}>

          <div className="w-full px-3 pb-1 flex flex-col gap-1">
            <PowerLine
              variant="attacker"
              label="공격"
              value={snapshot.attackerPower}
              who={snapshot.attacker === 'A' ? '나' : snapshot.attacker === 'B' ? '상대' : null}
            />
            <PowerBar current={snapshot.attackerPower} target={snapshot.neededPower} />
            <PowerLine
              variant="defender"
              label="깃발"
              value={snapshot.neededPower}
              who={snapshot.flagHolder === 'A' ? '나' : snapshot.flagHolder === 'B' ? '상대' : null}
              flag
            />

            {/* Sequential power breakdown for the most recent reveal */}
            {(() => {
              if (!snapshot.attacker) return null
              const revealed = snapshot.players[snapshot.attacker].revealed
              const last = revealed[revealed.length - 1]
              if (!last) return null
              const breakdown = revealBreakdown(last, snapshot.players[snapshot.attacker].bench)
              const key = `${snapshot.attacker}-${last.id}-${revealed.length}`
              return <PowerBreakdown contribs={breakdown} keyId={key} />
            })()}
          </div>

          <div className="relative flex flex-col items-center gap-1 w-full">
            {/* Territory-based 2-row layout:
                - Top row  = opponent's territory (their flag pile OR their reveal)
                - Bottom row = my territory (my flag pile OR my reveal)
                Whoever is the attacker has their reveal cards there;
                whoever is the defender has their flag pile there. */}
            <TerritoryRow side="foe" snapshot={snapshot} onTap={setDetailCard} />
            <TerritoryRow side="me" snapshot={snapshot} onTap={setDetailCard} />

            {/* Event log lives INSIDE the arena so it's visually attached
                to the cards, not floating against the bench above. */}
            <div className="w-full px-1 mt-0.5">
              <EventLog snapshot={snapshot} />
            </div>
          </div>
        </div>

        {/* Manual tap-to-continue */}
        {playing && mode === 'manual' && !finished && (
          <div className="flex justify-center">
            <button
              onClick={() => next()}
              className="clip-cyber border border-neon-cyan text-neon-cyan bg-neon-cyan/5
                         font-display font-bold text-xs tracking-[0.12em] uppercase
                         px-8 py-2.5"
            >
              TAP TO CONTINUE ▷
            </button>
          </div>
        )}

        {/* Mode toggle (top-right floating) */}
        <div className="absolute top-2 left-3 flex gap-1">
          <ModeChip active={mode === 'auto'} onClick={() => setMode('auto')} label="AUTO" />
          <ModeChip active={mode === 'manual'} onClick={() => setMode('manual')} label="TAP" />
          {playing ? (
            <button
              onClick={() => setPlaying(false)}
              className="px-2 py-0.5 rounded font-mono text-[10px] border border-white/20 text-white/60 hover:border-white/40"
            >
              ⏸
            </button>
          ) : !finished && (
            <button
              onClick={() => setPlaying(true)}
              className="px-2 py-0.5 rounded font-mono text-[10px] border border-neon-cyan/60 text-neon-cyan hover:border-neon-cyan"
            >
              ▶
            </button>
          )}
        </div>

        <BenchSlots bench={snapshot.players.A.bench} label="내 벤치" />

        {/* Me strip */}
        <PlayerStrip
          side="me"
          label={labels.A}
          deckRemaining={snapshot.players.A.deck}
          deckTotal={deckSizes.A}
          role={snapshot.attacker === 'A' ? 'attack' : 'defend'}
        />
      </div>

      {/* Punchy slash overlay for big moments */}
      <SlashOverlay variant={slash?.variant ?? null} keyId={slash?.keyId ?? 'none'} />

      {/* Radial burst when flag is taken — fixed to viewport,
          auto-cleared 2.2s after being set so it never lingers. */}
      {burstKey !== null && (
        <div key={burstKey} className="fixed inset-0 z-[65] pointer-events-none flex items-center justify-center overflow-hidden">
          <Burst keyId={burstKey} count={28} radius={220} />
        </div>
      )}

      <CardDetailSheet card={detailCard} onClose={() => setDetailCard(null)} />

      {/* Balatro-style score pop on breach */}
      <ScorePop
        value={scorePop?.value ?? null}
        tone={scorePop?.tone ?? 'me'}
        keyId={scorePop?.keyId ?? 'none'}
      />

      {/* End of match modal */}
      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-arena-void/85 backdrop-blur p-6"
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className={`border-2 bg-arena-deep p-6 clip-cyber min-w-[280px] max-w-[340px]
                          ${winnerIsA ? 'border-neon-cyan shadow-neon-cyan' : 'border-neon-red shadow-neon-red'}`}
            >
              <div className="font-mono text-[10px] tracking-widest text-neon-magenta text-center mb-1">
                // MATCH RESULT
              </div>
              <div className={`font-display font-black text-4xl tracking-widest text-center
                              ${winnerIsA ? 'text-holo' : 'text-neon-red'}`}
                   style={winnerIsA ? undefined : { textShadow: '0 0 16px rgba(255,51,85,0.6)' }}>
                {winnerIsA ? 'VICTORY' : 'DEFEAT'}
              </div>
              <div className="font-mono text-xs text-arena-textDim text-center mt-2">
                {result.reason === 'bench-overflow' ? 'Bench overflow — 7 distinct cards' : 'Attacker deck exhausted'}
              </div>

              {/* Summary metrics */}
              <div className="mt-4 pt-4 border-t border-arena-lineDim grid grid-cols-3 gap-2 text-center">
                <SummaryStat
                  label="POWER"
                  value={result.events.filter((e) => e.type === 'reveal').length}
                  hint="reveals"
                />
                <SummaryStat
                  label="FLAGS"
                  value={result.events.filter((e) => e.type === 'flagTaken').length}
                  hint="taken"
                />
                <SummaryStat
                  label="FANS"
                  value={result.finalState.players.A.fans}
                  hint="earned"
                  highlight
                />
              </div>
              <button
                onClick={() => {
                  const tour = useTournament.getState()
                  const stats = useStats.getState()
                  if (tour.players.length > 0 && result) {
                    stats.recordMatchResult(result.winner === 'A')
                    if (tour.inFinal) {
                      tour.finishFinal(result)
                      useMatch.getState().reset()
                      setScene('result')
                    } else {
                      tour.finishMatch(result, recoverHumanDeck(result))
                      useMatch.getState().reset()
                      const post = useTournament.getState()
                      if (post.finished) setScene('result')
                      else if (post.inFinal) setScene('final')
                      else setScene('tourboard')
                    }
                  } else {
                    // Standalone demo path (no active tournament).
                    useMatch.getState().reset()
                    setScene('lobby')
                  }
                }}
                className="mt-5 w-full py-3 clip-cyber bg-holo-gradient text-arena-void
                           font-display font-bold text-xs tracking-[0.12em] uppercase"
              >
                CONTINUE →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Compact horizontal power line. Renders label + who-owns-it chip + big
 * animated Bebas number on a single row. Used stacked so attacker/defender
 * power read top-to-bottom around the power bar between them.
 */
function PowerLine({
  variant, label, value, who, flag = false,
}: {
  variant: 'attacker' | 'defender'
  label: string
  value: number
  who: '나' | '상대' | null
  flag?: boolean
}) {
  const isMe = who === '나'
  const numberColor = variant === 'attacker' ? 'text-neon-cyan' : 'text-neon-red'
  const numberGlow = variant === 'attacker'
    ? '0 0 12px rgba(34,233,255,0.65)'
    : '0 0 12px rgba(255,51,85,0.65)'
  const chipVariant: 'cyan' | 'red' = isMe ? 'cyan' : 'red'

  return (
    <div className="flex items-center justify-between gap-2 px-1">
      <div className="flex items-center gap-1.5 min-w-0">
        {flag && (
          <span className="text-base leading-none"
                style={{ filter: 'drop-shadow(0 0 6px rgba(255,216,77,0.8))' }}>🚩</span>
        )}
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-arena-textDim whitespace-nowrap">
          {label}
        </span>
        {who && <Chip variant={chipVariant} size="xs">{who}</Chip>}
      </div>
      <div className={`font-display font-normal text-3xl leading-none ${numberColor}`}
           style={{ textShadow: numberGlow, letterSpacing: '0.02em' }}>
        <AnimatedNumber value={value} />
      </div>
    </div>
  )
}

function SummaryStat({ label, value, hint, highlight = false }: {
  label: string
  value: number
  hint: string
  highlight?: boolean
}) {
  return (
    <div>
      <div className={`font-display font-black text-2xl leading-none
                       ${highlight ? 'text-neon-yellow' : 'text-neon-cyan'}`}
           style={{ textShadow: highlight ? '0 0 8px rgba(255,230,0,0.6)' : '0 0 8px rgba(0,229,255,0.55)' }}>
        {value}
      </div>
      <div className="font-mono text-[9px] tracking-widest text-white mt-1">{label}</div>
      <div className="font-mono text-[8px] text-arena-textMuted">{hint}</div>
    </div>
  )
}

function ModeChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 rounded font-mono text-[10px] border transition
                  ${active ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10' : 'border-white/20 text-white/50 hover:border-white/40'}`}
    >
      {label}
    </button>
  )
}

function PlayerStrip({
  side, label, deckRemaining, deckTotal, role,
}: {
  side: 'me' | 'foe'
  label: { name: string; icon: string }
  deckRemaining: number
  deckTotal: number
  role: 'attack' | 'defend'
}) {
  const isMe = side === 'me'
  const border = isMe ? 'border-neon-cyan' : 'border-neon-red'
  const shadow = isMe ? 'shadow-[0_0_10px_rgba(34,233,255,0.35)]' : 'shadow-[0_0_10px_rgba(255,51,85,0.35)]'
  const roleBadge = role === 'attack'
    ? <Chip variant="red" size="xs">{isMe ? '◀ 공격' : '공격 ▶'}</Chip>
    : <Chip variant="gold" size="xs">방어</Chip>
  return (
    <div className={`flex items-center gap-2 px-2 py-1.5 bg-black/40 border ${border} ${shadow} rounded-md min-w-0`}>
      <div className={`w-8 h-8 shrink-0 rounded flex items-center justify-center text-base
                       bg-arena-panel2 border ${border}`}>
        {label.icon}
      </div>
      <div className="min-w-0 flex-shrink">
        <div className="font-display font-normal text-[13px] tracking-widest truncate leading-none"
             style={{ letterSpacing: '0.08em' }}>
          {label.name}
        </div>
        <div className="font-mono text-[9px] text-arena-textDim whitespace-nowrap mt-1 uppercase tracking-widest">
          DECK <span className="text-neon-cyan font-display text-[14px]">{deckRemaining}</span>
          <span className="opacity-50">/{deckTotal}</span>
        </div>
      </div>
      <div className="ml-auto">{roleBadge}</div>
    </div>
  )
}

function FlagPile({ pile, onTap }: { pile: readonly CardData[]; onTap?: (c: CardData) => void }) {
  if (pile.length === 0) {
    return (
      <div className="w-[78px] h-[112px] rounded border border-dashed border-arena-lineDim
                      flex items-center justify-center text-arena-textMuted font-mono text-[9px]">
        FLAG
      </div>
    )
  }

  // Fanned display: every card in the pile is shown, spaced out enough
  // that each card's name/keyword row peeks out from behind the next.
  // The most recent (top) card sits rightmost/frontmost and carries the flag.
  const CARD_W = 78
  const OFFSET = 50  // wider offset so each card's name row stays visible
  const totalW = CARD_W + (pile.length - 1) * OFFSET

  return (
    <div className="relative flex items-center justify-center" style={{ height: 118 }}>
      {/* Pulsing glow behind the fan */}
      <motion.div
        animate={{ opacity: [0.35, 0.75, 0.35], scale: [0.9, 1.05, 0.9] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: totalW + 40,
          height: 130,
          background: 'radial-gradient(ellipse, rgba(255,230,0,0.22) 0%, transparent 70%)',
        }}
      />

      <div className="relative" style={{ width: totalW, height: 112 }}>
        {pile.map((card, i) => {
          const isTop = i === pile.length - 1
          const tilt = (i - (pile.length - 1) / 2) * 3   // slight fan rotation
          return (
            <motion.div
              key={`flag-${card.id}-${i}`}
              layout
              initial={{ scale: 0.5, y: -20, opacity: 0, rotateY: 180 }}
              animate={{ scale: 1, y: 0, opacity: 1, rotate: tilt, rotateY: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 220, delay: i * 0.05 }}
              onClick={() => onTap?.(card)}
              className="absolute cursor-pointer"
              style={{
                left: i * OFFSET,
                top: 0,
                zIndex: i,
                transformStyle: 'preserve-3d',
              }}
            >
              {isTop && (
                // Sits INSIDE the card's top-right corner so it can never
                // cover the opponent's revealed card sitting above the pile.
                <div className="absolute -top-1 -right-2 text-base z-20"
                     style={{ filter: 'drop-shadow(0 0 6px rgba(255,230,0,0.9))' }}>
                  🚩
                </div>
              )}
              <Card card={card} size="sm" highlight={isTop} />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * A single territory row. Shows either the player's flag pile (if they're
 * currently defending) or their revealed attack cards (if they're attacking).
 * At any given moment one side is always defending and the other attacking,
 * so the two rows together give a symmetric top/bottom board.
 */
function TerritoryRow({
  side, snapshot, onTap,
}: {
  side: 'me' | 'foe'
  snapshot: Snapshot
  onTap?: (c: CardData) => void
}) {
  const playerId: PlayerId = side === 'me' ? 'A' : 'B'
  const isAttacker = snapshot.attacker === playerId
  const isDefender = snapshot.flagHolder === playerId
  const player = snapshot.players[playerId]
  const hasFlag = isDefender && player.flagPile.length > 0
  const hasReveal = isAttacker && player.revealed.length > 0
  const isEmpty = !hasFlag && !hasReveal
  // Side-color the row background so the player can see at a glance
  // which side "owns" the flag right now (the defender row is highlighted).
  const rowGlow = hasFlag
    ? side === 'me'
      ? 'bg-neon-cyan/[0.06] border-y border-neon-cyan/40'
      : 'bg-neon-red/[0.06] border-y border-neon-red/40'
    : ''
  // Empty rows collapse to a slim placeholder so the arena doesn't leave
  // a huge gap when the opponent hasn't drawn yet, etc.
  const heightClass = isEmpty ? 'min-h-[28px]' : 'min-h-[118px]'
  const flagBadgeColor = side === 'me' ? 'text-neon-cyan' : 'text-neon-red'

  return (
    <div className={`relative w-full flex justify-center items-center transition-all ${heightClass} ${rowGlow}`}>
      {/* Prominent flag holder indicator — sits on the side of the row,
          quickly tells the player which territory currently owns the flag. */}
      {hasFlag && (
        <div className={`absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 ${flagBadgeColor}`}>
          <span className="text-2xl leading-none"
                style={{ filter: 'drop-shadow(0 0 6px currentColor)' }}>🚩</span>
          <span className="font-mono text-[9px] tracking-widest">{side === 'me' ? '내 깃발' : '상대 깃발'}</span>
        </div>
      )}
      {hasFlag && <FlagPile pile={player.flagPile} onTap={onTap} />}
      {hasReveal && (
        <RevealRow
          attacker={playerId}
          snapshot={snapshot}
          onTap={onTap}
          direction={side === 'me' ? 'up' : 'down'}
        />
      )}
      {isEmpty && (
        <span className="font-mono text-[9px] tracking-widest text-arena-textMuted opacity-60">
          {side === 'me' ? '내 진영 대기' : '상대 진영 대기'}
        </span>
      )}
    </div>
  )
}

function RevealRow({ attacker, snapshot, onTap, direction }: {
  attacker: PlayerId | null
  snapshot: Snapshot
  onTap?: (c: CardData) => void
  /** 'up' = card enters from below (my play), 'down' = from above (foe's play). */
  direction: 'up' | 'down'
}) {
  if (!attacker) return null
  const revealed = snapshot.players[attacker].revealed
  if (revealed.length === 0) return null

  const lastIdx = revealed.length - 1

  // Direction-aware colors + entrance vector.
  const isMe = direction === 'up'
  const glow = isMe
    ? '0 0 24px 8px rgba(0,229,255,0.7)'
    : '0 0 24px 8px rgba(255,51,85,0.7)'
  const rimColor = isMe ? 'rgba(0,229,255,0.9)' : 'rgba(255,51,85,0.9)'
  // Y offset direction: 'up' = enter from below (+60), 'down' = enter from above (-60)
  const enterY = isMe ? 60 : -60

  return (
    <div className="flex gap-1 items-center min-h-[112px] perspective relative">
      {/* Attacker source rail — a colored bar showing who is playing */}
      <div className="absolute -inset-x-4 top-1/2 -translate-y-1/2 h-[2px] pointer-events-none"
           style={{ background: `linear-gradient(90deg, transparent, ${rimColor}, transparent)`, opacity: 0.4 }} />
      <AnimatePresence initial={false}>
        {revealed.map((card, i) => {
          const isNew = i === lastIdx
          return (
            <motion.div
              key={`${card.id}-${i}`}
              initial={{
                y: enterY,
                x: 20,
                scale: 0.5,
                opacity: 0,
                rotateY: 180,
                filter: 'brightness(2)',
              }}
              animate={{
                y: 0,
                x: 0,
                scale: 1,
                opacity: 1,
                rotateY: 0,
                filter: 'brightness(1)',
              }}
              exit={{
                y: enterY,   // fly back the way they came (up for me, down for foe)
                scale: 0.4,
                opacity: 0,
                filter: 'brightness(0.4)',
              }}
              transition={{ type: 'spring', damping: 16, stiffness: 240 }}
              onClick={() => onTap?.(card)}
              className="cursor-pointer relative"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {isNew && (
                <motion.div
                  initial={{ opacity: 0.9, scale: 0.6 }}
                  animate={{ opacity: 0, scale: 1.6 }}
                  transition={{ duration: 0.7 }}
                  className="absolute inset-0 rounded pointer-events-none"
                  style={{ boxShadow: glow }}
                />
              )}
              <Card card={card} size="sm" />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}


function EventLog({ snapshot }: { snapshot: Snapshot }) {
  const e = snapshot.lastEvent
  let msg = '···'
  if (e) {
    const who = (p: PlayerId) => (p === 'A' ? '나' : '상대')
    switch (e.type) {
      case 'flagInit':
        msg = `🚩 ${who(e.player)} · ${e.card.name}`
        break
      case 'reveal':
        msg = `${who(e.player)} · ${e.card.name}`
        break
      case 'flagTaken':
        msg = e.to === 'A' ? '🚩 뺏음' : '🚩 뺏김'
        break
      case 'effectTriggered':
        msg = `⚡ ${e.effect.text}`
        break
      case 'benchOverflow':
        msg = `💥 ${who(e.player)} 벤치 종료`
        break
      case 'attackerExhausted':
        msg = `💤 ${who(e.player)} 덱 소진`
        break
      case 'matchEnd':
        msg = e.winner === 'A' ? '🏆 승리' : '💀 패배'
        break
    }
  }
  return (
    <div className="relative z-20 mx-1 px-2 py-1 bg-arena-void border border-neon-cyan/40 rounded
                    font-body text-[10px] text-white/80 text-center truncate">
      {msg}
    </div>
  )
}
