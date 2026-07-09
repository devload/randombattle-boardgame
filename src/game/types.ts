/**
 * Core domain types. Kept pure — no React, no Zustand, no framer.
 *
 * Card model mirrors the original board game's card structure but with
 * effects expressed as a data-driven discriminated union so new cards
 * are one row of data, not code.
 */

/** Card rarity / draft pile level. S = starter (only in initial deck). */
export type Level = 'S' | 'A' | 'B' | 'C'

/** Content set the card belongs to. */
export type CardSet = 'basic' | 'corpOps' | 'underground'

/** Effect trigger keyword (mirrors original game's keywords). */
export type Trigger =
  | 'immediate'      // Fires when revealed. Bonus persists during attack + flag possession.
  | 'during-attack'  // Only active while this card is part of the attacking reveal.
  | 'from-bench'     // Active while the card sits on the bench.
  | 'in-flag'        // Active while the card is in flag possession.
  | 'flag-loss'      // Fires once when the card loses flag possession.
  | 'when-picked'    // Fires once at draft time when the player selects this card.

/**
 * Effect body — discriminated by `kind`.
 * MVP set covers ~90% of what the original cards need.
 */
export type EffectBody =
  /** Add flat power to the owner during the appropriate window. */
  | { kind: 'power-bonus'; value: number }
  /** Subtract from opponent's needed power (only meaningful with in-flag / during-attack). */
  | { kind: 'reduce-opponent'; value: number }
  /** Gain fans (score tokens). */
  | { kind: 'gain-fans'; value: number }
  /** +value power for each card of `targetName` currently on your bench (used with from-bench). */
  | { kind: 'ally-buff'; targetName: string; value: number }
  /** Force the opponent to draw one extra card immediately (only with during-attack). */
  | { kind: 'force-extra-draw'; value: number }

export type Effect = {
  trigger: Trigger
  body: EffectBody
  /** Human-readable text for UI. */
  text: string
}

export type Card = {
  id: string
  name: string
  set: CardSet
  level: Level
  basePower: number
  /** Emoji or icon key. MVP is emoji, later swap to sprite key. */
  icon: string
  effects: Effect[]
  /** Short worldbuilding line shown in card detail. Optional. */
  flavor?: string
}

/* ============================================================
   Match runtime state (per-player).
   ============================================================ */

export type PlayerId = 'A' | 'B'

export type BenchStack = {
  /** All cards in this stack share the same name. */
  cards: Card[]
}

export type PlayerState = {
  id: PlayerId
  /** Face-down draw pile (top = index 0 for convenience). */
  deck: Card[]
  /** Cards currently in flag possession pile (top is the newest reveal). */
  flagPile: Card[]
  /** Bench stacks, ordered by first appearance. Max 6 stacks. */
  bench: BenchStack[]
  /** Cards removed from play (exhaust). */
  exhaust: Card[]
  /** Fans (score tokens) earned during the match by card effects. */
  fans: number
  /** Extra draws this player must perform on their next attack. */
  pendingExtraDraws: number
}

export type MatchState = {
  players: Record<PlayerId, PlayerState>
  /** Who currently holds flag possession. */
  flagHolder: PlayerId
  /** Whose turn it is to attack. Always the non-flag-holder. */
  attacker: PlayerId
  /** Match ended? */
  finished: boolean
  /** If finished, who won. */
  winner: PlayerId | null
  /** How the match ended, for UI display. */
  endReason: MatchEndReason | null
}

export type MatchEndReason =
  | 'attacker-empty-deck'   // Attacker ran out of cards without breaching.
  | 'bench-overflow'        // A player was forced to place a 7th distinct card on their bench.

/* ============================================================
   Match event log — the bridge between logic and UI.
   simulateMatch() emits these in order; the scene replays them.
   ============================================================ */

export type MatchEvent =
  | { type: 'flagInit'; player: PlayerId; card: Card }
  | { type: 'reveal'; player: PlayerId; card: Card; runningPower: number }
  | { type: 'effectTriggered'; player: PlayerId; card: Card; effect: Effect }
  | { type: 'flagTaken'; from: PlayerId; to: PlayerId; benched: Card[] }
  | { type: 'benchOverflow'; player: PlayerId }
  | { type: 'attackerExhausted'; player: PlayerId }
  | { type: 'matchEnd'; winner: PlayerId; reason: MatchEndReason }

export type MatchResult = {
  winner: PlayerId
  reason: MatchEndReason
  events: MatchEvent[]
  finalState: MatchState
}

/* ============================================================
   Tournament level.
   ============================================================ */

export type Trophy = {
  round: number
  /** Fan value on the reverse side. Later trophies = more fans. */
  fans: number
}

export type TournamentPlayer = {
  id: string
  name: string
  isHuman: boolean
  fans: number
  trophies: Trophy[]
}
