/**
 * Deck construction + draft phase.
 *
 * Rules from RULES.md → deck phase:
 * - Draw 5 cards from the pile allowed for the current round.
 * - Pick rule (per round):
 *     A pile → 2 picks
 *     B pile → 2 picks   OR   C pile → 1 pick
 * - Round-based pile access:
 *     R1     → A
 *     R2-R4  → A + B
 *     R5-R7  → A + B + C
 * - One reroll per draft (discard all 5 and redraw from the same pile).
 */

import type { Card, Level } from './types.ts'
import { CARDS } from './cards.ts'
import { shuffle, type Rng } from './rng.ts'

/** Levels open in each pile for a given round (1..7). */
export function openLevels(round: number): Level[] {
  if (round <= 1) return ['A']
  if (round <= 4) return ['A', 'B']
  return ['A', 'B', 'C']
}

/** Draft budget for a round — how many picks per pile. */
export type DraftBudget = {
  A: number
  B: number
  C: number
  /** Constraint: B and C are mutually exclusive per original ruleset. */
  bOrC: boolean
}

/** Same budget for every round in the MVP (2 A + (2 B OR 1 C)). */
export function draftBudget(round: number): DraftBudget {
  const levels = openLevels(round)
  return {
    A: levels.includes('A') ? 2 : 0,
    B: levels.includes('B') ? 2 : 0,
    C: levels.includes('C') ? 1 : 0,
    bOrC: levels.includes('B') && levels.includes('C'),
  }
}

/** All cards available in a given pile (level). Data comes from the card DB. */
export function pilePool(level: Level): Card[] {
  return CARDS.filter((c) => c.level === level && c.level !== 'S')
}

/**
 * Draw 5 cards from a pool. If pool is smaller than 5, returns pool as-is.
 * Cards are drawn with replacement conceptually — in the physical game
 * the piles are limited but for MVP simulation we treat the pool as a
 * shuffled infinite queue seeded per round.
 */
export function drawFromPile(level: Level, rng: Rng, count = 5): Card[] {
  const pool = shuffle([...pilePool(level)], rng)
  return pool.slice(0, Math.min(count, pool.length))
}

/**
 * Validate a picked selection against the round's budget.
 * Returns `null` if valid, or an error message.
 */
export function validatePicks(round: number, picks: readonly Card[]): string | null {
  const budget = draftBudget(round)
  const counts = { A: 0, B: 0, C: 0, S: 0 } as Record<Level, number>
  for (const c of picks) counts[c.level]++

  if (counts.S > 0) return 'Starter cards cannot be drafted.'
  if (counts.A > budget.A) return `Too many Level A picks (max ${budget.A}).`

  if (budget.bOrC) {
    // Exclusive: either B×2 OR C×1, not mixed.
    if (counts.B > 0 && counts.C > 0) return 'Cannot mix Level B and Level C picks.'
    if (counts.B > budget.B) return `Too many Level B picks (max ${budget.B}).`
    if (counts.C > budget.C) return `Too many Level C picks (max ${budget.C}).`
  } else {
    if (counts.B > budget.B) return `Too many Level B picks (max ${budget.B}).`
    if (counts.C > budget.C) return `Too many Level C picks (max ${budget.C}).`
  }
  return null
}

/**
 * Recover a full deck after a match: bench + flag pile + exhaust + any
 * unrevealed deck cards all merge back into a single face-down deck.
 * Returns the merged list (not shuffled — caller shuffles at match start).
 */
export function recoverDeck(parts: {
  deck: readonly Card[]
  flagPile: readonly Card[]
  bench: readonly Card[]
  exhaust: readonly Card[]
}): Card[] {
  return [...parts.deck, ...parts.flagPile, ...parts.bench, ...parts.exhaust]
}
