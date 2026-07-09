import { describe, it, expect } from 'vitest'
import { addToBench, benchCountByName, benchDistinctCount, benchAllCards } from './bench.ts'
import { cardById } from './cards.ts'

describe('bench rules', () => {
  it('adds a single card to empty bench', () => {
    const { bench, overflow } = addToBench([], [cardById('s_grunt')])
    expect(bench.length).toBe(1)
    expect(overflow).toBe(false)
  })

  it('stacks cards with the same name', () => {
    const first = addToBench([], [cardById('s_grunt')])
    const second = addToBench(first.bench, [cardById('s_grunt')])
    expect(second.bench.length).toBe(1)
    expect(second.bench[0]!.cards.length).toBe(2)
    expect(second.overflow).toBe(false)
  })

  it('distinct names use separate slots', () => {
    const step1 = addToBench([], [cardById('s_grunt')])
    const step2 = addToBench(step1.bench, [cardById('a_ghost')])
    expect(step2.bench.length).toBe(2)
  })

  it('allows 6 distinct names', () => {
    const cards = [
      cardById('s_grunt'),
      cardById('s_runner'),
      cardById('a_ghost'),
      cardById('a_stim'),
      cardById('a_blade'),
      cardById('b_synth'),
    ]
    const { bench, overflow } = addToBench([], cards)
    expect(bench.length).toBe(6)
    expect(overflow).toBe(false)
  })

  it('overflows on 7th distinct name', () => {
    const six = [
      cardById('s_grunt'),
      cardById('s_runner'),
      cardById('a_ghost'),
      cardById('a_stim'),
      cardById('a_blade'),
      cardById('b_synth'),
    ]
    const filled = addToBench([], six)
    expect(filled.overflow).toBe(false)
    const seventh = addToBench(filled.bench, [cardById('b_overclock')])
    expect(seventh.overflow).toBe(true)
    expect(seventh.bench.length).toBe(7) // placed anyway; caller decides
  })

  it('does NOT overflow when stacking a 7th copy of an existing name', () => {
    const six = [
      cardById('s_grunt'),
      cardById('s_runner'),
      cardById('a_ghost'),
      cardById('a_stim'),
      cardById('a_blade'),
      cardById('b_synth'),
    ]
    const filled = addToBench([], six)
    const stack = addToBench(filled.bench, [cardById('s_grunt')])
    expect(stack.overflow).toBe(false)
    expect(stack.bench.length).toBe(6)
    expect(stack.bench[0]!.cards.length).toBe(2)
  })

  it('benchCountByName returns copies of a specific card', () => {
    const b = addToBench([], [cardById('b_synth'), cardById('b_synth'), cardById('s_grunt')]).bench
    expect(benchCountByName(b, 'SYNTH GUARD')).toBe(2)
    expect(benchCountByName(b, 'STREET GRUNT')).toBe(1)
    expect(benchCountByName(b, 'MISSING')).toBe(0)
  })

  it('benchDistinctCount matches stack length', () => {
    const b = addToBench([], [cardById('s_grunt'), cardById('a_ghost')]).bench
    expect(benchDistinctCount(b)).toBe(2)
  })

  it('benchAllCards flattens preserving copies', () => {
    const b = addToBench([], [cardById('s_grunt'), cardById('s_grunt'), cardById('a_ghost')]).bench
    expect(benchAllCards(b).length).toBe(3)
  })

  it('addToBench is immutable (does not mutate input)', () => {
    const original: never[] = []
    addToBench(original, [cardById('s_grunt')])
    expect(original.length).toBe(0)
  })
})
