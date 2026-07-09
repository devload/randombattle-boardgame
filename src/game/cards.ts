/**
 * Card database. Data-driven — a new card is one entry, no code changes.
 *
 * Set breakdown (M7 expanded scope):
 *   basic       — starter S cards + neutral A/B/C mix
 *   corpOps     — set A: corporate soldiers, ally-buff heavy
 *   underground — set B: hackers + guerrilla, immediate/during-attack burst
 *
 * Power caps (original rules): A ≤ 3, B ≤ 5, C ≤ 10.
 *
 * Design notes:
 *   - Each card exists at most once in the pool per level; duplicates in
 *     a player's deck happen because draft draws with replacement over
 *     round-seeded RNG.
 *   - `power-bonus` values are conservative: total (base + immediate)
 *     stays within the cap so cards feel tuned, not broken.
 *   - `flag-loss` fans are the game's main pity mechanic — even a lost
 *     match can net you 3-5 fans if your C cards were flag holders.
 */

import type { Card } from './types.ts'

export const CARDS: readonly Card[] = [
  /* ================================================================
     BASIC — Starter (S). Every player begins with a mix of these.
     ================================================================ */
  {
    id: 's_grunt',
    name: 'STREET GRUNT',
    set: 'basic', level: 'S', basePower: 1, icon: '👤',
    effects: [],
    flavor: 'Block-corner muscle. Cheap, plentiful, replaceable.',
  },
  {
    id: 's_runner',
    name: 'BLOCK RUNNER',
    set: 'basic', level: 'S', basePower: 2, icon: '🏃',
    effects: [],
  },

  /* ================================================================
     BASIC — Level A (common, cap 3)
     ================================================================ */
  {
    id: 'a_ghost',
    name: 'GHOST RUNNER',
    set: 'basic', level: 'A', basePower: 3, icon: '🥷',
    effects: [
      { trigger: 'during-attack', body: { kind: 'power-bonus', value: 2 },
        text: '공격 시 파워 +2' },
    ],
  },
  {
    id: 'a_stim',
    name: 'STIM PACK',
    set: 'basic', level: 'A', basePower: 2, icon: '💊',
    effects: [
      { trigger: 'immediate', body: { kind: 'power-bonus', value: 1 },
        text: '즉시 파워 +1' },
    ],
  },
  {
    id: 'a_blade',
    name: 'MONO BLADE',
    set: 'basic', level: 'A', basePower: 3, icon: '🗡️',
    effects: [],
  },
  {
    id: 'a_pistol',
    name: 'SLUG PISTOL',
    set: 'basic', level: 'A', basePower: 2, icon: '🔫',
    effects: [
      { trigger: 'immediate', body: { kind: 'power-bonus', value: 1 },
        text: '즉시 파워 +1' },
    ],
  },
  {
    id: 'a_lockpick',
    name: 'ICE PICK',
    set: 'basic', level: 'A', basePower: 1, icon: '🔓',
    effects: [
      { trigger: 'during-attack', body: { kind: 'power-bonus', value: 2 },
        text: '공격 시 파워 +2' },
    ],
  },
  {
    id: 'a_smokebomb',
    name: 'SMOKE BOMB',
    set: 'basic', level: 'A', basePower: 1, icon: '💨',
    effects: [
      { trigger: 'flag-loss', body: { kind: 'gain-fans', value: 1 },
        text: '깃발을 뺏길 때 팬 +1 획득' },
    ],
  },

  /* ================================================================
     BASIC — Level B (rare, cap 5)
     ================================================================ */
  {
    id: 'b_synth',
    name: 'SYNTH GUARD',
    set: 'basic', level: 'B', basePower: 4, icon: '🤖',
    effects: [
      { trigger: 'from-bench', body: { kind: 'ally-buff', targetName: 'SYNTH GUARD', value: 1 },
        text: '벤치의 다른 SYNTH GUARD 1명당 파워 +1' },
    ],
  },
  {
    id: 'b_overclock',
    name: 'OVERCLOCK',
    set: 'basic', level: 'B', basePower: 5, icon: '⚡',
    effects: [
      { trigger: 'during-attack', body: { kind: 'power-bonus', value: 2 },
        text: '공격 시 파워 +2' },
    ],
  },
  {
    id: 'b_railgun',
    name: 'RAIL GUN',
    set: 'basic', level: 'B', basePower: 5, icon: '💥',
    effects: [],
  },
  {
    id: 'b_stealth',
    name: 'STEALTH RIG',
    set: 'basic', level: 'B', basePower: 3, icon: '🕶️',
    effects: [
      { trigger: 'during-attack', body: { kind: 'power-bonus', value: 2 },
        text: '공격 시 파워 +2' },
    ],
  },
  {
    id: 'b_medkit',
    name: 'FIELD MEDIC',
    set: 'basic', level: 'B', basePower: 3, icon: '🩹',
    effects: [
      { trigger: 'flag-loss', body: { kind: 'gain-fans', value: 2 },
        text: '깃발을 뺏길 때 팬 +2 획득' },
    ],
  },

  /* ================================================================
     BASIC — Level C (elite, cap 10)
     ================================================================ */
  {
    id: 'c_daemon',
    name: 'DAEMON.EXE',
    set: 'basic', level: 'C', basePower: 8, icon: '👹',
    effects: [
      { trigger: 'flag-loss', body: { kind: 'gain-fans', value: 3 },
        text: '깃발을 뺏길 때 팬 +3 획득' },
    ],
    flavor: 'Runs in kernel space. Dies loud enough that fans buy tickets.',
  },
  {
    id: 'c_apex',
    name: 'APEX GUARD',
    set: 'basic', level: 'C', basePower: 9, icon: '🛡️',
    effects: [],
  },
  {
    id: 'c_titan',
    name: 'TITAN FRAME',
    set: 'basic', level: 'C', basePower: 7, icon: '🦾',
    effects: [
      { trigger: 'during-attack', body: { kind: 'power-bonus', value: 2 },
        text: '공격 시 파워 +2' },
    ],
  },

  /* ================================================================
     CORP OPS — Set A. Corporate soldiers, ally-buff heavy.
     ================================================================ */
  {
    id: 'a_corpsec',
    name: 'CORP SEC',
    set: 'corpOps', level: 'A', basePower: 2, icon: '💼',
    effects: [
      { trigger: 'from-bench', body: { kind: 'ally-buff', targetName: 'CORP SEC', value: 1 },
        text: '벤치의 다른 CORP SEC 1명당 파워 +1' },
    ],
  },
  {
    id: 'a_lawyer',
    name: 'CORP LAWYER',
    set: 'corpOps', level: 'A', basePower: 2, icon: '📎',
    effects: [
      { trigger: 'flag-loss', body: { kind: 'gain-fans', value: 1 },
        text: '깃발을 뺏길 때 팬 +1 획득' },
    ],
  },
  {
    id: 'a_intern',
    name: 'INTERN',
    set: 'corpOps', level: 'A', basePower: 1, icon: '📎',
    effects: [
      { trigger: 'from-bench', body: { kind: 'ally-buff', targetName: 'CORP SEC', value: 1 },
        text: '벤치의 CORP SEC 1명당 파워 +1' },
    ],
  },
  {
    id: 'a_briefcase',
    name: 'BLACK BRIEFCASE',
    set: 'corpOps', level: 'A', basePower: 3, icon: '💼',
    effects: [],
  },
  {
    id: 'a_analyst',
    name: 'DATA ANALYST',
    set: 'corpOps', level: 'A', basePower: 2, icon: '📊',
    effects: [
      { trigger: 'immediate', body: { kind: 'power-bonus', value: 1 },
        text: '즉시 파워 +1' },
    ],
  },

  {
    id: 'b_execAI',
    name: 'EXEC.AI',
    set: 'corpOps', level: 'B', basePower: 3, icon: '🧠',
    effects: [
      { trigger: 'in-flag', body: { kind: 'reduce-opponent', value: 1 },
        text: '깃발 시: 상대의 필요 파워 −1' },
    ],
  },
  {
    id: 'b_bodyguard',
    name: 'BODY GUARD',
    set: 'corpOps', level: 'B', basePower: 4, icon: '🕴️',
    effects: [
      { trigger: 'from-bench', body: { kind: 'ally-buff', targetName: 'BODY GUARD', value: 1 },
        text: '벤치의 다른 BODY GUARD 1명당 파워 +1' },
    ],
  },
  {
    id: 'b_hologram',
    name: 'HOLOGRAM DECOY',
    set: 'corpOps', level: 'B', basePower: 2, icon: '👻',
    effects: [
      { trigger: 'in-flag', body: { kind: 'reduce-opponent', value: 2 },
        text: '깃발 시: 상대의 필요 파워 −2' },
    ],
  },
  {
    id: 'b_droid',
    name: 'SEC DROID',
    set: 'corpOps', level: 'B', basePower: 4, icon: '🤖',
    effects: [
      { trigger: 'during-attack', body: { kind: 'power-bonus', value: 1 },
        text: '공격 시 파워 +1' },
    ],
  },

  {
    id: 'c_megacorp',
    name: 'MEGACORP CEO',
    set: 'corpOps', level: 'C', basePower: 6, icon: '👔',
    effects: [
      { trigger: 'from-bench', body: { kind: 'ally-buff', targetName: 'CORP SEC', value: 2 },
        text: '벤치의 CORP SEC 1명당 파워 +2' },
    ],
    flavor: "Doesn't fight. Owns everyone else who does.",
  },
  {
    id: 'c_boardroom',
    name: 'BOARD MEMBER',
    set: 'corpOps', level: 'C', basePower: 5, icon: '🎩',
    effects: [
      { trigger: 'from-bench', body: { kind: 'ally-buff', targetName: 'EXEC.AI', value: 3 },
        text: '벤치의 EXEC.AI 1명당 파워 +3' },
    ],
  },
  {
    id: 'c_blacksite',
    name: 'BLACKSITE OP',
    set: 'corpOps', level: 'C', basePower: 8, icon: '🎯',
    effects: [
      { trigger: 'flag-loss', body: { kind: 'gain-fans', value: 2 },
        text: '깃발을 뺏길 때 팬 +2 획득' },
    ],
  },

  /* ================================================================
     UNDERGROUND — Set B. Hackers + guerrilla. Immediate/burst.
     ================================================================ */
  {
    id: 'a_hacker',
    name: 'SCRIPT KIDDIE',
    set: 'underground', level: 'A', basePower: 1, icon: '💻',
    effects: [
      { trigger: 'immediate', body: { kind: 'power-bonus', value: 2 },
        text: '즉시 파워 +2' },
    ],
  },
  {
    id: 'a_graffiti',
    name: 'TAG ARTIST',
    set: 'underground', level: 'A', basePower: 2, icon: '🎨',
    effects: [
      { trigger: 'immediate', body: { kind: 'power-bonus', value: 1 },
        text: '즉시 파워 +1' },
    ],
  },
  {
    id: 'a_pirate',
    name: 'DATA PIRATE',
    set: 'underground', level: 'A', basePower: 3, icon: '🏴',
    effects: [],
  },
  {
    id: 'a_signal',
    name: 'SIGNAL JAMMER',
    set: 'underground', level: 'A', basePower: 1, icon: '📡',
    effects: [
      { trigger: 'during-attack', body: { kind: 'power-bonus', value: 2 },
        text: '공격 시 파워 +2' },
    ],
  },
  {
    id: 'a_courier',
    name: 'MOTO COURIER',
    set: 'underground', level: 'A', basePower: 2, icon: '🛵',
    effects: [
      { trigger: 'flag-loss', body: { kind: 'gain-fans', value: 1 },
        text: '깃발을 뺏길 때 팬 +1 획득' },
    ],
  },

  {
    id: 'b_netrunner',
    name: 'NETRUNNER',
    set: 'underground', level: 'B', basePower: 4, icon: '🎧',
    effects: [
      { trigger: 'during-attack', body: { kind: 'power-bonus', value: 1 },
        text: '공격 시 파워 +1' },
    ],
  },
  {
    id: 'b_datajack',
    name: 'DATA JACK',
    set: 'underground', level: 'B', basePower: 4, icon: '🔌',
    effects: [
      { trigger: 'during-attack', body: { kind: 'power-bonus', value: 1 },
        text: '공격 시 파워 +1' },
    ],
  },
  {
    id: 'b_chameleon',
    name: 'CHAMELEON',
    set: 'underground', level: 'B', basePower: 3, icon: '🦎',
    effects: [
      { trigger: 'from-bench', body: { kind: 'ally-buff', targetName: 'SCRIPT KIDDIE', value: 2 },
        text: '벤치의 SCRIPT KIDDIE 1명당 파워 +2' },
    ],
  },
  {
    id: 'b_virus',
    name: 'GHOST VIRUS',
    set: 'underground', level: 'B', basePower: 3, icon: '🦠',
    effects: [
      { trigger: 'in-flag', body: { kind: 'reduce-opponent', value: 1 },
        text: '깃발 시: 상대의 필요 파워 −1' },
    ],
  },
  {
    id: 'b_streetgang',
    name: 'STREET GANG',
    set: 'underground', level: 'B', basePower: 3, icon: '🥊',
    effects: [
      { trigger: 'from-bench', body: { kind: 'ally-buff', targetName: 'STREET GANG', value: 1 },
        text: '벤치의 다른 STREET GANG 1명당 파워 +1' },
    ],
  },

  {
    id: 'c_iceking',
    name: 'ICE KING',
    set: 'underground', level: 'C', basePower: 7, icon: '❄️',
    effects: [
      { trigger: 'flag-loss', body: { kind: 'gain-fans', value: 2 },
        text: '깃발을 뺏길 때 팬 +2 획득' },
    ],
    flavor: 'The ice you cannot melt.',
  },
  {
    id: 'c_glitch',
    name: 'GLITCH ARCHON',
    set: 'underground', level: 'C', basePower: 6, icon: '🌀',
    effects: [
      { trigger: 'in-flag', body: { kind: 'reduce-opponent', value: 2 },
        text: '깃발 시: 상대의 필요 파워 −2' },
    ],
  },
  {
    id: 'c_kraken',
    name: 'KRAKEN.NET',
    set: 'underground', level: 'C', basePower: 8, icon: '🐙',
    effects: [
      { trigger: 'during-attack', body: { kind: 'power-bonus', value: 2 },
        text: '공격 시 파워 +2' },
    ],
    flavor: 'Eight subnets. All hostile.',
  },
] as const

/* ------------------------------------------------------------
   Lookups
   ------------------------------------------------------------ */

const CARD_BY_ID = new Map(CARDS.map((c) => [c.id, c]))

export function cardById(id: string): Card {
  const c = CARD_BY_ID.get(id)
  if (!c) throw new Error(`Unknown card id: ${id}`)
  return c
}

export function cardsByLevel(level: Card['level']): Card[] {
  return CARDS.filter((c) => c.level === level)
}

export function cardsBySet(set: Card['set']): Card[] {
  return CARDS.filter((c) => c.set === set)
}

/** Starter deck: 6 basic S cards (mix of grunt + runner). */
export function makeStarterDeck(): Card[] {
  return [
    cardById('s_grunt'),
    cardById('s_grunt'),
    cardById('s_grunt'),
    cardById('s_runner'),
    cardById('s_runner'),
    cardById('s_runner'),
  ]
}
