/**
 * Bench management.
 *
 * Rules from RULES.md:
 * - Bench has 6 slots (max 6 distinct card *names*).
 * - Cards with the same name stack into a single slot.
 * - Placing a 7th distinct name = overflow → owner loses the match.
 */

import type { BenchStack, Card } from './types.ts'

/** Count distinct stacks currently occupied (i.e., unique card names). */
export function benchDistinctCount(bench: readonly BenchStack[]): number {
  return bench.length
}

/**
 * Add a batch of cards to the bench.
 *
 * Returns a new bench array (immutable) and whether adding these cards
 * caused overflow (7th distinct name would be introduced).
 *
 * If overflow occurs mid-batch, the function still returns the bench with
 * the overflowing card placed — the caller decides how to render the
 * losing state.
 */
export function addToBench(
  bench: readonly BenchStack[],
  incoming: readonly Card[],
): { bench: BenchStack[]; overflow: boolean } {
  const next: BenchStack[] = bench.map((s) => ({ cards: [...s.cards] }))
  let overflow = false

  for (const card of incoming) {
    const existing = next.find((s) => s.cards[0]?.name === card.name)
    if (existing) {
      existing.cards.push(card)
    } else {
      if (next.length >= 6) {
        // Adding this would be the 7th distinct name.
        overflow = true
      }
      next.push({ cards: [card] })
    }
  }

  return { bench: next, overflow }
}

/** Count copies of a specific card name currently on the bench. */
export function benchCountByName(bench: readonly BenchStack[], name: string): number {
  const stack = bench.find((s) => s.cards[0]?.name === name)
  return stack?.cards.length ?? 0
}

/** Flatten bench back into a list of cards (for deck recovery between rounds). */
export function benchAllCards(bench: readonly BenchStack[]): Card[] {
  return bench.flatMap((s) => s.cards)
}
