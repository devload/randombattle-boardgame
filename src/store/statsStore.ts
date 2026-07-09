import { create } from 'zustand'

/**
 * Persistent player stats stored in LocalStorage.
 *
 * We keep it simple — just totals + per-bot championship count.
 */

const KEY = 'rb.stats.v1'

export type Stats = {
  totalTournaments: number
  totalMatchesWon: number
  totalMatchesLost: number
  championships: number
  bestFans: number       // highest fan total ever achieved
  totalPlaytimeSec: number
  lastPlayedAt: string | null
}

const initial: Stats = {
  totalTournaments: 0,
  totalMatchesWon: 0,
  totalMatchesLost: 0,
  championships: 0,
  bestFans: 0,
  totalPlaytimeSec: 0,
  lastPlayedAt: null,
}

function load(): Stats {
  if (typeof window === 'undefined') return initial
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return initial
    const parsed = JSON.parse(raw) as Partial<Stats>
    return { ...initial, ...parsed }
  } catch {
    return initial
  }
}

function save(stats: Stats) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY, JSON.stringify(stats))
  } catch { /* ignore quota errors */ }
}

type StatsStore = Stats & {
  recordTournamentStart: () => void
  recordMatchResult: (won: boolean) => void
  recordChampionship: (fans: number) => void
  addPlaytime: (seconds: number) => void
  resetStats: () => void
}

export const useStats = create<StatsStore>((set, get) => ({
  ...load(),
  recordTournamentStart: () => {
    const next = { ...get(), totalTournaments: get().totalTournaments + 1, lastPlayedAt: new Date().toISOString() }
    save(next)
    set(next)
  },
  recordMatchResult: (won) => {
    const next = {
      ...get(),
      totalMatchesWon: get().totalMatchesWon + (won ? 1 : 0),
      totalMatchesLost: get().totalMatchesLost + (won ? 0 : 1),
    }
    save(next)
    set(next)
  },
  recordChampionship: (fans) => {
    const next = {
      ...get(),
      championships: get().championships + 1,
      bestFans: Math.max(get().bestFans, fans),
    }
    save(next)
    set(next)
  },
  addPlaytime: (seconds) => {
    const next = { ...get(), totalPlaytimeSec: get().totalPlaytimeSec + seconds }
    save(next)
    set(next)
  },
  resetStats: () => {
    save(initial)
    set(initial)
  },
}))

/** Convenience: winrate %, or null if no matches yet. */
export function winratePct(s: Pick<Stats, 'totalMatchesWon' | 'totalMatchesLost'>): number | null {
  const total = s.totalMatchesWon + s.totalMatchesLost
  if (total === 0) return null
  return Math.round((s.totalMatchesWon / total) * 100)
}
