import { describe, it, expect } from 'vitest'
import { CARDS, cardById, cardsByLevel, cardsBySet, makeStarterDeck } from './cards.ts'
import { ROBOTS } from './robots.ts'

describe('cards · database integrity', () => {
  it('has 40+ cards total (M7 goal)', () => {
    expect(CARDS.length).toBeGreaterThanOrEqual(40)
  })

  it('every card has a unique id', () => {
    const ids = new Set(CARDS.map((c) => c.id))
    expect(ids.size).toBe(CARDS.length)
  })

  it('power caps respected: A ≤ 3, B ≤ 5, C ≤ 10', () => {
    for (const c of CARDS) {
      if (c.level === 'A') expect(c.basePower).toBeLessThanOrEqual(3)
      if (c.level === 'B') expect(c.basePower).toBeLessThanOrEqual(5)
      if (c.level === 'C') expect(c.basePower).toBeLessThanOrEqual(10)
    }
  })

  it('every effect has a text label', () => {
    for (const c of CARDS) {
      for (const e of c.effects) {
        expect(e.text.length).toBeGreaterThan(0)
      }
    }
  })

  it('every card icon is a non-empty string', () => {
    for (const c of CARDS) {
      expect(c.icon.length).toBeGreaterThan(0)
    }
  })

  it('cardsByLevel returns cards at that level only', () => {
    for (const c of cardsByLevel('A')) expect(c.level).toBe('A')
    for (const c of cardsByLevel('B')) expect(c.level).toBe('B')
    for (const c of cardsByLevel('C')) expect(c.level).toBe('C')
  })

  it('all 3 sets have Level A/B/C cards', () => {
    for (const set of ['basic', 'corpOps', 'underground'] as const) {
      const cards = cardsBySet(set)
      expect(cards.some((c) => c.level === 'A')).toBe(true)
      expect(cards.some((c) => c.level === 'B')).toBe(true)
      expect(cards.some((c) => c.level === 'C')).toBe(true)
    }
  })

  it('makeStarterDeck yields exactly 6 starter cards', () => {
    const d = makeStarterDeck()
    expect(d.length).toBe(6)
    expect(d.every((c) => c.level === 'S')).toBe(true)
  })
})

describe('robots · preset integrity', () => {
  it('has 5 tiered robots (M7 expansion)', () => {
    expect(ROBOTS.length).toBe(5)
  })

  it('tiers cover 1..5', () => {
    const tiers = ROBOTS.map((r) => r.tier).sort()
    expect(tiers).toEqual([1, 2, 3, 4, 5])
  })

  it('every robot deck builds without throwing', () => {
    for (const r of ROBOTS) {
      const deck = r.makeDeck()
      expect(deck.length).toBeGreaterThan(6)
      expect(deck.every((c) => cardById(c.id))).toBe(true)
    }
  })

  it('every robot has a unique id and name', () => {
    const ids = new Set(ROBOTS.map((r) => r.id))
    const names = new Set(ROBOTS.map((r) => r.name))
    expect(ids.size).toBe(ROBOTS.length)
    expect(names.size).toBe(ROBOTS.length)
  })
})
