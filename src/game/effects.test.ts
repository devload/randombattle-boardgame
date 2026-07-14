import { describe, it, expect } from 'vitest'
import { attackerCardPower, flagCardPower, flagPilePower, attackRevealPower, benchAllyBonus, flagInFlagBonus, whenPickedFanGains } from './effects.ts'
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
  it('EXEC.AI adds +1 to defender flag power while in flag (attacker needs +1 more)', () => {
    expect(flagInFlagBonus([cardById('b_execAI')])).toBe(1)
  })

  it('non-EXEC-AI cards contribute zero', () => {
    expect(flagInFlagBonus([cardById('a_ghost')])).toBe(0)
  })

  it('GRID KING (neoCitadel) contributes +2 in-flag', () => {
    expect(flagInFlagBonus([cardById('c_king')])).toBe(2)
  })

  it('LICH KERNEL (ghostNetwork) stacks with other in-flag cards', () => {
    // LICH KERNEL +2 + POLTERGEIST +2 = 4
    expect(flagInFlagBonus([cardById('c_lich'), cardById('b_poltergeist')])).toBe(4)
  })
})

describe('effects · new set signature cards', () => {
  it('CHROME KNIGHT stack: 3 knights → each gets +2 from bench synergy', () => {
    // 3 knights on bench. Each has from-bench +1 per OTHER knight → 2 others → +2 each.
    // Total bonus: 3 × 2 = 6.
    const bench = addToBench(
      [],
      [cardById('a_knight'), cardById('a_knight'), cardById('a_knight')],
    ).bench
    expect(benchAllyBonus(bench)).toBe(6)
  })

  it('DATA QUEEN + 2 CHROME KNIGHTs → queen gives +2 per knight (=4), knights self-buff +1 each', () => {
    // Queen: from-bench +2 per knight → 2 knights → +4
    // Each knight: from-bench +1 per OTHER knight → 1 other → +1 × 2 = +2
    // Total: 4 + 2 = 6.
    const bench = addToBench(
      [],
      [cardById('c_queen'), cardById('a_knight'), cardById('a_knight')],
    ).bench
    expect(benchAllyBonus(bench)).toBe(6)
  })

  it('HOLO LANTERN base 1 + immediate +2 = 3 attacker power', () => {
    expect(attackerCardPower(cardById('a_lantern'))).toBe(3)
  })

  it('SOLAR FLARE base 1 + immediate +2 = 3 attacker power', () => {
    expect(attackerCardPower(cardById('a_solar'))).toBe(3)
  })

  it('FIREWORK FINALE flag-loss grants 4 fans (biggest single flag-loss reward)', () => {
    const c = cardById('c_fireworks')
    const flagLoss = c.effects.find((e) => e.trigger === 'flag-loss')
    expect(flagLoss).toBeDefined()
    expect(flagLoss!.body.kind).toBe('gain-fans')
    if (flagLoss && flagLoss.body.kind === 'gain-fans') {
      expect(flagLoss.body.value).toBe(4)
    }
  })

  it('BLACK HOLE contributes +2 in-flag defense', () => {
    expect(flagInFlagBonus([cardById('b_blackhole')])).toBe(2)
  })

  it('CACHE VAMPIRE (ghostNetwork) synergizes with ZOMBIE THREAD via from-bench', () => {
    // Vampire on bench + 2 zombies → vampire grants +2 per zombie = +4.
    // Zombies: from-bench +1 per OTHER zombie → 1 each → +1 × 2 = +2.
    // Total: 6.
    const bench = addToBench(
      [],
      [cardById('b_vampire'), cardById('a_zombie'), cardById('a_zombie')],
    ).bench
    expect(benchAllyBonus(bench)).toBe(6)
  })

  it('COSMONAUT (orbitZero) buffs from ASTRO CADET allies', () => {
    // Cosmonaut on bench + 2 astro cadets:
    // Cosmonaut: from-bench +1 per cadet → 2 → +2.
    // Each cadet: from-bench +1 per OTHER cadet → 1 → +1 × 2 = +2.
    // Total: 4.
    const bench = addToBench(
      [],
      [cardById('b_cosmonaut'), cardById('a_astrocadet'), cardById('a_astrocadet')],
    ).bench
    expect(benchAllyBonus(bench)).toBe(4)
  })
})

describe('effects · whenPickedFanGains', () => {
  it('empty picks yield zero fans', () => {
    expect(whenPickedFanGains([])).toEqual({ total: 0, gains: [] })
  })

  it('picks without when-picked yield zero', () => {
    const r = whenPickedFanGains([cardById('s_grunt'), cardById('a_ghost')])
    expect(r.total).toBe(0)
    expect(r.gains).toEqual([])
  })

  it('ORBITER DRONE fires +1 when picked', () => {
    const r = whenPickedFanGains([cardById('a_orbiter')])
    expect(r.total).toBe(1)
    expect(r.gains).toHaveLength(1)
    expect(r.gains[0]!.card.id).toBe('a_orbiter')
    expect(r.gains[0]!.fans).toBe(1)
  })

  it('PULSAR PING fires +2 when picked', () => {
    expect(whenPickedFanGains([cardById('a_pulsar')]).total).toBe(2)
  })

  it('STATION PRIME fires +3 when picked (and its from-bench effect is inert here)', () => {
    expect(whenPickedFanGains([cardById('c_stationprime')]).total).toBe(3)
  })

  it('multiple picks sum: ORBITER + PULSAR + GEO SATELLITE = 1+2+2 = 5', () => {
    const r = whenPickedFanGains([
      cardById('a_orbiter'),
      cardById('a_pulsar'),
      cardById('b_satellite'),
    ])
    expect(r.total).toBe(5)
    expect(r.gains).toHaveLength(3)
  })

  it('mixing when-picked and non-when-picked cards still aggregates correctly', () => {
    const r = whenPickedFanGains([
      cardById('a_orbiter'),
      cardById('a_ghost'),      // no when-picked
      cardById('c_stationprime'),
    ])
    expect(r.total).toBe(4)
    expect(r.gains).toHaveLength(2)
  })
})
