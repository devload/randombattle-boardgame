/**
 * Console demo: run a match end-to-end and print the event log.
 *
 * Run with:  npx tsx src/game/__demo__.ts
 *
 * Not shipped in the build — only for local dev verification.
 */

import { cardById, makeStarterDeck } from './cards.ts'
import { simulateMatch } from './match.ts'
import type { MatchEvent } from './types.ts'

// Player deck: starter + a couple of picks (mimics round 3 state).
const playerDeck = [
  ...makeStarterDeck(),
  cardById('a_ghost'),
  cardById('a_stim'),
  cardById('b_overclock'),
  cardById('b_synth'),
]

// Robot deck: ghost.bot preset flavor.
const robotDeck = [
  ...makeStarterDeck(),
  cardById('a_ghost'),
  cardById('a_ghost'),
  cardById('a_blade'),
  cardById('b_netrunner'),
]

const result = simulateMatch(playerDeck, robotDeck, 42, { firstPlayer: 'A' })

console.log('='.repeat(60))
console.log(`MATCH RESULT · winner=${result.winner} · reason=${result.reason}`)
console.log('='.repeat(60))

const format = (e: MatchEvent): string => {
  switch (e.type) {
    case 'flagInit':
      return `[${e.player}] FLAG INIT — ${e.card.name} (base ${e.card.basePower})`
    case 'reveal':
      return `[${e.player}] REVEAL ${e.card.name} · base ${e.card.basePower} · running power ${e.runningPower}`
    case 'effectTriggered':
      return `        └ effect: ${e.effect.trigger} · ${e.effect.text}`
    case 'flagTaken':
      return `>>> FLAG TAKEN: ${e.from} → ${e.to} (${e.benched.length} cards benched)`
    case 'benchOverflow':
      return `!!! BENCH OVERFLOW on player ${e.player}`
    case 'attackerExhausted':
      return `!!! ATTACKER ${e.player} exhausted deck`
    case 'matchEnd':
      return `=== MATCH END: winner=${e.winner} · reason=${e.reason}`
  }
}

for (const e of result.events) {
  console.log(format(e))
}

console.log('='.repeat(60))
console.log('FINAL STATE')
console.log('  A · deck', result.finalState.players.A.deck.length,
  '· flag', result.finalState.players.A.flagPile.length,
  '· bench stacks', result.finalState.players.A.bench.length,
  '· fans', result.finalState.players.A.fans)
console.log('  B · deck', result.finalState.players.B.deck.length,
  '· flag', result.finalState.players.B.flagPile.length,
  '· bench stacks', result.finalState.players.B.bench.length,
  '· fans', result.finalState.players.B.fans)
