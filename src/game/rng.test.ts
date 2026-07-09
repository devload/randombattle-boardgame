import { describe, it, expect } from 'vitest'
import { mulberry32, hashSeed, scopedRng, shuffle } from './rng.ts'

describe('rng', () => {
  it('mulberry32 is deterministic — same seed → same sequence', () => {
    const a = mulberry32(1234)
    const b = mulberry32(1234)
    for (let i = 0; i < 20; i++) expect(a()).toBe(b())
  })

  it('mulberry32 different seeds diverge', () => {
    const a = mulberry32(1)
    const b = mulberry32(2)
    let sameCount = 0
    for (let i = 0; i < 20; i++) if (a() === b()) sameCount++
    expect(sameCount).toBeLessThan(3)
  })

  it('hashSeed produces stable hashes for identical strings', () => {
    expect(hashSeed('match:round-3')).toBe(hashSeed('match:round-3'))
    expect(hashSeed('a')).not.toBe(hashSeed('b'))
  })

  it('scopedRng derives distinct streams per scope', () => {
    const attack = scopedRng('root', 'attack')
    const shuffleR = scopedRng('root', 'shuffle')
    let allEqual = true
    for (let i = 0; i < 10; i++) if (attack() !== shuffleR()) allEqual = false
    expect(allEqual).toBe(false)
  })

  it('shuffle is deterministic given the same rng seed', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const out1 = shuffle([...input], mulberry32(99))
    const out2 = shuffle([...input], mulberry32(99))
    expect(out1).toEqual(out2)
  })

  it('shuffle preserves multiset', () => {
    const input = ['a', 'b', 'c', 'd', 'e']
    const out = shuffle([...input], mulberry32(7))
    expect([...out].sort()).toEqual([...input].sort())
    expect(out.length).toBe(input.length)
  })
})
