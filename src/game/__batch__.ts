/**
 * Batch simulation — runs many robot-vs-robot matches and prints a
 * balance report. Used for MVP tuning (M8) before card content is frozen.
 *
 * Run with:  npx tsx src/game/__batch__.ts [N]
 *   N = matches per pairing, default 200.
 *
 * Not shipped in the build. Not covered by tests (invoked manually).
 */

import { ROBOTS } from './robots.ts'
import { simulateMatch } from './match.ts'

const N = Math.max(1, Number(process.argv[2]) || 200)

type Cell = { winsA: number; winsB: number; overflow: number; exhaust: number }

// robots × robots matrix; each cell = A-side vs B-side results.
const matrix: Record<string, Record<string, Cell>> = {}
for (const a of ROBOTS) {
  matrix[a.id] = {}
  for (const b of ROBOTS) {
    matrix[a.id]![b.id] = { winsA: 0, winsB: 0, overflow: 0, exhaust: 0 }
  }
}

const startAt = performance.now()
let totalMatches = 0

for (const a of ROBOTS) {
  const deckA = a.makeDeck()
  for (const b of ROBOTS) {
    if (a.id === b.id) continue // skip mirrors — no info gain here
    const deckB = b.makeDeck()
    const cell = matrix[a.id]![b.id]!
    for (let seed = 1; seed <= N; seed++) {
      const r = simulateMatch(deckA, deckB, seed, { firstPlayer: 'A' })
      if (r.winner === 'A') cell.winsA++
      else cell.winsB++
      if (r.reason === 'bench-overflow') cell.overflow++
      else cell.exhaust++
      totalMatches++
    }
  }
}

const elapsedMs = performance.now() - startAt

console.log(`\n=== BATCH REPORT · ${N} matches/pairing · ${totalMatches} total · ${elapsedMs.toFixed(0)}ms ===\n`)

// Table headers.
const pad = (s: string, n: number) => s.padEnd(n, ' ')
const cell = (v: number, w: number = 6) => v.toFixed(1).padStart(w, ' ')

// Row header
process.stdout.write(pad('A→B \\ B', 12))
for (const b of ROBOTS) process.stdout.write(pad(b.name, 12))
process.stdout.write(pad('AVG', 10) + '\n')

// Per-row winrate as attacker-side (A).
const overallWinrate: Record<string, number> = {}
for (const a of ROBOTS) {
  process.stdout.write(pad(a.name, 12))
  let sum = 0
  let matches = 0
  for (const b of ROBOTS) {
    if (a.id === b.id) {
      process.stdout.write(pad('  —', 12))
      continue
    }
    const c = matrix[a.id]![b.id]!
    const wr = (c.winsA / (c.winsA + c.winsB)) * 100
    sum += wr
    matches++
    const marker = wr > 60 ? '▲' : wr < 40 ? '▽' : ' '
    process.stdout.write(pad(`${marker}${cell(wr)}%`, 12))
  }
  const avg = matches > 0 ? sum / matches : 0
  overallWinrate[a.id] = avg
  process.stdout.write(pad(`${cell(avg)}%`, 10) + '\n')
}

console.log('\n=== RANKING (avg winrate as A-side, higher = stronger) ===\n')
const ranked = [...ROBOTS].sort((a, b) => (overallWinrate[b.id]! - overallWinrate[a.id]!))
for (let i = 0; i < ranked.length; i++) {
  const r = ranked[i]!
  const wr = overallWinrate[r.id]!
  const tierMark = r.tier <= 2 ? '' : r.tier === 3 ? '  ●' : r.tier === 4 ? '  ●●' : '  ●●●'
  console.log(`  ${i + 1}. ${pad(r.name, 12)} · avg ${wr.toFixed(1)}%   tier ${r.tier}${tierMark}`)
}

// End reason distribution.
let totalOverflow = 0
let totalExhaust = 0
for (const a of ROBOTS) {
  for (const b of ROBOTS) {
    if (a.id === b.id) continue
    totalOverflow += matrix[a.id]![b.id]!.overflow
    totalExhaust += matrix[a.id]![b.id]!.exhaust
  }
}
console.log('\n=== END REASON DISTRIBUTION ===\n')
console.log(`  attacker-empty-deck: ${totalExhaust} (${(totalExhaust / totalMatches * 100).toFixed(1)}%)`)
console.log(`  bench-overflow:       ${totalOverflow} (${(totalOverflow / totalMatches * 100).toFixed(1)}%)`)
console.log()
