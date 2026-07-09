/**
 * Tournament orchestration.
 *
 * Rules from RULES.md:
 *   - 7 rounds total. Each round: everyone drafts, then everyone plays
 *     one 1v1 match.
 *   - Round N trophy has N+1 fans on the back (round 1 = 2 fans, round 7 = 8 fans).
 *   - Player + robots (5-7 total) compete. Solo mode: 4 robots (mvp).
 *   - After R7: highest fan total wins (no final in the MVP; MVP.md dropped it).
 *   - Instant win: fan gap ≥ 11 at any point ends the tournament.
 */

import type { Trophy, TournamentPlayer } from './types.ts'
import { ROBOTS, type Robot } from './robots.ts'

export const TOTAL_ROUNDS = 7

/** Fans awarded for winning the final. */
export const FINAL_TROPHY_FANS = 10

/** Fans printed on the reverse of a trophy for a given round (1..7). */
export function trophyFans(round: number): number {
  // Round 1 → 2 fans, R2 → 3, ..., R7 → 8. Higher rounds worth more.
  return round + 1
}

/** Sum of a player's fans (trophy fans only; card fans handled inside match). */
export function totalFans(p: TournamentPlayer): number {
  const trophyFans = p.trophies.reduce((sum, t) => sum + t.fans, 0)
  return trophyFans + p.fans
}

/** Sorted leaderboard, descending by total fans. */
export function leaderboard(players: readonly TournamentPlayer[]): TournamentPlayer[] {
  return [...players].sort((a, b) => totalFans(b) - totalFans(a))
}

/** Detect end-of-tournament instant win (fan gap ≥ 11). */
export function isInstantWin(players: readonly TournamentPlayer[]): boolean {
  const board = leaderboard(players)
  if (board.length < 2) return false
  return totalFans(board[0]!) - totalFans(board[1]!) >= 11
}

/** Choose the current-round opponent for the human player.
 *  MVP: cycles through the robot list deterministically. */
export function opponentForRound(round: number, robots: readonly Robot[]): Robot {
  return robots[(round - 1) % robots.length]!
}

/** Who advances to the final? Top 2 by fan total. */
export function finalists(players: readonly TournamentPlayer[]): [TournamentPlayer, TournamentPlayer] | null {
  const board = leaderboard(players)
  if (board.length < 2) return null
  return [board[0]!, board[1]!]
}

/** Is the human in the final? */
export function humanInFinal(players: readonly TournamentPlayer[]): boolean {
  const fs = finalists(players)
  if (!fs) return false
  return fs.some((p) => p.isHuman)
}

/** Award a trophy to a player for winning round N. */
export function awardTrophy(player: TournamentPlayer, round: number): TournamentPlayer {
  const trophy: Trophy = { round, fans: trophyFans(round) }
  return { ...player, trophies: [...player.trophies, trophy] }
}

/**
 * Decide who reveals first this round.
 * Original rules:
 *   Round 1 → coin flip (random)
 *   Round 2+ → player with the higher trophy number (= more trophies) goes first;
 *              tiebreak = coin flip.
 */
export function decideFirstPlayer(
  round: number,
  human: TournamentPlayer,
  opponent: { trophies: number },
  seed: number,
): 'A' | 'B' {
  if (round === 1) {
    // Coin flip from seed.
    return (seed & 1) === 0 ? 'A' : 'B'
  }
  const humanTrophies = human.trophies.length
  if (humanTrophies > opponent.trophies) return 'A'
  if (humanTrophies < opponent.trophies) return 'B'
  return (seed & 1) === 0 ? 'A' : 'B'
}

/**
 * Build the initial tournament roster: 1 human + N robots.
 * MVP uses the 3 robots defined in robots.ts.
 */
export function makeInitialRoster(): TournamentPlayer[] {
  const human: TournamentPlayer = {
    id: 'human',
    name: 'YOU',
    isHuman: true,
    fans: 0,
    trophies: [],
  }
  const bots: TournamentPlayer[] = ROBOTS.map((r) => ({
    id: r.id,
    name: r.name,
    isHuman: false,
    fans: 0,
    trophies: [],
  }))
  return [human, ...bots]
}
