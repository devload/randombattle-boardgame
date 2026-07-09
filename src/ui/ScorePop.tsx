import { AnimatePresence, motion } from 'framer-motion'

/**
 * Balatro-style score pop. Fires when the attacker breaches the flag:
 * shows floating "+N FANS" text with a chip explosion vibe, then fades.
 *
 * Positioned by the caller (usually over the arena center).
 */
export function ScorePop({
  value, keyId, tone = 'me',
}: {
  /** Fan delta to display. `null` hides. */
  value: number | null
  /** Unique key so each pop is a fresh element. */
  keyId: number | string
  /** 'me' = cyan (I breached), 'foe' = red (opponent breached). */
  tone?: 'me' | 'foe'
}) {
  const color = tone === 'me' ? '#22e9ff' : '#ff3355'
  const glow = tone === 'me'
    ? 'rgba(34,233,255,0.75)'
    : 'rgba(255,51,85,0.75)'
  return (
    <AnimatePresence>
      {value !== null && (
        <motion.div
          key={keyId}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: -30 }}
          exit={{ opacity: 0, scale: 1.15, y: -60 }}
          transition={{ type: 'spring', damping: 14, stiffness: 240 }}
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40"
        >
          <div className="flex flex-col items-center">
            <div
              className="font-display font-normal text-6xl leading-none tracking-widest"
              style={{
                color,
                textShadow: `0 0 24px ${glow}, 0 0 8px ${glow}`,
              }}
            >
              +{value}
            </div>
            <div
              className="font-mono text-[10px] tracking-[0.3em] mt-1 uppercase"
              style={{ color, opacity: 0.9 }}
            >
              FANS
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
