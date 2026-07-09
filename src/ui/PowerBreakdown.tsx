import { motion, AnimatePresence } from 'framer-motion'
import type { PowerContribution } from '../game/effects'

const TONE: Record<PowerContribution['tone'], { border: string; text: string; glow: string }> = {
  base:           { border: 'border-white/60',    text: 'text-white',       glow: 'rgba(255,255,255,0.5)' },
  immediate:      { border: 'border-neon-yellow', text: 'text-neon-yellow', glow: 'rgba(255,230,0,0.7)' },
  attack:         { border: 'border-neon-cyan',   text: 'text-neon-cyan',   glow: 'rgba(0,229,255,0.7)' },
  'bench-synergy':{ border: 'border-lvl-a',       text: 'text-lvl-a',       glow: 'rgba(34,255,136,0.7)' },
}

/**
 * Sequential power breakdown overlay — sits above the arena in its own
 * layer, NOT attached to a card, so nothing occludes it. Chips slide in
 * one at a time and fade out after their moment.
 */
export function PowerBreakdown({
  contribs, keyId,
}: {
  contribs: PowerContribution[]
  /** Force remount when the reveal target changes. */
  keyId: string | number
}) {
  return (
    <div className="pointer-events-none flex flex-row items-center justify-center flex-wrap gap-1 z-30 relative">
      <AnimatePresence>
        {contribs.map((c, i) => {
          const t = TONE[c.tone]
          const staggerDelay = i * 0.28
          return (
            <motion.div
              key={`${keyId}-${i}`}
              initial={{ opacity: 0, scale: 0.6, y: 8 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.6, 1.15, 1, 0.8],
                y: [8, 0, 0, -6],
              }}
              transition={{
                duration: 1.6,
                delay: staggerDelay,
                times: [0, 0.15, 0.75, 1],
              }}
              className={`inline-flex items-center gap-1 px-2 py-0.5 border rounded-full backdrop-blur-sm
                          bg-arena-void/90 ${t.border} ${t.text}
                          font-mono text-[10px] tracking-wider whitespace-nowrap`}
              style={{ boxShadow: `0 0 10px ${t.glow}` }}
            >
              <span className="font-display font-bold">
                {c.tone === 'base' ? c.value : `+${c.value}`}
              </span>
              <span className="opacity-80">{c.label}</span>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
