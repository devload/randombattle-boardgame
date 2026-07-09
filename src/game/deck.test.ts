import { describe, it, expect } from 'vitest'
import { openLevels, draftBudget, drawFromPile, validatePicks, recoverDeck } from './deck.ts'
import { cardById } from './cards.ts'
import { mulberry32 } from './rng.ts'

describe('deck / draft rules', () => {
  it('R1 only opens Level A', () => {
    expect(openLevels(1)).toEqual(['A'])
  })

  it('R2..R4 opens A + B', () => {
    expect(openLevels(2)).toEqual(['A', 'B'])
    expect(openLevels(4)).toEqual(['A', 'B'])
  })

  it('R5..R7 opens A + B + C', () => {
    expect(openLevels(5)).toEqual(['A', 'B', 'C'])
    expect(openLevels(7)).toEqual(['A', 'B', 'C'])
  })

  it('draftBudget R1 has only A picks', () => {
    const b = draftBudget(1)
    expect(b.A).toBe(2)
    expect(b.B).toBe(0)
    expect(b.C).toBe(0)
  })

  it('draftBudget R5+ enables B and C as mutually exclusive', () => {
    const b = draftBudget(5)
    expect(b.A).toBe(2)
    expect(b.B).toBe(2)
    expect(b.C).toBe(1)
    expect(b.bOrC).toBe(true)
  })

  it('drawFromPile returns exactly 5 cards from level A pool', () => {
    const drawn = drawFromPile('A', mulberry32(1), 5)
    expect(drawn.length).toBeLessThanOrEqual(5)
    expect(drawn.every((c) => c.level === 'A')).toBe(true)
  })

  it('drawFromPile is deterministic given the same rng seed', () => {
    const a = drawFromPile('A', mulberry32(42))
    const b = drawFromPile('A', mulberry32(42))
    expect(a.map((c) => c.id)).toEqual(b.map((c) => c.id))
  })

  it('validatePicks accepts 2 A picks on R1', () => {
    const picks = [cardById('a_ghost'), cardById('a_stim')]
    expect(validatePicks(1, picks)).toBeNull()
  })

  it('validatePicks rejects 3 A picks on R1', () => {
    const picks = [cardById('a_ghost'), cardById('a_stim'), cardById('a_blade')]
    expect(validatePicks(1, picks)).toMatch(/Too many Level A/)
  })

  it('validatePicks rejects mixing B + C on R5', () => {
    const picks = [cardById('b_synth'), cardById('c_daemon')]
    expect(validatePicks(5, picks)).toMatch(/Cannot mix/)
  })

  it('validatePicks allows 2 B on R5', () => {
    const picks = [cardById('a_ghost'), cardById('a_stim'), cardById('b_synth'), cardById('b_overclock')]
    expect(validatePicks(5, picks)).toBeNull()
  })

  it('validatePicks allows 1 C on R5 alone', () => {
    const picks = [cardById('a_ghost'), cardById('a_stim'), cardById('c_daemon')]
    expect(validatePicks(5, picks)).toBeNull()
  })

  it('validatePicks rejects starter cards', () => {
    const picks = [cardById('s_grunt')]
    expect(validatePicks(1, picks)).toMatch(/Starter/)
  })

  it('recoverDeck merges all four zones', () => {
    const merged = recoverDeck({
      deck: [cardById('s_grunt')],
      flagPile: [cardById('a_ghost')],
      bench: [cardById('b_synth'), cardById('b_synth')],
      exhaust: [cardById('c_daemon')],
    })
    expect(merged.length).toBe(5)
  })
})
