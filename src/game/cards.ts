/**
 * Card database. Data-driven — a new card is one entry, no code changes.
 *
 * Set breakdown:
 *   basic        — starter S cards + neutral A/B/C mix
 *   corpOps      — set A: corporate soldiers, ally-buff heavy
 *   underground  — set B: hackers + guerrilla, immediate/during-attack burst
 *   neoCitadel   — Castle reskin. Knights + fortress → cyber-defense stack.
 *                  Bench synergy + in-flag reduction backbone.
 *   neonPark     — Funfair reskin. Arcade / holo-entertainment.
 *                  Immediate + flag-loss fan generation (crowd rewards).
 *   ghostNetwork — Haunted House reskin. Dead-code / rogue AI.
 *                  Flag-loss fans + in-flag reduction (haunts what you take).
 *   orbitZero    — Outer Space reskin. Orbital ops.
 *                  Uses `when-picked` triggers (fire once at draft time).
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
        text: '깃발 시: 상대 필요 파워 +1' },
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
        text: '깃발 시: 상대 필요 파워 +2' },
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
        text: '깃발 시: 상대 필요 파워 +1' },
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
        text: '깃발 시: 상대 필요 파워 +2' },
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

  /* ================================================================
     NEO-CITADEL (Castle reskin) — Set C.
     Knights, squires, wizards → cyber-defense stack.
     Bench synergy + in-flag reduction backbone.
     ================================================================ */
  /* ---- Level A ---- */
  {
    id: 'a_squire',
    name: 'CYBER SQUIRE',
    set: 'neoCitadel', level: 'A', basePower: 2, icon: '🛡️',
    effects: [
      { trigger: 'from-bench', body: { kind: 'ally-buff', targetName: 'CHROME KNIGHT', value: 1 },
        text: '벤치의 CHROME KNIGHT 1명당 파워 +1' },
    ],
    flavor: 'Polishes armor plates before every patch cycle.',
  },
  {
    id: 'a_knight',
    name: 'CHROME KNIGHT',
    set: 'neoCitadel', level: 'A', basePower: 3, icon: '🗡️',
    effects: [
      { trigger: 'from-bench', body: { kind: 'ally-buff', targetName: 'CHROME KNIGHT', value: 1 },
        text: '벤치의 다른 CHROME KNIGHT 1명당 파워 +1' },
    ],
  },
  {
    id: 'a_scout',
    name: 'RAMPART SCOUT',
    set: 'neoCitadel', level: 'A', basePower: 2, icon: '🏰',
    effects: [
      { trigger: 'during-attack', body: { kind: 'power-bonus', value: 1 },
        text: '공격 시 파워 +1' },
    ],
  },
  {
    id: 'a_lantern',
    name: 'HOLO LANTERN',
    set: 'neoCitadel', level: 'A', basePower: 1, icon: '🕯️',
    effects: [
      { trigger: 'immediate', body: { kind: 'power-bonus', value: 2 },
        text: '즉시 파워 +2' },
    ],
  },
  {
    id: 'a_herald',
    name: 'ROYAL HERALD',
    set: 'neoCitadel', level: 'A', basePower: 2, icon: '📯',
    effects: [
      { trigger: 'flag-loss', body: { kind: 'gain-fans', value: 1 },
        text: '깃발을 뺏길 때 팬 +1 획득' },
    ],
  },

  /* ---- Level B ---- */
  {
    id: 'b_paladin',
    name: 'NETRON PALADIN',
    set: 'neoCitadel', level: 'B', basePower: 4, icon: '⚔️',
    effects: [
      { trigger: 'from-bench', body: { kind: 'ally-buff', targetName: 'CHROME KNIGHT', value: 1 },
        text: '벤치의 CHROME KNIGHT 1명당 파워 +1' },
    ],
  },
  {
    id: 'b_wizard',
    name: 'CODE WIZARD',
    set: 'neoCitadel', level: 'B', basePower: 3, icon: '🧙',
    effects: [
      { trigger: 'in-flag', body: { kind: 'reduce-opponent', value: 2 },
        text: '깃발 시: 상대 필요 파워 +2' },
    ],
    flavor: 'Compiles hexes into inline assembly.',
  },
  {
    id: 'b_drawbridge',
    name: 'DRAW-BRIDGE OP',
    set: 'neoCitadel', level: 'B', basePower: 4, icon: '⛓️',
    effects: [
      { trigger: 'in-flag', body: { kind: 'reduce-opponent', value: 1 },
        text: '깃발 시: 상대 필요 파워 +1' },
    ],
  },
  {
    id: 'b_catapult',
    name: 'RAIL CATAPULT',
    set: 'neoCitadel', level: 'B', basePower: 5, icon: '🪨',
    effects: [
      { trigger: 'during-attack', body: { kind: 'power-bonus', value: 1 },
        text: '공격 시 파워 +1' },
    ],
  },
  {
    id: 'b_moatdrake',
    name: 'MOAT DRAKE',
    set: 'neoCitadel', level: 'B', basePower: 4, icon: '🐉',
    effects: [
      { trigger: 'flag-loss', body: { kind: 'gain-fans', value: 2 },
        text: '깃발을 뺏길 때 팬 +2 획득' },
    ],
  },

  /* ---- Level C ---- */
  {
    id: 'c_queen',
    name: 'DATA QUEEN',
    set: 'neoCitadel', level: 'C', basePower: 6, icon: '👸',
    effects: [
      { trigger: 'from-bench', body: { kind: 'ally-buff', targetName: 'CHROME KNIGHT', value: 2 },
        text: '벤치의 CHROME KNIGHT 1명당 파워 +2' },
    ],
    flavor: 'Rules from a throne of stacked servers.',
  },
  {
    id: 'c_king',
    name: 'GRID KING',
    set: 'neoCitadel', level: 'C', basePower: 8, icon: '👑',
    effects: [
      { trigger: 'in-flag', body: { kind: 'reduce-opponent', value: 2 },
        text: '깃발 시: 상대 필요 파워 +2' },
    ],
    flavor: 'The uplink is his crown; the network, his kingdom.',
  },
  {
    id: 'c_dragon',
    name: 'CIRCUIT DRAGON',
    set: 'neoCitadel', level: 'C', basePower: 9, icon: '🐲',
    effects: [
      { trigger: 'during-attack', body: { kind: 'power-bonus', value: 1 },
        text: '공격 시 파워 +1' },
      { trigger: 'flag-loss', body: { kind: 'gain-fans', value: 2 },
        text: '깃발을 뺏길 때 팬 +2 획득' },
    ],
  },

  /* ================================================================
     NEON PARK (Funfair reskin) — Set D.
     Arcade / holo-entertainment. Immediate burst + flag-loss fans.
     Crowds love a show, win or lose.
     ================================================================ */
  /* ---- Level A ---- */
  {
    id: 'a_barker',
    name: 'ARCADE BARKER',
    set: 'neonPark', level: 'A', basePower: 2, icon: '🎪',
    effects: [
      { trigger: 'immediate', body: { kind: 'power-bonus', value: 1 },
        text: '즉시 파워 +1' },
    ],
  },
  {
    id: 'a_balloon',
    name: 'BALLOON VENDOR',
    set: 'neonPark', level: 'A', basePower: 1, icon: '🎈',
    effects: [
      { trigger: 'flag-loss', body: { kind: 'gain-fans', value: 2 },
        text: '깃발을 뺏길 때 팬 +2 획득' },
    ],
    flavor: 'Sells hot air. Fans buy it anyway.',
  },
  {
    id: 'a_juggler',
    name: 'HOLO JUGGLER',
    set: 'neonPark', level: 'A', basePower: 2, icon: '🤹',
    effects: [
      { trigger: 'during-attack', body: { kind: 'power-bonus', value: 1 },
        text: '공격 시 파워 +1' },
    ],
  },
  {
    id: 'a_photobot',
    name: 'PHOTO DRONE',
    set: 'neonPark', level: 'A', basePower: 1, icon: '📸',
    effects: [
      { trigger: 'flag-loss', body: { kind: 'gain-fans', value: 1 },
        text: '깃발을 뺏길 때 팬 +1 획득' },
      { trigger: 'immediate', body: { kind: 'power-bonus', value: 1 },
        text: '즉시 파워 +1' },
    ],
  },
  {
    id: 'a_ticket',
    name: 'TICKET SCALPER',
    set: 'neonPark', level: 'A', basePower: 3, icon: '🎟️',
    effects: [],
    flavor: 'Front-row seats to your defeat, half price.',
  },

  /* ---- Level B ---- */
  {
    id: 'b_ferris',
    name: 'FERRIS TOWER',
    set: 'neonPark', level: 'B', basePower: 5, icon: '🎡',
    effects: [
      { trigger: 'flag-loss', body: { kind: 'gain-fans', value: 2 },
        text: '깃발을 뺏길 때 팬 +2 획득' },
    ],
  },
  {
    id: 'b_clown',
    name: 'GLITCH CLOWN',
    set: 'neonPark', level: 'B', basePower: 3, icon: '🤡',
    effects: [
      { trigger: 'immediate', body: { kind: 'power-bonus', value: 2 },
        text: '즉시 파워 +2' },
    ],
  },
  {
    id: 'b_coaster',
    name: 'RAIL COASTER',
    set: 'neonPark', level: 'B', basePower: 4, icon: '🎢',
    effects: [
      { trigger: 'during-attack', body: { kind: 'power-bonus', value: 2 },
        text: '공격 시 파워 +2' },
    ],
  },
  {
    id: 'b_carousel',
    name: 'CAROUSEL CORE',
    set: 'neonPark', level: 'B', basePower: 3, icon: '🎠',
    effects: [
      { trigger: 'from-bench', body: { kind: 'ally-buff', targetName: 'CAROUSEL CORE', value: 2 },
        text: '벤치의 다른 CAROUSEL CORE 1명당 파워 +2' },
    ],
  },
  {
    id: 'b_showhost',
    name: 'SHOW HOST',
    set: 'neonPark', level: 'B', basePower: 3, icon: '🎤',
    effects: [
      { trigger: 'from-bench', body: { kind: 'ally-buff', targetName: 'BALLOON VENDOR', value: 1 },
        text: '벤치의 BALLOON VENDOR 1명당 파워 +1' },
      { trigger: 'flag-loss', body: { kind: 'gain-fans', value: 1 },
        text: '깃발을 뺏길 때 팬 +1 획득' },
    ],
  },

  /* ---- Level C ---- */
  {
    id: 'c_fireworks',
    name: 'FIREWORK FINALE',
    set: 'neonPark', level: 'C', basePower: 5, icon: '🎆',
    effects: [
      { trigger: 'flag-loss', body: { kind: 'gain-fans', value: 4 },
        text: '깃발을 뺏길 때 팬 +4 획득' },
    ],
    flavor: 'Loses the flag with more style than most cards win it.',
  },
  {
    id: 'c_headliner',
    name: 'STAGE HEADLINER',
    set: 'neonPark', level: 'C', basePower: 7, icon: '🎸',
    effects: [
      { trigger: 'immediate', body: { kind: 'power-bonus', value: 2 },
        text: '즉시 파워 +2' },
    ],
  },
  {
    id: 'c_paradebot',
    name: 'PARADE FLOAT',
    set: 'neonPark', level: 'C', basePower: 8, icon: '🎊',
    effects: [
      { trigger: 'from-bench', body: { kind: 'ally-buff', targetName: 'CAROUSEL CORE', value: 2 },
        text: '벤치의 CAROUSEL CORE 1명당 파워 +2' },
    ],
  },

  /* ================================================================
     GHOST NETWORK (Haunted House reskin) — Set E.
     Dead code · rogue AI. Flag-loss fans + in-flag denial.
     What you take from them, haunts you back.
     ================================================================ */
  /* ---- Level A ---- */
  {
    id: 'a_ghosttrace',
    name: 'GHOST TRACE',
    set: 'ghostNetwork', level: 'A', basePower: 1, icon: '👻',
    effects: [
      { trigger: 'flag-loss', body: { kind: 'gain-fans', value: 2 },
        text: '깃발을 뺏길 때 팬 +2 획득' },
    ],
  },
  {
    id: 'a_bonewire',
    name: 'BONE WIRE',
    set: 'ghostNetwork', level: 'A', basePower: 3, icon: '💀',
    effects: [],
  },
  {
    id: 'a_crypt',
    name: 'CRYPT DAEMON',
    set: 'ghostNetwork', level: 'A', basePower: 2, icon: '🕯️',
    effects: [
      { trigger: 'in-flag', body: { kind: 'reduce-opponent', value: 1 },
        text: '깃발 시: 상대 필요 파워 +1' },
    ],
  },
  {
    id: 'a_zombie',
    name: 'ZOMBIE THREAD',
    set: 'ghostNetwork', level: 'A', basePower: 2, icon: '🧟',
    effects: [
      { trigger: 'from-bench', body: { kind: 'ally-buff', targetName: 'ZOMBIE THREAD', value: 1 },
        text: '벤치의 다른 ZOMBIE THREAD 1명당 파워 +1' },
    ],
    flavor: 'Killed a thousand times. Still yields.',
  },
  {
    id: 'a_seance',
    name: 'SEANCE PING',
    set: 'ghostNetwork', level: 'A', basePower: 1, icon: '🔮',
    effects: [
      { trigger: 'immediate', body: { kind: 'power-bonus', value: 1 },
        text: '즉시 파워 +1' },
      { trigger: 'flag-loss', body: { kind: 'gain-fans', value: 1 },
        text: '깃발을 뺏길 때 팬 +1 획득' },
    ],
  },

  /* ---- Level B ---- */
  {
    id: 'b_poltergeist',
    name: 'POLTERGEIST.EXE',
    set: 'ghostNetwork', level: 'B', basePower: 3, icon: '🌀',
    effects: [
      { trigger: 'in-flag', body: { kind: 'reduce-opponent', value: 2 },
        text: '깃발 시: 상대 필요 파워 +2' },
    ],
  },
  {
    id: 'b_reaper',
    name: 'BIT REAPER',
    set: 'ghostNetwork', level: 'B', basePower: 4, icon: '🕸️',
    effects: [
      { trigger: 'during-attack', body: { kind: 'power-bonus', value: 1 },
        text: '공격 시 파워 +1' },
      { trigger: 'flag-loss', body: { kind: 'gain-fans', value: 1 },
        text: '깃발을 뺏길 때 팬 +1 획득' },
    ],
  },
  {
    id: 'b_vampire',
    name: 'CACHE VAMPIRE',
    set: 'ghostNetwork', level: 'B', basePower: 4, icon: '🧛',
    effects: [
      { trigger: 'from-bench', body: { kind: 'ally-buff', targetName: 'ZOMBIE THREAD', value: 2 },
        text: '벤치의 ZOMBIE THREAD 1명당 파워 +2' },
    ],
  },
  {
    id: 'b_ossuary',
    name: 'OSSUARY DRIVE',
    set: 'ghostNetwork', level: 'B', basePower: 5, icon: '🗿',
    effects: [
      { trigger: 'flag-loss', body: { kind: 'gain-fans', value: 2 },
        text: '깃발을 뺏길 때 팬 +2 획득' },
    ],
  },
  {
    id: 'b_wraith',
    name: 'WRAITH SPIDER',
    set: 'ghostNetwork', level: 'B', basePower: 3, icon: '🕷️',
    effects: [
      { trigger: 'in-flag', body: { kind: 'reduce-opponent', value: 1 },
        text: '깃발 시: 상대 필요 파워 +1' },
      { trigger: 'during-attack', body: { kind: 'power-bonus', value: 1 },
        text: '공격 시 파워 +1' },
    ],
  },

  /* ---- Level C ---- */
  {
    id: 'c_lich',
    name: 'LICH KERNEL',
    set: 'ghostNetwork', level: 'C', basePower: 6, icon: '☠️',
    effects: [
      { trigger: 'in-flag', body: { kind: 'reduce-opponent', value: 2 },
        text: '깃발 시: 상대 필요 파워 +2' },
      { trigger: 'flag-loss', body: { kind: 'gain-fans', value: 2 },
        text: '깃발을 뺏길 때 팬 +2 획득' },
    ],
    flavor: 'Boots from cold storage. Refuses to shut down.',
  },
  {
    id: 'c_revenant',
    name: 'REVENANT PROC',
    set: 'ghostNetwork', level: 'C', basePower: 8, icon: '🕯️',
    effects: [
      { trigger: 'flag-loss', body: { kind: 'gain-fans', value: 3 },
        text: '깃발을 뺏길 때 팬 +3 획득' },
    ],
  },
  {
    id: 'c_banshee',
    name: 'BANSHEE BROADCAST',
    set: 'ghostNetwork', level: 'C', basePower: 7, icon: '📢',
    effects: [
      { trigger: 'during-attack', body: { kind: 'power-bonus', value: 2 },
        text: '공격 시 파워 +2' },
    ],
  },

  /* ================================================================
     ORBIT ZERO (Outer Space reskin) — Set F.
     Orbital ops · satellites · deep-space AI.
     Signature mechanic: `when-picked` — fires ONCE at draft time.
     ================================================================ */
  /* ---- Level A ---- */
  {
    id: 'a_orbiter',
    name: 'ORBITER DRONE',
    set: 'orbitZero', level: 'A', basePower: 2, icon: '🛰️',
    effects: [
      { trigger: 'when-picked', body: { kind: 'gain-fans', value: 1 },
        text: '픽할 때 팬 +1 획득' },
    ],
    flavor: 'Broadcasts your name across the outer band the moment you pick it.',
  },
  {
    id: 'a_astrocadet',
    name: 'ASTRO CADET',
    set: 'orbitZero', level: 'A', basePower: 2, icon: '👨‍🚀',
    effects: [
      { trigger: 'from-bench', body: { kind: 'ally-buff', targetName: 'ASTRO CADET', value: 1 },
        text: '벤치의 다른 ASTRO CADET 1명당 파워 +1' },
    ],
  },
  {
    id: 'a_meteor',
    name: 'METEOR SLUG',
    set: 'orbitZero', level: 'A', basePower: 3, icon: '☄️',
    effects: [],
  },
  {
    id: 'a_pulsar',
    name: 'PULSAR PING',
    set: 'orbitZero', level: 'A', basePower: 1, icon: '📡',
    effects: [
      { trigger: 'when-picked', body: { kind: 'gain-fans', value: 2 },
        text: '픽할 때 팬 +2 획득' },
    ],
  },
  {
    id: 'a_solar',
    name: 'SOLAR FLARE',
    set: 'orbitZero', level: 'A', basePower: 1, icon: '☀️',
    effects: [
      { trigger: 'immediate', body: { kind: 'power-bonus', value: 2 },
        text: '즉시 파워 +2' },
    ],
  },

  /* ---- Level B ---- */
  {
    id: 'b_satellite',
    name: 'GEO SATELLITE',
    set: 'orbitZero', level: 'B', basePower: 4, icon: '🛰️',
    effects: [
      { trigger: 'when-picked', body: { kind: 'gain-fans', value: 2 },
        text: '픽할 때 팬 +2 획득' },
    ],
  },
  {
    id: 'b_cosmonaut',
    name: 'COSMONAUT',
    set: 'orbitZero', level: 'B', basePower: 4, icon: '🚀',
    effects: [
      { trigger: 'during-attack', body: { kind: 'power-bonus', value: 1 },
        text: '공격 시 파워 +1' },
      { trigger: 'from-bench', body: { kind: 'ally-buff', targetName: 'ASTRO CADET', value: 1 },
        text: '벤치의 ASTRO CADET 1명당 파워 +1' },
    ],
  },
  {
    id: 'b_blackhole',
    name: 'BLACK HOLE',
    set: 'orbitZero', level: 'B', basePower: 3, icon: '🕳️',
    effects: [
      { trigger: 'in-flag', body: { kind: 'reduce-opponent', value: 2 },
        text: '깃발 시: 상대 필요 파워 +2' },
    ],
  },
  {
    id: 'b_novacore',
    name: 'NOVA CORE',
    set: 'orbitZero', level: 'B', basePower: 3, icon: '💫',
    effects: [
      { trigger: 'immediate', body: { kind: 'power-bonus', value: 2 },
        text: '즉시 파워 +2' },
    ],
  },

  /* ---- Level C ---- */
  {
    id: 'c_stationprime',
    name: 'STATION PRIME',
    set: 'orbitZero', level: 'C', basePower: 6, icon: '🛸',
    effects: [
      { trigger: 'when-picked', body: { kind: 'gain-fans', value: 3 },
        text: '픽할 때 팬 +3 획득' },
      { trigger: 'from-bench', body: { kind: 'ally-buff', targetName: 'ASTRO CADET', value: 2 },
        text: '벤치의 ASTRO CADET 1명당 파워 +2' },
    ],
    flavor: 'Signs a broadcast deal the moment you dock.',
  },
  {
    id: 'c_supernova',
    name: 'SUPERNOVA',
    set: 'orbitZero', level: 'C', basePower: 9, icon: '🌟',
    effects: [
      { trigger: 'immediate', body: { kind: 'power-bonus', value: 1 },
        text: '즉시 파워 +1' },
    ],
  },
  {
    id: 'c_singularity',
    name: 'SINGULARITY.AI',
    set: 'orbitZero', level: 'C', basePower: 7, icon: '🌌',
    effects: [
      { trigger: 'in-flag', body: { kind: 'reduce-opponent', value: 2 },
        text: '깃발 시: 상대 필요 파워 +2' },
      { trigger: 'flag-loss', body: { kind: 'gain-fans', value: 2 },
        text: '깃발을 뺏길 때 팬 +2 획득' },
    ],
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
