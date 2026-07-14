import { describe, it, expect } from 'vitest'
import {
  awardTrophy,
  decideFirstPlayer,
  finalists,
  highestTrophyRound,
  humanInFinal,
  isInstantWin,
  leaderboard,
  totalFans,
  trophyFans,
} from './tournament.ts'
import type { TournamentPlayer } from './types.ts'

function makePlayer(over: Partial<TournamentPlayer> & { id: string; name: string }): TournamentPlayer {
  return {
    id: over.id,
    name: over.name,
    isHuman: over.isHuman ?? false,
    fans: over.fans ?? 0,
    trophies: over.trophies ?? [],
  }
}

describe('tournament · trophyFans', () => {
  it('round 1 trophy is worth 2 fans; later rounds worth more', () => {
    expect(trophyFans(1)).toBe(2)
    expect(trophyFans(7)).toBe(8)
    // Monotonically increasing.
    for (let r = 1; r < 7; r++) {
      expect(trophyFans(r + 1)).toBeGreaterThan(trophyFans(r))
    }
  })
})

describe('tournament · totalFans + trophies', () => {
  it('sums card fans + trophy fans', () => {
    const p = makePlayer({
      id: 'x', name: 'X',
      fans: 3,
      trophies: [{ round: 2, fans: 3 }, { round: 5, fans: 6 }],
    })
    expect(totalFans(p)).toBe(3 + 3 + 6)
  })

  it('awardTrophy adds a trophy for the given round with correct fan value', () => {
    const p = makePlayer({ id: 'x', name: 'X' })
    const p2 = awardTrophy(p, 3)
    expect(p2.trophies.length).toBe(1)
    expect(p2.trophies[0]!.round).toBe(3)
    expect(p2.trophies[0]!.fans).toBe(trophyFans(3))
  })
})

describe('tournament · highestTrophyRound', () => {
  it('returns 0 for a player with no trophies', () => {
    expect(highestTrophyRound(makePlayer({ id: 'x', name: 'X' }))).toBe(0)
  })

  it('returns the maximum round across trophies', () => {
    const p = makePlayer({
      id: 'x', name: 'X',
      trophies: [{ round: 2, fans: 3 }, { round: 6, fans: 7 }, { round: 4, fans: 5 }],
    })
    expect(highestTrophyRound(p)).toBe(6)
  })
})

describe('tournament · leaderboard tiebreaks', () => {
  it('primary sort is total fans (descending)', () => {
    const a = makePlayer({ id: 'a', name: 'A', fans: 10 })
    const b = makePlayer({ id: 'b', name: 'B', fans: 5 })
    const c = makePlayer({ id: 'c', name: 'C', fans: 20 })
    const board = leaderboard([a, b, c])
    expect(board.map((p) => p.id)).toEqual(['c', 'a', 'b'])
  })

  it('tiebreak 1: same fans → more trophies wins', () => {
    // Both have 8 total fans, but A has 2 trophies of 4 fans each; B has 1 trophy of 8 fans.
    const a = makePlayer({
      id: 'a', name: 'A',
      trophies: [{ round: 3, fans: 4 }, { round: 3, fans: 4 }],
    })
    const b = makePlayer({
      id: 'b', name: 'B',
      trophies: [{ round: 7, fans: 8 }],
    })
    const board = leaderboard([b, a])
    expect(board[0]!.id).toBe('a')
    expect(board[1]!.id).toBe('b')
  })

  it('tiebreak 2: same fans and same trophy count → higher round trophy wins', () => {
    // Both have identical fan totals (5) and 1 trophy. A's trophy is R2, B's is R4.
    const a = makePlayer({
      id: 'a', name: 'A', fans: 2,
      trophies: [{ round: 2, fans: 3 }],
    })
    const b = makePlayer({
      id: 'b', name: 'B', fans: 2,
      trophies: [{ round: 4, fans: 3 }],
    })
    const board = leaderboard([a, b])
    expect(board[0]!.id).toBe('b')
    expect(board[1]!.id).toBe('a')
  })
})

describe('tournament · finalists', () => {
  it('picks top two by leaderboard order', () => {
    const players = [
      makePlayer({ id: 'a', name: 'A', fans: 5 }),
      makePlayer({ id: 'b', name: 'B', fans: 10 }),
      makePlayer({ id: 'c', name: 'C', fans: 3 }),
    ]
    const fs = finalists(players)
    expect(fs).not.toBeNull()
    expect(fs![0]!.id).toBe('b')
    expect(fs![1]!.id).toBe('a')
  })

  it('humanInFinal is true when human is in top 2', () => {
    const players = [
      makePlayer({ id: 'human', name: 'YOU', isHuman: true, fans: 8 }),
      makePlayer({ id: 'r1', name: 'BOT1', fans: 10 }),
      makePlayer({ id: 'r2', name: 'BOT2', fans: 3 }),
    ]
    expect(humanInFinal(players)).toBe(true)
  })

  it('humanInFinal is false when human is not in top 2', () => {
    const players = [
      makePlayer({ id: 'human', name: 'YOU', isHuman: true, fans: 2 }),
      makePlayer({ id: 'r1', name: 'BOT1', fans: 10 }),
      makePlayer({ id: 'r2', name: 'BOT2', fans: 8 }),
    ]
    expect(humanInFinal(players)).toBe(false)
  })
})

describe('tournament · isInstantWin (11-fan gap)', () => {
  it('true when gap between top-2 is exactly 11', () => {
    const players = [
      makePlayer({ id: 'a', name: 'A', fans: 15 }),
      makePlayer({ id: 'b', name: 'B', fans: 4 }),
    ]
    expect(isInstantWin(players)).toBe(true)
  })

  it('true when gap is more than 11', () => {
    const players = [
      makePlayer({ id: 'a', name: 'A', fans: 20 }),
      makePlayer({ id: 'b', name: 'B', fans: 3 }),
    ]
    expect(isInstantWin(players)).toBe(true)
  })

  it('false when gap is 10 or less', () => {
    const players = [
      makePlayer({ id: 'a', name: 'A', fans: 14 }),
      makePlayer({ id: 'b', name: 'B', fans: 4 }),
    ]
    expect(isInstantWin(players)).toBe(false)
  })
})

describe('tournament · decideFirstPlayer', () => {
  it('R1 → coin flip based on seed parity', () => {
    const human = makePlayer({ id: 'h', name: 'YOU', isHuman: true })
    expect(decideFirstPlayer(1, human, { trophies: [] }, 0)).toBe('A')
    expect(decideFirstPlayer(1, human, { trophies: [] }, 1)).toBe('B')
  })

  it('R2+ → human with higher-round trophy goes first', () => {
    const human = makePlayer({
      id: 'h', name: 'YOU', isHuman: true,
      trophies: [{ round: 3, fans: 4 }], // highest = 3
    })
    const opponentLower = { trophies: [{ round: 1, fans: 2 }] } // highest = 1
    expect(decideFirstPlayer(4, human, opponentLower, 42)).toBe('A')
  })

  it('R2+ → opponent with higher-round trophy goes first', () => {
    const human = makePlayer({
      id: 'h', name: 'YOU', isHuman: true,
      trophies: [{ round: 1, fans: 2 }], // highest = 1
    })
    const opponentHigher = { trophies: [{ round: 5, fans: 6 }] } // highest = 5
    expect(decideFirstPlayer(6, human, opponentHigher, 42)).toBe('B')
  })

  it('R2+ tie on highest round → seed decides', () => {
    const human = makePlayer({
      id: 'h', name: 'YOU', isHuman: true,
      trophies: [{ round: 3, fans: 4 }],
    })
    const opp = { trophies: [{ round: 3, fans: 4 }] }
    expect(decideFirstPlayer(4, human, opp, 0)).toBe('A')
    expect(decideFirstPlayer(4, human, opp, 1)).toBe('B')
  })

  it('R2+ legacy call signature (trophies as number) still resolves', () => {
    // Regression: some UI callers may still pass a count.
    const human = makePlayer({
      id: 'h', name: 'YOU', isHuman: true,
      trophies: [{ round: 4, fans: 5 }], // highest = 4
    })
    // Opponent passed as count 2 → treated as highestRound=2 → human wins.
    expect(decideFirstPlayer(5, human, { trophies: 2 }, 42)).toBe('A')
  })
})
