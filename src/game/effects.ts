/**
 * Effect resolvers.
 *
 * Each function computes a *derived* number from state. Effects never
 * mutate — they read state and return contributions. The match runner
 * decides where to apply them.
 *
 * Trigger keyword coverage (from RULES.md):
 *   immediate     → applied when a card is revealed; bonus persists in attack + flag possession
 *   during-attack → active only while the card is part of the attacking reveal
 *   from-bench    → active while the card sits on the bench
 *   in-flag       → active while the card holds flag possession
 *   flag-loss     → fires once on flag loss (handled inline by match runner)
 */

import type { BenchStack, Card, Effect } from './types.ts'
import { benchCountByName } from './bench.ts'

type ImmediateEffect = Extract<Effect, { trigger: 'immediate' }>
type DuringAttackEffect = Extract<Effect, { trigger: 'during-attack' }>
type FromBenchEffect = Extract<Effect, { trigger: 'from-bench' }>
type InFlagEffect = Extract<Effect, { trigger: 'in-flag' }>

/* ------------------------------------------------------------
   Power contributions
   ------------------------------------------------------------ */

/**
 * Power a single card contributes when it is part of the attack reveal.
 * Includes basePower + immediate power-bonus + during-attack power-bonus.
 *
 * (from-bench and in-flag come from other locations, not the attacker's own hand.)
 */
export function attackerCardPower(card: Card): number {
  let p = card.basePower
  for (const e of card.effects) {
    if (e.trigger === 'immediate' && e.body.kind === 'power-bonus') {
      p += e.body.value
    }
    if (e.trigger === 'during-attack' && e.body.kind === 'power-bonus') {
      p += e.body.value
    }
  }
  return p
}

/**
 * Power a single card contributes while it is part of the *flag possession pile*.
 * Only immediate power-bonus persists there.
 */
export function flagCardPower(card: Card): number {
  let p = card.basePower
  for (const e of card.effects) {
    if (e.trigger === 'immediate' && e.body.kind === 'power-bonus') {
      p += e.body.value
    }
  }
  return p
}

/** Sum of flag-possession power over the whole pile. */
export function flagPilePower(flagPile: readonly Card[]): number {
  return flagPile.reduce((acc, c) => acc + flagCardPower(c), 0)
}

/** Sum of attack-time power over revealed cards. */
export function attackRevealPower(revealed: readonly Card[]): number {
  return revealed.reduce((acc, c) => acc + attackerCardPower(c), 0)
}

/* ------------------------------------------------------------
   Bench-based bonuses (applied to the attacker's power)
   ------------------------------------------------------------ */

/**
 * Bench bonuses granted to the attacker: sum over every card on their
 * own bench that has a `from-bench` ally-buff whose target name is
 * currently present on the same bench.
 */
export function benchAllyBonus(bench: readonly BenchStack[]): number {
  let bonus = 0
  for (const stack of bench) {
    for (const card of stack.cards) {
      for (const e of card.effects) {
        if (e.trigger === 'from-bench' && e.body.kind === 'ally-buff') {
          // Count matching allies, excluding this card itself.
          const count = benchCountByName(bench, e.body.targetName) - (card.name === e.body.targetName ? 1 : 0)
          if (count > 0) bonus += e.body.value * count
        }
      }
    }
  }
  return bonus
}

/* ------------------------------------------------------------
   Flag-possession bonuses (applied to defender's flag pile power)
   ------------------------------------------------------------ */

/**
 * In-flag effects on the current flag pile: `reduce-opponent` subtracts
 * from the attacker's required power. We express this as a positive
 * "defensive bonus" that gets added to the flag pile's effective power.
 */
export function flagInFlagBonus(flagPile: readonly Card[]): number {
  let bonus = 0
  for (const card of flagPile) {
    for (const e of card.effects) {
      if (e.trigger === 'in-flag' && e.body.kind === 'reduce-opponent') {
        bonus += e.body.value
      }
    }
  }
  return bonus
}

/* ------------------------------------------------------------
   Helpers used by the match runner
   ------------------------------------------------------------ */

/* ------------------------------------------------------------
   Reveal breakdown (for UI)
   ------------------------------------------------------------ */

export type PowerContribution = {
  label: string       // "기본 파워", "즉시 +1" etc.
  value: number
  tone: 'base' | 'immediate' | 'attack' | 'bench-synergy'
}

/**
 * Break a card's attacker-side power into individual contributions so the
 * UI can play them one-by-one as they sum up.
 */
export function revealBreakdown(
  card: Card,
  attackerBench?: readonly BenchStack[],
): PowerContribution[] {
  const parts: PowerContribution[] = []
  parts.push({ label: '기본 파워', value: card.basePower, tone: 'base' })

  for (const e of card.effects) {
    if (e.trigger === 'immediate' && e.body.kind === 'power-bonus') {
      parts.push({ label: `즉시`, value: e.body.value, tone: 'immediate' })
    }
    if (e.trigger === 'during-attack' && e.body.kind === 'power-bonus') {
      parts.push({ label: `공격 시`, value: e.body.value, tone: 'attack' })
    }
  }

  // Bench synergy: any deck card whose from-bench effect targets THIS card's name.
  if (attackerBench) {
    for (const stack of attackerBench) {
      for (const bc of stack.cards) {
        for (const e of bc.effects) {
          if (e.trigger === 'from-bench'
              && e.body.kind === 'ally-buff'
              && e.body.targetName === card.name) {
            parts.push({
              label: `${bc.name} 시너지`,
              value: e.body.value,
              tone: 'bench-synergy',
            })
          }
        }
      }
    }
  }

  return parts
}

export function isImmediate(e: Effect): e is ImmediateEffect {
  return e.trigger === 'immediate'
}
export function isDuringAttack(e: Effect): e is DuringAttackEffect {
  return e.trigger === 'during-attack'
}
export function isFromBench(e: Effect): e is FromBenchEffect {
  return e.trigger === 'from-bench'
}
export function isInFlag(e: Effect): e is InFlagEffect {
  return e.trigger === 'in-flag'
}
