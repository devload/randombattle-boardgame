import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Card, MatchResult, TournamentPlayer } from '../game/types.ts'
import { makeStarterDeck } from '../game/cards.ts'
import { awardTrophy, humanInFinal, isInstantWin, makeInitialRoster, opponentForRound, TOTAL_ROUNDS, FINAL_TROPHY_FANS, finalists } from '../game/tournament.ts'
import { ROBOTS, robotPicksForRound } from '../game/robots.ts'
import { recoverDeck } from '../game/deck.ts'

/**
 * Tournament store: tracks round, players, human's deck between rounds,
 * and the current-round context (opponent, seed, etc.).
 *
 * Non-human players are simulated: after every round, their fan totals
 * grow by a modest random amount so the leaderboard feels alive.
 */

type TournamentState = {
  players: TournamentPlayer[]
  round: number  // 1..7
  humanDeck: Card[]
  /** Per-robot growing decks. Keyed by robot id. */
  robotDecks: Record<string, Card[]>
  /** The opponent id chosen for the CURRENT round. */
  currentOpponentId: string | null
  /** Seed used to generate the current round's match. */
  currentSeed: number
  /** Finished result of the last completed match (for result screen). */
  lastMatchResult: MatchResult | null
  /** Whether the tournament is fully done (R7 completed or instant win). */
  finished: boolean
  /** After R7 completes, the top-2 fan holders play the final. */
  inFinal: boolean
  /** Human's opponent in the final (if human is a finalist). */
  finalOpponentName: string | null

  startTournament: () => void
  /** Called after the player finishes drafting; sets the human deck. */
  setHumanDeck: (deck: Card[]) => void
  /** Called when the current match completes; updates fans/trophies + advances round. */
  finishMatch: (result: MatchResult, deckRecovered: Card[]) => void
  /** Called when the final ends; awards championship trophy. */
  finishFinal: (result: MatchResult) => void
  /** Reset everything. */
  reset: () => void
}

/** Simulated fan growth for bots after each round. Deterministic-ish per seed. */
function simulateBotFans(round: number, tier: number): number {
  // Higher-tier bots average more fans per round. Small jitter.
  const base = tier * 0.6 + Math.random() * 2.2
  return Math.round(base + round * 0.3)
}

export const useTournament = create<TournamentState>()(
  immer((set) => ({
    players: [],
    round: 1,
    humanDeck: [],
    robotDecks: {},
    currentOpponentId: null,
    currentSeed: 0,
    lastMatchResult: null,
    finished: false,
    inFinal: false,
    finalOpponentName: null,

    startTournament: () => set((s) => {
      s.players = makeInitialRoster()
      s.round = 1
      s.humanDeck = makeStarterDeck()
      // Initialize each robot's deck with their base composition.
      s.robotDecks = {}
      for (const r of ROBOTS) s.robotDecks[r.id] = r.makeDeck()
      const opponent = opponentForRound(1, ROBOTS)
      s.currentOpponentId = opponent.id
      s.currentSeed = (Math.random() * 0xffffffff) >>> 0
      s.lastMatchResult = null
      s.finished = false
      s.inFinal = false
      s.finalOpponentName = null
    }),

    setHumanDeck: (deck) => set((s) => {
      s.humanDeck = deck
    }),

    finishMatch: (result, deckRecovered) => set((s) => {
      s.lastMatchResult = result
      s.humanDeck = deckRecovered

      // Award human trophy if they won.
      const humanIdx = s.players.findIndex((p) => p.isHuman)
      const oppIdx = s.players.findIndex((p) => p.id === s.currentOpponentId)
      const humanWon = result.winner === 'A'
      if (humanIdx >= 0 && humanWon) {
        s.players[humanIdx] = awardTrophy(s.players[humanIdx]!, s.round)
      } else if (oppIdx >= 0 && !humanWon) {
        s.players[oppIdx] = awardTrophy(s.players[oppIdx]!, s.round)
      }
      // Human gains any fans from card effects (from result.finalState).
      if (humanIdx >= 0) {
        s.players[humanIdx]!.fans += result.finalState.players.A.fans
      }

      // Simulate other bots (those not in this match).
      for (let i = 0; i < s.players.length; i++) {
        const p = s.players[i]!
        if (p.isHuman) continue
        if (p.id === s.currentOpponentId) continue
        const robot = ROBOTS.find((r) => r.id === p.id)
        p.fans += simulateBotFans(s.round, robot?.tier ?? 1)
      }

      // Instant-win check (fan gap ≥ 11).
      if (isInstantWin(s.players)) {
        s.finished = true
        return
      }

      // Grow every robot's deck with round picks (they simulate a draft too).
      for (const r of ROBOTS) {
        const picks = robotPicksForRound(r, s.round, s.currentSeed ^ 0xC0FFEE)
        s.robotDecks[r.id] = [...(s.robotDecks[r.id] ?? r.makeDeck()), ...picks]
      }

      // Advance round or enter final.
      if (s.round >= TOTAL_ROUNDS) {
        // Check if human is in final.
        if (humanInFinal(s.players)) {
          const fs = finalists(s.players)!
          const opponent = fs.find((p) => !p.isHuman)!
          s.inFinal = true
          s.finalOpponentName = opponent.name
          s.currentOpponentId = opponent.id
          s.currentSeed = (Math.random() * 0xffffffff) >>> 0
        } else {
          s.finished = true
        }
      } else {
        s.round += 1
        const next = opponentForRound(s.round, ROBOTS)
        s.currentOpponentId = next.id
        s.currentSeed = (Math.random() * 0xffffffff) >>> 0
      }
    }),

    finishFinal: (result) => set((s) => {
      s.lastMatchResult = result
      const humanIdx = s.players.findIndex((p) => p.isHuman)
      const oppIdx = s.players.findIndex((p) => p.id === s.currentOpponentId)
      const humanWon = result.winner === 'A'
      if (humanWon && humanIdx >= 0) {
        s.players[humanIdx]!.fans += FINAL_TROPHY_FANS
      } else if (!humanWon && oppIdx >= 0) {
        s.players[oppIdx]!.fans += FINAL_TROPHY_FANS
      }
      if (humanIdx >= 0) {
        s.players[humanIdx]!.fans += result.finalState.players.A.fans
      }
      s.inFinal = false
      s.finished = true
    }),

    reset: () => set((s) => {
      s.players = []
      s.round = 1
      s.humanDeck = []
      s.currentOpponentId = null
      s.currentSeed = 0
      s.lastMatchResult = null
      s.finished = false
    }),
  })),
)

/** Helper: recover the human deck after a match ends (all zones merged). */
export function recoverHumanDeck(result: MatchResult): Card[] {
  const A = result.finalState.players.A
  return recoverDeck({
    deck: A.deck,
    flagPile: A.flagPile,
    bench: A.bench.flatMap((s) => s.cards),
    exhaust: A.exhaust,
  })
}
