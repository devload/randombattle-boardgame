import { create } from 'zustand'
import type { Card, MatchEvent, MatchResult, PlayerId } from '../game/types.ts'
import { simulateMatch } from '../game/match.ts'
import { attackerCardPower, flagPilePower, flagInFlagBonus, benchAllyBonus } from '../game/effects.ts'
import { addToBench } from '../game/bench.ts'

/**
 * Match store — holds the simulated event log and a playback cursor.
 *
 * The scene consumes `derivedState(cursor)` to render whatever the game
 * looks like at that point in the log. Actual animation timing lives in
 * the scene (setTimeout), NOT here.
 */

export type PlaybackMode = 'auto' | 'manual'

/**
 * Snapshot derived from playing the log from event[0] up to event[cursor].
 * Recomputed on every cursor change. Cheap because event count stays
 * under ~200 for a full match.
 */
export type Snapshot = {
  flagHolder: PlayerId | null
  attacker: PlayerId | null
  players: Record<PlayerId, {
    deck: number
    flagPile: Card[]
    bench: ReturnType<typeof addToBench>['bench']
    revealed: Card[]  // Cards revealed during current attack (before breach).
    fans: number
  }>
  attackerPower: number
  neededPower: number
  finished: boolean
  winner: PlayerId | null
  lastEvent: MatchEvent | null
}

const emptyPlayer = (deck: number) => ({
  deck,
  flagPile: [] as Card[],
  bench: [] as ReturnType<typeof addToBench>['bench'],
  revealed: [] as Card[],
  fans: 0,
  pendingExtraDraws: 0,
})

/**
 * Replay events from 0..cursor to produce a snapshot.
 *
 * We recompute from scratch each time — the log is short. If perf becomes
 * an issue later we can memoize incrementally.
 */
export function replay(
  events: readonly MatchEvent[],
  cursor: number,
  initialDeckA: number,
  initialDeckB: number,
): Snapshot {
  const s: Snapshot = {
    flagHolder: null,
    attacker: null,
    players: {
      A: emptyPlayer(initialDeckA),
      B: emptyPlayer(initialDeckB),
    },
    attackerPower: 0,
    neededPower: 0,
    finished: false,
    winner: null,
    lastEvent: null,
  }

  const upto = Math.min(cursor, events.length - 1)
  for (let i = 0; i <= upto; i++) {
    const e = events[i]!
    s.lastEvent = e
    switch (e.type) {
      case 'flagInit': {
        const p = s.players[e.player]
        p.flagPile.push(e.card)
        p.deck = Math.max(0, p.deck - 1)
        s.flagHolder = e.player
        s.attacker = e.player === 'A' ? 'B' : 'A'
        break
      }
      case 'reveal': {
        const p = s.players[e.player]
        p.revealed.push(e.card)
        p.deck = Math.max(0, p.deck - 1)
        s.attackerPower = e.runningPower
        break
      }
      case 'flagTaken': {
        // Defender's flag pile goes to defender's own bench.
        const defender = s.players[e.from]
        const attacker = s.players[e.to]
        const { bench } = addToBench(defender.bench, e.benched)
        defender.bench = bench
        defender.flagPile = []

        // Attacker's revealed cards become new flag pile.
        attacker.flagPile = [...attacker.revealed]
        attacker.revealed = []

        // Swap roles.
        s.flagHolder = e.to
        s.attacker = e.from
        s.attackerPower = 0
        break
      }
      case 'effectTriggered':
        // For fans gained by flag-loss, apply to the losing (defender-just-lost) player.
        if (e.effect.trigger === 'flag-loss' && e.effect.body.kind === 'gain-fans') {
          s.players[e.player].fans += e.effect.body.value
        }
        break
      case 'matchEnd':
        s.finished = true
        s.winner = e.winner
        break
      case 'benchOverflow':
      case 'attackerExhausted':
        // No snapshot change — winner comes from matchEnd next.
        break
    }
  }

  // Compute neededPower = current flag holder's flag pile power + in-flag bonus.
  if (s.flagHolder) {
    const p = s.players[s.flagHolder]
    s.neededPower = flagPilePower(p.flagPile) + flagInFlagBonus(p.flagPile)
  }

  return s
}

/** Sanity re-export so scene can pre-inspect a snapshot without importing effects.ts. */
export const _internal = { attackerCardPower, benchAllyBonus }

/* ============================================================
   Store
   ============================================================ */

type MatchStoreState = {
  result: MatchResult | null
  cursor: number
  playing: boolean
  mode: PlaybackMode
  /** Initial deck sizes, kept so replay() can show remaining deck counts. */
  deckSizes: { A: number; B: number }
  /** Human-facing labels for the two players. */
  labels: { A: { name: string; icon: string }; B: { name: string; icon: string } }

  start: (args: {
    deckA: Card[]
    deckB: Card[]
    seed: number
    firstPlayer?: PlayerId
    labelA: { name: string; icon: string }
    labelB: { name: string; icon: string }
  }) => void
  next: () => void
  setPlaying: (v: boolean) => void
  setMode: (m: PlaybackMode) => void
  reset: () => void
}

export const useMatch = create<MatchStoreState>((set, get) => ({
  result: null,
  cursor: -1,
  playing: false,
  mode: 'auto',
  deckSizes: { A: 0, B: 0 },
  labels: {
    A: { name: 'YOU', icon: '👤' },
    B: { name: 'BOT', icon: '🤖' },
  },

  start: ({ deckA, deckB, seed, firstPlayer, labelA, labelB }) => {
    const result = simulateMatch(deckA, deckB, seed, { firstPlayer })
    set({
      result,
      cursor: -1,
      playing: true,
      deckSizes: { A: deckA.length, B: deckB.length },
      labels: { A: labelA, B: labelB },
    })
  },

  next: () => {
    const { result, cursor } = get()
    if (!result) return
    if (cursor < result.events.length - 1) {
      set({ cursor: cursor + 1 })
    } else {
      set({ playing: false })
    }
  },

  setPlaying: (v) => set({ playing: v }),
  setMode: (m) => set({ mode: m }),
  reset: () => set({ result: null, cursor: -1, playing: false }),
}))
