/**
 * Robot preset decks — the AI opponents for solo mode.
 *
 * Original game exposes 5 difficulty levels; we expose 5 flavored bots
 * covering the difficulty curve.
 *
 * Each robot's deck is *thematic* — the flavor line describes how they
 * play. Deck composition matches: aggressive bots stack during-attack
 * bonuses, defensive bots stack in-flag reductions, etc.
 */

import type { Card, Level } from './types.ts'
import { cardById, cardsByLevel, makeStarterDeck } from './cards.ts'
import { mulberry32, type Rng } from './rng.ts'

export type Robot = {
  id: string
  name: string
  icon: string
  /** Short flavor line shown on tournament board's next-match card. */
  hint: string
  /** Difficulty tier (1..5). */
  tier: number
  /** Base deck factory — the starting deck at R1 before any picks. */
  makeDeck: () => Card[]
  /**
   * Preferred card IDs (used as bias when picking cards each round).
   * Higher tiers get their signature cards more often.
   */
  preferredIds: string[]
  /** Weight bias for level A vs B vs C picks. Tier 5 leans heavier into C. */
  levelBias: { A: number; B: number; C: number }
}

export const ROBOTS: readonly Robot[] = [
  {
    id: 'alpha',
    name: 'ALPHA',
    icon: '🤖',
    hint: 'balanced starter · uses commons',
    tier: 1,
    makeDeck: () => [
      ...makeStarterDeck(),
      cardById('a_stim'),
      cardById('a_blade'),
    ],
    preferredIds: ['a_stim', 'a_blade', 'a_pistol', 'a_corpsec'],
    levelBias: { A: 3, B: 1, C: 0 },
  },
  {
    id: 'corp',
    name: 'CORP.BOT',
    icon: '💼',
    hint: 'stacks corp sec · scales with bench',
    tier: 2,
    makeDeck: () => [
      ...makeStarterDeck(),
      cardById('a_corpsec'),
      cardById('a_intern'),
    ],
    preferredIds: ['a_corpsec', 'a_intern', 'a_lawyer', 'b_bodyguard', 'c_megacorp'],
    levelBias: { A: 3, B: 2, C: 1 },
  },
  {
    id: 'ghost',
    name: 'GHOST.BOT',
    icon: '🥷',
    hint: 'aggressive attacker · high burst',
    tier: 3,
    makeDeck: () => [
      ...makeStarterDeck(),
      cardById('a_ghost'),
      cardById('a_signal'),
    ],
    preferredIds: ['a_ghost', 'a_signal', 'a_hacker', 'b_overclock', 'b_stealth', 'c_kraken'],
    levelBias: { A: 2, B: 3, C: 1 },
  },
  {
    id: 'ice',
    name: 'ICE.BOT',
    icon: '❄️',
    hint: 'defensive · in-flag reduces damage',
    tier: 4,
    makeDeck: () => [
      ...makeStarterDeck(),
      cardById('a_pistol'),
      cardById('b_execAI'),
    ],
    preferredIds: ['b_execAI', 'b_hologram', 'b_virus', 'c_glitch', 'c_iceking'],
    levelBias: { A: 1, B: 3, C: 2 },
  },
  {
    id: 'champ',
    name: 'C.H.A.M.P',
    icon: '👑',
    hint: 'endgame boss · elite tier',
    tier: 5,
    makeDeck: () => [
      ...makeStarterDeck(),
      cardById('a_ghost'),
      cardById('b_synth'),
    ],
    preferredIds: ['b_synth', 'b_execAI', 'c_daemon', 'c_megacorp', 'c_apex', 'c_titan', 'c_boardroom'],
    levelBias: { A: 1, B: 2, C: 3 },
  },
] as const

/**
 * Bot draft: given a robot and a round, produce the picks it would make.
 * Uses preferred IDs first (if that level is open), then fills from
 * the level pool weighted by the bot's bias.
 */
export function robotPicksForRound(robot: Robot, round: number, seed: number): Card[] {
  const rng = mulberry32(seed ^ round * 0x9E3779B1)
  const picks: Card[] = []
  // Simple mirror of player budget: 2 A + (2 B or 1 C).
  const openA = true
  const openB = round >= 2
  const openC = round >= 5

  if (openA) {
    picks.push(pickFromLevel('A', robot, rng))
    picks.push(pickFromLevel('A', robot, rng))
  }
  if (openC && robot.levelBias.C > robot.levelBias.B * 1.5) {
    picks.push(pickFromLevel('C', robot, rng))
  } else if (openB) {
    picks.push(pickFromLevel('B', robot, rng))
    picks.push(pickFromLevel('B', robot, rng))
  }
  return picks
}

function pickFromLevel(level: Level, robot: Robot, rng: Rng): Card {
  const preferredAtLevel = robot.preferredIds
    .map((id) => {
      try { return cardById(id) } catch { return null }
    })
    .filter((c): c is Card => !!c && c.level === level)

  // 60% chance of picking a preferred card if any, else full pool.
  const usePreferred = preferredAtLevel.length > 0 && rng() < 0.6
  const pool = usePreferred ? preferredAtLevel : cardsByLevel(level)
  return pool[Math.floor(rng() * pool.length)]!
}

export function robotById(id: string): Robot {
  const r = ROBOTS.find((r) => r.id === id)
  if (!r) throw new Error(`Unknown robot id: ${id}`)
  return r
}
