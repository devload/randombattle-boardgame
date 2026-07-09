import { describe, it, expect } from 'vitest'
import { attackerCardPower, flagCardPower, flagPilePower, attackRevealPower, benchAllyBonus, flagInFlagBonus } from './effects.ts'
import { cardById } from './cards.ts'
import { addToBench } from './bench.ts'

describe('effects · attackerCardPower', () => {
  it('plain starter has only base power', () => {
    expect(attackerCardPower(cardById('s_grunt'))).toBe(1)
  })

  it('immediate power-bonus adds to attacker power', () => {
    // STIM PACK: base 2 + immediate +1 = 3
    expect(attackerCardPower(cardById('a_stim'))).toBe(3)
  })

  it('during-attack power-bonus adds to attacker power', () => {
    // OVERCLOCK: base 5 + during-attack +2 = 7
    expect(attackerCardPower(cardById('b_overclock'))).toBe(7)
    // GHOST RUNNER: base 3 + during-attack +2 = 5
    expect(attackerCardPower(cardById('a_ghost'))).toBe(5)
  })

  it('stacks both immediate and during-attack when a card has both (SCRIPT KIDDIE)', () => {
    // SCRIPT KIDDIE: base 1 + immediate +2 = 3
    expect(attackerCardPower(cardById('a_hacker'))).toBe(3)
  })
})

describe('effects · flagCardPower', () => {
  it('only immediate power-bonus persists in flag possession', () => {
    // STIM PACK in flag: base 2 + immediate +1 = 3
    expect(flagCardPower(cardById('a_stim'))).toBe(3)
    // OVERCLOCK in flag: base 5 only (during-attack does NOT persist)
    expect(flagCardPower(cardById('b_overclock'))).toBe(5)
    // GHOST RUNNER in flag: base 3 only
    expect(flagCardPower(cardById('a_ghost'))).toBe(3)
  })
})

describe('effects · flagPilePower', () => {
  it('sums power of every card in the flag pile', () => {
    const pile = [cardById('a_ghost'), cardById('a_stim')] // 3 + 3 = 6
    expect(flagPilePower(pile)).toBe(6)
  })

  it('empty pile has zero power', () => {
    expect(flagPilePower([])).toBe(0)
  })
})

describe('effects · attackRevealPower', () => {
  it('sums attacker power across revealed cards', () => {
    // OVERCLOCK (7) + GHOST RUNNER (5) = 12
    expect(attackRevealPower([cardById('b_overclock'), cardById('a_ghost')])).toBe(12)
  })
})

describe('effects · benchAllyBonus', () => {
  it('grants +1 per matching ally on the bench for SYNTH GUARD', () => {
    // 2 SYNTH GUARDs on bench: each grants +1 per OTHER SYNTH GUARD.
    // With 2 synths: each contributes 1 → total 2.
    const bench = addToBench([], [cardById('b_synth'), cardById('b_synth')]).bench
    expect(benchAllyBonus(bench)).toBe(2)
  })

  it('single SYNTH GUARD gives no bonus (no "other" ally)', () => {
    const bench = addToBench([], [cardById('b_synth')]).bench
    expect(benchAllyBonus(bench)).toBe(0)
  })

  it('MEGACORP CEO grants +2 per CORP SEC on bench', () => {
    // On bench: 1 megacorp + 2 corpsec.
    // Megacorp's from-bench effect: +2 per CORP SEC. count = 2 → +4.
    // CORP SEC's own from-bench: +1 per OTHER corpsec. Each corpsec sees 1 other → +1 × 2 = +2.
    // Total: 4 + 2 = 6.
    const bench = addToBench([], [cardById('c_megacorp'), cardById('a_corpsec'), cardById('a_corpsec')]).bench
    expect(benchAllyBonus(bench)).toBe(6)
  })

  it('unrelated bench cards contribute zero', () => {
    const bench = addToBench([], [cardById('s_grunt'), cardById('s_runner')]).bench
    expect(benchAllyBonus(bench)).toBe(0)
  })
})

describe('effects · flagInFlagBonus', () => {
  it('EXEC.AI reduces attacker requirement by 1 while in flag', () => {
    expect(flagInFlagBonus([cardById('b_execAI')])).toBe(1)
  })

  it('non-EXEC-AI cards contribute zero', () => {
    expect(flagInFlagBonus([cardById('a_ghost')])).toBe(0)
  })
})
