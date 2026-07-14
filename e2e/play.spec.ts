import { test, expect, type Page, type ConsoleMessage } from '@playwright/test'

/**
 * E2E: play 3 full tournaments (7 rounds + final each) on a mobile portrait
 * viewport. Captures screenshots at every key beat and records console
 * errors/warnings for the final report.
 *
 * The app has no data-testid anchors, so selectors lean on visible text
 * (button labels, scene chips) plus structural queries (grid children,
 * role=button) that are stable enough for this pass.
 */

type Beat =
  | 'lobby'
  | 'tourboard'
  | 'deck-open'
  | 'deck-picked'
  | 'match-mid'
  | 'match-end'
  | 'final'
  | 'result'

type RunNote = { round: number; beat: Beat; note?: string }

// Round-1 pattern here is used for all rounds unless overridden.
type Strategy = {
  name: string
  // Prefer weak (low power) picks from Level A? Otherwise pick strong-first.
  aPreferWeak: boolean
  // On rounds ≥2, choose B pile (×2) vs C pile (×1) when both open.
  preferC: boolean
  // Try one reroll during the first round that offers it.
  useRerollOnce: boolean
  // Try to preferentially pick ORBIT ZERO set cards where offered.
  preferOrbitZero: boolean
}

const CONSOLE_ISSUES: Array<{ round: number; type: string; text: string }> = []

async function skipOnboarding(page: Page) {
  await page.addInitScript(() => {
    try {
      // Fresh state per test: clear any persisted zustand data, then mark
      // onboarding as seen so the tutorial overlay does not block clicks.
      localStorage.clear()
      localStorage.setItem('rb.onboarded.v7', '1')
    } catch { /* ignore */ }
  })
}

async function attachConsoleWatcher(page: Page, roundLabel: () => number) {
  page.on('console', (msg: ConsoleMessage) => {
    const type = msg.type()
    if (type === 'error' || type === 'warning') {
      CONSOLE_ISSUES.push({
        round: roundLabel(),
        type,
        text: msg.text().slice(0, 400),
      })
    }
  })
  page.on('pageerror', (err) => {
    CONSOLE_ISSUES.push({
      round: roundLabel(),
      type: 'pageerror',
      text: (err.message || String(err)).slice(0, 400),
    })
  })
}

async function shot(page: Page, gameNum: number, name: string) {
  const dir = `e2e/screenshots/round-${gameNum}`
  await page.screenshot({ path: `${dir}/${name}.png`, fullPage: false })
}

async function shotFull(page: Page, gameNum: number, name: string) {
  const dir = `e2e/screenshots/round-${gameNum}`
  await page.screenshot({ path: `${dir}/${name}.png`, fullPage: true })
}

/** Wait for a scene by looking for a chip/label unique to it. */
async function waitForScene(page: Page, scene: Beat) {
  switch (scene) {
    case 'lobby':
      await expect(page.getByText(/RANDOM/i).first()).toBeVisible({ timeout: 8_000 })
      break
    case 'tourboard':
      // "TOURNAMENT" heading + "ENTER THE ARENA" cta
      await expect(page.getByText('ENTER THE ARENA →')).toBeVisible({ timeout: 10_000 })
      break
    case 'deck-open':
      // Chip label "DECK PHASE"
      await expect(page.getByText('DECK PHASE').first()).toBeVisible({ timeout: 10_000 })
      break
    case 'match-mid':
      // Chip label "MATCH"
      await expect(page.getByText('MATCH', { exact: true }).first()).toBeVisible({ timeout: 15_000 })
      break
    case 'final':
      await expect(page.getByText('THE FINAL')).toBeVisible({ timeout: 15_000 })
      break
    case 'result':
      // "CHAMPION" or "DEFEATED"
      await expect(page.getByText(/CHAMPION|DEFEATED/)).toBeVisible({ timeout: 15_000 })
      break
    default:
      break
  }
}

/**
 * The Deck-Phase pile grid renders a `grid-cols-3` of card wrappers.
 * Each pick target is the .relative wrapper containing a card box —
 * we click into the card box itself (the innermost .rounded-lg element).
 * We use text/aria fallback via role.
 */
async function pileCards(page: Page) {
  // The three-column grid of pile cards has the "상세" (detail) button
  // as a sibling per card. Use those detail buttons to locate parent wrappers.
  const grid = page.locator('div.grid.grid-cols-3').first()
  await expect(grid).toBeVisible({ timeout: 10_000 })
  // Each card wrapper is a direct child .relative.flex.flex-col.items-center
  const cards = grid.locator(':scope > div.relative')
  return cards
}

async function pickCard(page: Page, cardWrapper: ReturnType<Page['locator']>) {
  // Inside each wrapper the tappable card is the second child (after optional
  // "픽함" badge). It is the div with class rounded-lg + border.
  const inner = cardWrapper.locator('div.rounded-lg.border').first()
  await inner.click({ force: true })
}

async function readCardPower(cardWrapper: ReturnType<Page['locator']>): Promise<number> {
  // Each card shows big Bebas number in its top-left. It's the first
  // .font-display div under the card's rounded-lg container.
  const text = await cardWrapper.locator('div.rounded-lg.border').first()
    .locator('div.font-display').first()
    .innerText()
  const n = parseInt(text.trim(), 10)
  return Number.isFinite(n) ? n : 999
}

async function readCardName(cardWrapper: ReturnType<Page['locator']>): Promise<string> {
  // Bottom name label — the .font-mono.font-bold row inside the card box.
  try {
    const t = await cardWrapper.locator('div.rounded-lg.border').first()
      .locator('div.font-mono.font-bold').first()
      .innerText({ timeout: 500 })
    return t.trim()
  } catch { return '' }
}

/** Set of ORBIT ZERO card names for detection. */
const ORBIT_NAMES = new Set([
  // Level A
  'ORBITER DRONE', 'ASTRO CADET', 'METEOR SLUG', 'PULSAR PING', 'SOLAR FLARE',
  // Level B
  'GEO SATELLITE', 'COSMONAUT', 'BLACK HOLE', 'NOVA CORE',
  // Level C
  'STATION PRIME', 'SUPERNOVA', 'SINGULARITY.AI',
])

async function pickForPile(page: Page, want: number, opts: { aPreferWeak?: boolean; preferOrbit?: boolean }) {
  if (want <= 0) return
  const cards = await pileCards(page)
  const total = await cards.count()
  const infos: Array<{ idx: number; power: number; name: string; orbit: boolean }> = []
  for (let i = 0; i < total; i++) {
    const w = cards.nth(i)
    const power = await readCardPower(w)
    const name = await readCardName(w)
    infos.push({ idx: i, power, name, orbit: ORBIT_NAMES.has(name) })
  }
  let ordered = [...infos]
  if (opts.preferOrbit) {
    ordered.sort((a, b) => (Number(b.orbit) - Number(a.orbit)) || (opts.aPreferWeak ? a.power - b.power : b.power - a.power))
  } else if (opts.aPreferWeak) {
    ordered.sort((a, b) => a.power - b.power)
  } else {
    ordered.sort((a, b) => b.power - a.power)
  }
  const picks = ordered.slice(0, Math.min(want, ordered.length))
  for (const p of picks) {
    await pickCard(page, cards.nth(p.idx))
    // small settle
    await page.waitForTimeout(120)
  }
}

/** Advance from the current pile stage to the next by tapping the CTA. */
async function tapAdvanceIfEnabled(page: Page) {
  // The bottom button becomes bg-holo-gradient once enabled. Text can be
  // "다음 파일 →", "리뷰 →", "덱 정리 →", "전투 시작 →".
  const cta = page.locator('button', {
    hasText: /다음 파일 →|리뷰 →|덱 정리 →|전투 시작 →/,
  }).last()
  await expect(cta).toBeEnabled({ timeout: 5_000 })
  await cta.click()
}

/** Deck-phase: run through all pile stages and enter the match. */
async function runDeckPhase(page: Page, round: number, strategy: Strategy, gameNum: number) {
  await waitForScene(page, 'deck-open')

  await shot(page, gameNum, `r${round}-deck-open`)

  // Pile A
  const budgetA = 2
  await pickForPile(page, budgetA, { aPreferWeak: strategy.aPreferWeak, preferOrbit: strategy.preferOrbitZero })

  // Optional reroll once (only on rounds where we still have it queued)
  if (strategy.useRerollOnce && round === 1) {
    const rerollBtn = page.locator('button', { hasText: /^REROLL$/ }).first()
    if (await rerollBtn.isVisible().catch(() => false)) {
      await rerollBtn.click()
      // Confirm modal
      const confirm = page.locator('button', { hasText: /^reroll$/ })
      await confirm.click()
      strategy.useRerollOnce = false
      await page.waitForTimeout(300)
      await pickForPile(page, budgetA, { aPreferWeak: strategy.aPreferWeak, preferOrbit: strategy.preferOrbitZero })
    }
  }

  await shot(page, gameNum, `r${round}-deck-a-picked`)
  await tapAdvanceIfEnabled(page)

  // Round 2+ may show B or B/C choice; round 5+ definitely shows both -> chooseBC
  if (round >= 2) {
    // Detect chooseBC vs direct pileB
    const chooseBC = page.locator('button', { hasText: /×2 PICKS|×1 PICK/ })
    if (await chooseBC.first().isVisible({ timeout: 1_500 }).catch(() => false)) {
      if (strategy.preferC && round >= 5) {
        await page.locator('button', { hasText: /×1 PICK/ }).click()
      } else {
        await page.locator('button', { hasText: /×2 PICKS/ }).click()
      }
      await page.waitForTimeout(250)
    }
    // Now on pileB or pileC
    // Determine pile budget by inspecting instruction text
    const instr = await page.locator('div.font-display.text-sm').first().innerText().catch(() => '')
    let wantBC = 2
    if (/C 레벨/.test(instr)) wantBC = 1
    await pickForPile(page, wantBC, { aPreferWeak: false, preferOrbit: strategy.preferOrbitZero })
    await shot(page, gameNum, `r${round}-deck-bc-picked`)
    await tapAdvanceIfEnabled(page)
  }

  // Review stage
  await expect(page.getByText('덱 정리 →')).toBeVisible({ timeout: 5_000 })
  await page.locator('button', { hasText: '덱 정리 →' }).click()

  // Trim stage — skip trimming, go straight to battle
  await expect(page.getByText('전투 시작 →')).toBeVisible({ timeout: 5_000 })
  await page.locator('button', { hasText: '전투 시작 →' }).click()
}

/** Wait for the match to complete by watching for VICTORY / DEFEAT text. */
async function playMatchToEnd(page: Page, gameNum: number, round: number) {
  await waitForScene(page, 'match-mid')

  // Take a midgame shot after a few beats
  await page.waitForTimeout(2_500)
  await shot(page, gameNum, `r${round}-match-mid`)

  // Wait until the end modal shows up. The auto-play delays sum to
  // several seconds per event × many events, so allow up to 120s.
  // The CONTINUE button lives inside the end-of-match modal — much more
  // specific than the VICTORY/DEFEAT text (which also renders in the
  // SlashOverlay flash).
  const cont = page.locator('button', { hasText: /^CONTINUE →$/ })
  // Poll for CONTINUE, keeping tab active and bailing out if the app somehow
  // navigates back to lobby (which would be a real bug — surface it clearly).
  const deadline = Date.now() + 120_000
  let seen = false
  while (Date.now() < deadline) {
    if (await cont.isVisible().catch(() => false)) { seen = true; break }
    // Bail out if the app jumped to lobby mid-match — that's a bug, not
    // normal end-of-tournament routing.
    const onLobby = await page.getByText('▶ NEW TOURNAMENT').isVisible({ timeout: 100 }).catch(() => false)
    if (onLobby) {
      await shot(page, gameNum, `r${round}-JUMPED-TO-LOBBY`)
      throw new Error(`R${round} match jumped to LOBBY mid-play — likely demo-boot fallback fired`)
    }
    await page.waitForTimeout(600)
  }
  if (!seen) {
    await shot(page, gameNum, `r${round}-STUCK`)
    const html = await page.locator('body').innerText().catch(() => '(no body text)')
    console.log(`R${round} STUCK body-text:\n${html.slice(0, 800)}`)
    throw new Error(`R${round} CONTINUE button never appeared`)
  }
  await shot(page, gameNum, `r${round}-match-end`)
  await cont.click()
}

async function runGame(page: Page, gameNum: number, strategy: Strategy, resultOut: RunNote[]) {
  await skipOnboarding(page)
  await page.goto('/')

  await waitForScene(page, 'lobby')
  await shot(page, gameNum, 'lobby')
  resultOut.push({ round: 0, beat: 'lobby' })

  await page.locator('button', { hasText: 'NEW TOURNAMENT' }).click()
  await waitForScene(page, 'tourboard')
  await shot(page, gameNum, 'tourboard-r1')
  resultOut.push({ round: 1, beat: 'tourboard' })

  const captureRounds = new Set([1, 3, 5, 7])
  let endedEarly = false
  let playedFinal = false
  let lastPlayedRound = 0
  for (let round = 1; round <= 7; round++) {
    // Enter arena
    await page.locator('button', { hasText: 'ENTER THE ARENA →' }).click()
    await runDeckPhase(page, round, strategy, gameNum)
    resultOut.push({ round, beat: 'deck-picked' })

    await playMatchToEnd(page, gameNum, round)
    resultOut.push({ round, beat: 'match-end' })
    lastPlayedRound = round

    // Poll which scene the app routed to (tourboard / final / result).
    // 11-fan gap instant-win can send us straight to result even mid-tournament.
    await page.waitForTimeout(500)
    const routed = await Promise.race([
      page.getByText('ENTER THE ARENA →').waitFor({ state: 'visible', timeout: 8_000 }).then(() => 'tourboard' as const).catch(() => null),
      page.getByText('THE FINAL').waitFor({ state: 'visible', timeout: 8_000 }).then(() => 'final' as const).catch(() => null),
      page.getByText(/^CHAMPION$|^DEFEATED$/).waitFor({ state: 'visible', timeout: 8_000 }).then(() => 'result' as const).catch(() => null),
    ])

    if (routed === 'result') {
      endedEarly = true
      resultOut.push({ round, beat: 'result', note: `instant-win / defeat by fan gap after R${round}` })
      break
    }
    if (routed === 'final') {
      playedFinal = true
      await shot(page, gameNum, 'final')
      resultOut.push({ round: 8, beat: 'final' })
      await page.locator('button', { hasText: 'FIGHT →' }).click()
      await playMatchToEnd(page, gameNum, 8)
      resultOut.push({ round: 8, beat: 'match-end' })
      break
    }
    if (routed === 'tourboard') {
      if (captureRounds.has(round + 1)) {
        await shot(page, gameNum, `tourboard-r${round + 1}`)
      }
      continue
    }

    // No routing detected — dump a debug shot and fail hard.
    await shot(page, gameNum, `r${round}-post-continue-STUCK`)
    throw new Error(`After R${round} CONTINUE no expected scene became visible`)
  }

  if (!endedEarly && !playedFinal) {
    // After R7 no final and no early end — check whether we landed on final now
    const finalVisible = await page.getByText('THE FINAL').isVisible({ timeout: 3_000 }).catch(() => false)
    if (finalVisible) {
      await shot(page, gameNum, 'final')
      resultOut.push({ round: 8, beat: 'final' })
      await page.locator('button', { hasText: 'FIGHT →' }).click()
      await playMatchToEnd(page, gameNum, 8)
      resultOut.push({ round: 8, beat: 'match-end' })
    }
  }

  await waitForScene(page, 'result')
  await shotFull(page, gameNum, 'result')
  resultOut.push({ round: 9, beat: 'result', note: `finished after R${lastPlayedRound}${playedFinal ? ' + final' : ''}${endedEarly ? ' (early)' : ''}` })
}

test.describe.serial('RandomBattle · 3-game E2E', () => {
  const strategies: Strategy[] = [
    { name: 'weak-A',           aPreferWeak: true,  preferC: false, useRerollOnce: false, preferOrbitZero: false },
    { name: 'strong-C-reroll',  aPreferWeak: false, preferC: true,  useRerollOnce: true,  preferOrbitZero: false },
    { name: 'orbit-zero',       aPreferWeak: false, preferC: false, useRerollOnce: false, preferOrbitZero: true  },
  ]

  for (let i = 0; i < strategies.length; i++) {
    const gameNum = i + 1
    const strat = strategies[i]
    test(`game ${gameNum} · ${strat.name}`, async ({ page }) => {
      const notes: RunNote[] = []
      let curRound = 0
      await attachConsoleWatcher(page, () => curRound)
      try {
        // Rebind console tracker to current round each step
        const notesProxy = new Proxy(notes, {})
        await runGame(page, gameNum, strat, notesProxy)
        // Update curRound to last observed round for post-run errors
        curRound = notes.at(-1)?.round ?? 0
      } finally {
        // Emit a summary line for the reporter
        console.log(`GAME_${gameNum}_NOTES=` + JSON.stringify({
          strategy: strat.name,
          beats: notes,
          consoleIssues: CONSOLE_ISSUES.filter((c) => true),
        }))
      }
    })
  }
})
