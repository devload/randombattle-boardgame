import { useState } from 'react'
import { useUI, type Scene } from '../store/uiStore'

const SCENES: { key: Scene; label: string }[] = [
  { key: 'lobby', label: 'Lobby' },
  { key: 'tourboard', label: 'Tour' },
  { key: 'deck', label: 'Deck' },
  { key: 'match', label: 'Match' },
  { key: 'final', label: 'Final' },
  { key: 'result', label: 'Result' },
]

/**
 * Dev-only scene nav. Bottom-right corner so it never overlaps HUD.
 */
export function SceneSwitcher() {
  const scene = useUI((s) => s.scene)
  const setScene = useUI((s) => s.setScene)
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-2 right-2 z-[60] pointer-events-none pb-safe">
      <div className="pointer-events-auto flex flex-col items-end gap-1">
        {open && (
          <div className="flex flex-col-reverse gap-1 items-end mb-1">
            {SCENES.map((s) => (
              <button
                key={s.key}
                onClick={() => setScene(s.key)}
                className={`text-[9px] tracking-wider px-2 py-1 rounded-full backdrop-blur border transition font-mono
                  ${scene === s.key
                    ? 'bg-neon-cyan/90 text-arena-void border-neon-cyan'
                    : 'bg-black/70 text-white/70 border-white/15 hover:bg-black/90'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-full bg-black/50 text-white/50 text-[10px] px-2 py-0.5 backdrop-blur border border-white/10 hover:bg-black/70 transition font-mono"
          title="Dev scene nav"
          aria-label="Dev nav"
        >
          {open ? '×' : 'dev'}
        </button>
      </div>
    </div>
  )
}
