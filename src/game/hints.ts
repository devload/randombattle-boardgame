/**
 * Draft-time hints. Given a candidate card and the player's current deck,
 * suggest reasons to (or not to) pick it. Rendered as small tags on cards
 * so newcomers can spot synergies without knowing all the rules yet.
 */

import type { Card } from './types.ts'

export type PickHint = {
  tone: 'good' | 'warn' | 'info'
  short: string       // short badge label, e.g. "시너지!"
  reason: string      // one-line detail shown on tap
}

export function hintsFor(candidate: Card, currentDeck: readonly Card[]): PickHint[] {
  const hints: PickHint[] = []

  // 1. Already have this card by name → stacking on bench.
  const sameNameCount = currentDeck.filter((c) => c.name === candidate.name).length
  if (sameNameCount > 0) {
    hints.push({
      tone: 'good',
      short: `덱에 ${sameNameCount}장`,
      reason: `내 덱에 ${candidate.name} ${sameNameCount}장 있음 — 벤치에서 한 칸에 스택됩니다.`,
    })
  }

  // 2. Ally-buff (from-bench) synergy: candidate's effect names other cards
  // that are already in the deck.
  for (const eff of candidate.effects) {
    if (eff.trigger === 'from-bench' && eff.body.kind === 'ally-buff') {
      const target = eff.body.targetName
      const targetsInDeck = currentDeck.filter((c) => c.name === target).length
      if (targetsInDeck > 0) {
        hints.push({
          tone: 'good',
          short: `시너지!`,
          reason: `덱에 ${target} ${targetsInDeck}장 있음 — 이 카드가 그들로부터 +${eff.body.value * targetsInDeck} 파워 얻음.`,
        })
      }
    }
  }

  // 3. Deck cards' from-bench effects target THIS candidate name.
  for (const deckCard of currentDeck) {
    for (const eff of deckCard.effects) {
      if (eff.trigger === 'from-bench'
          && eff.body.kind === 'ally-buff'
          && eff.body.targetName === candidate.name) {
        hints.push({
          tone: 'good',
          short: `시너지!`,
          reason: `내 덱의 ${deckCard.name}가 ${candidate.name} 하나당 +${eff.body.value} 파워 획득.`,
        })
        break
      }
    }
  }

  // NOTE: We intentionally do NOT surface things already visible on the card
  // itself (base power, flag-loss fans, effect text). Hints show only info
  // that requires knowing something OUTSIDE this card — i.e. how it
  // interacts with the player's current deck. Card content is card content;
  // hints tell you what your current picks/deck imply.

  return hints
}

/** Aggregate deck stats useful for the "내 덱" sheet. */
export function summarizeDeck(deck: readonly Card[]) {
  const byLevel = { S: 0, A: 0, B: 0, C: 0 } as Record<string, number>
  const byName = new Map<string, number>()
  let totalBasePower = 0
  for (const c of deck) {
    byLevel[c.level]++
    byName.set(c.name, (byName.get(c.name) ?? 0) + 1)
    totalBasePower += c.basePower
  }
  const uniqueNames = byName.size
  const avgPower = deck.length > 0 ? totalBasePower / deck.length : 0
  return { count: deck.length, byLevel, byName, uniqueNames, avgPower }
}
