/**
 * Match simulator.
 *
 * Pure function → given two decks + a seed, returns:
 *   - winner + reason
 *   - a full event log for the UI to replay animation
 *   - the final match state (for post-match deck recovery)
 *
 * No React, no store, no animation timing here. All timing/pacing lives
 * in MatchPhaseScene which consumes the event log.
 *
 * Flow (mirrors RULES.md → match phase):
 *   1. Both decks shuffled.
 *   2. First player reveals top card → becomes flag possession.
 *   3. Other player becomes attacker; reveals cards one by one until
 *      revealed total power ≥ defender's flag pile power.
 *   4. On breach: defender's flag pile → defender's own bench.
 *      Attacker's revealed cards stack under the newest reveal as the
 *      new flag pile. Roles swap.
 *   5. Match ends when:
 *      a) attacker's deck runs out mid-attack (attacker loses)
 *      b) 7th distinct card is placed on a bench (that player loses)
 */

import type {
  Card,
  MatchEndReason,
  MatchEvent,
  MatchResult,
  MatchState,
  PlayerId,
  PlayerState,
} from './types.ts'
import { addToBench } from './bench.ts'
import {
  attackerCardPower,
  attackRevealPower,
  benchAllyBonus,
  flagInFlagBonus,
  flagPilePower,
} from './effects.ts'
import { mulberry32, shuffle } from './rng.ts'

function initPlayer(id: PlayerId, deck: readonly Card[], seed: number): PlayerState {
  const rng = mulberry32(seed)
  return {
    id,
    deck: shuffle([...deck], rng),
    flagPile: [],
    bench: [],
    exhaust: [],
    fans: 0,
    pendingExtraDraws: 0,
  }
}

function otherPlayer(p: PlayerId): PlayerId {
  return p === 'A' ? 'B' : 'A'
}

/** Draw top card from deck, mutating the player's deck. */
function drawTop(player: PlayerState): Card | null {
  if (player.deck.length === 0) return null
  return player.deck.shift()!
}

/**
 * Compute the effective power the attacker needs to breach the defender.
 * = base flag pile power + in-flag defensive bonus
 */
function requiredPower(defender: PlayerState): number {
  return flagPilePower(defender.flagPile) + flagInFlagBonus(defender.flagPile)
}

/**
 * Effective power the attacker currently has:
 * = sum of revealed card power + bench ally bonus
 * (bench ally bonus derives from the attacker's own bench.)
 */
function attackerPower(attacker: PlayerState, revealed: readonly Card[]): number {
  return attackRevealPower(revealed) + benchAllyBonus(attacker.bench)
}

/**
 * Fire flag-loss effects when a card is being knocked off flag possession.
 * MVP-supported: gain-fans → adds to the *losing* player's fan pool.
 */
function applyFlagLossEffects(losingPlayer: PlayerState, flagPile: readonly Card[], events: MatchEvent[]) {
  for (const card of flagPile) {
    for (const e of card.effects) {
      if (e.trigger === 'flag-loss' && e.body.kind === 'gain-fans') {
        losingPlayer.fans += e.body.value
        events.push({ type: 'effectTriggered', player: losingPlayer.id, card, effect: e })
      }
    }
  }
}

export type SimulateOptions = {
  /** Which player reveals first (holds initial flag). Default 'A'. */
  firstPlayer?: PlayerId
  /** Safety cap on total revealed cards to prevent runaway loops in bad data. */
  maxReveals?: number
}

export function simulateMatch(
  deckA: readonly Card[],
  deckB: readonly Card[],
  seed: number,
  opts: SimulateOptions = {},
): MatchResult {
  const firstPlayer: PlayerId = opts.firstPlayer ?? 'A'
  const maxReveals = opts.maxReveals ?? 500

  const state: MatchState = {
    players: {
      A: initPlayer('A', deckA, seed ^ 0xA1A1A1A1),
      B: initPlayer('B', deckB, seed ^ 0xB2B2B2B2),
    },
    flagHolder: firstPlayer,
    attacker: otherPlayer(firstPlayer),
    finished: false,
    winner: null,
    endReason: null,
  }

  const events: MatchEvent[] = []

  // Opening reveal: first player puts down initial flag card.
  const opener = drawTop(state.players[firstPlayer])
  if (!opener) {
    // Degenerate case (empty starter deck). Attacker wins by default.
    return finish(state, events, otherPlayer(firstPlayer), 'attacker-empty-deck')
  }
  state.players[firstPlayer].flagPile.push(opener)
  events.push({ type: 'flagInit', player: firstPlayer, card: opener })

  let totalReveals = 0

  while (!state.finished && totalReveals < maxReveals) {
    const attacker = state.players[state.attacker]
    const defender = state.players[state.flagHolder]
    const need = requiredPower(defender)

    // Attacker reveals cards until they meet or exceed `need`, or run out.
    // Original rules: the attacker must reveal at least one card per attack,
    // even if bench bonuses alone would already meet the requirement. We
    // model that with a do-while: draw first, then check.
    //
    // pendingExtraDraws (force-extra-draw) also require the attacker to reveal
    // additional cards beyond the normal breach point of this attack.
    const revealed: Card[] = []
    let extraDrawsRemaining = attacker.pendingExtraDraws
    attacker.pendingExtraDraws = 0 // consumed on this attack
    let breached = false

    do {
      const card = drawTop(attacker)
      if (!card) {
        // Attacker exhausted deck without breaching → attacker loses.
        // Preserve everything they revealed this attack in the exhaust pile
        // so recoverDeck() at match-end doesn't lose cards forever.
        attacker.exhaust.push(...revealed)
        events.push({ type: 'attackerExhausted', player: attacker.id })
        return finish(state, events, defender.id, 'attacker-empty-deck')
      }
      revealed.push(card)
      totalReveals++

      // Fire immediate effect log + apply force-extra-draw to defender's future attack.
      for (const e of card.effects) {
        if (e.trigger === 'immediate' || e.trigger === 'during-attack') {
          events.push({ type: 'effectTriggered', player: attacker.id, card, effect: e })
        }
        if (e.trigger === 'during-attack' && e.body.kind === 'force-extra-draw') {
          defender.pendingExtraDraws += e.body.value
        }
      }

      events.push({
        type: 'reveal',
        player: attacker.id,
        card,
        runningPower: attackerPower(attacker, revealed),
      })

      const enoughPower = attackerPower(attacker, revealed) >= need
      if (enoughPower && extraDrawsRemaining <= 0) {
        breached = true
        break
      }
      if (extraDrawsRemaining > 0) extraDrawsRemaining--
    } while (attackerPower(attacker, revealed) < need || extraDrawsRemaining > 0)

    if (!breached && attackerPower(attacker, revealed) >= need) breached = true
    if (!breached) continue // safety (should be unreachable now)

    // ------------------------------------------------------------
    // Breach: defender loses flag pile → to defender's own bench.
    // Attacker's revealed cards become the new flag pile.
    // Roles swap.
    // ------------------------------------------------------------
    const benched = defender.flagPile
    applyFlagLossEffects(defender, benched, events)

    const { bench: newBench, overflow } = addToBench(defender.bench, benched)
    defender.bench = newBench
    defender.flagPile = []

    // Attacker's revealed cards become the new flag pile.
    // IMPORTANT: assign this BEFORE the overflow-end check so those cards
    // are never orphaned when the match ends here — recoverDeck() reads
    // from flagPile, so anything left in the local `revealed` array
    // would be lost forever.
    attacker.flagPile = revealed

    events.push({
      type: 'flagTaken',
      from: defender.id,
      to: attacker.id,
      benched: [...benched],
    })

    if (overflow) {
      events.push({ type: 'benchOverflow', player: defender.id })
      return finish(state, events, attacker.id, 'bench-overflow')
    }

    // Swap roles.
    state.flagHolder = attacker.id
    state.attacker = defender.id
  }

  // Safety exit (should not happen in normal play).
  return finish(state, events, state.flagHolder, 'attacker-empty-deck')
}

function finish(
  state: MatchState,
  events: MatchEvent[],
  winner: PlayerId,
  reason: MatchEndReason,
): MatchResult {
  state.finished = true
  state.winner = winner
  state.endReason = reason
  events.push({ type: 'matchEnd', winner, reason })
  return { winner, reason, events, finalState: state }
}

/** Utility exposed for tests/debug: what power a single card contributes as attacker. */
export const _testHelpers = { attackerCardPower }
