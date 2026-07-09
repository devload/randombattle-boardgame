import { motion } from 'framer-motion'

/**
 * Attacker-power progress bar. Fills cyan while under target, flips to
 * gold and adds a sparkle at the leading edge once breach threshold is met.
 */
export function PowerBar({ current, target }: { current: number; target: number }) {
  const pct = target === 0 ? 0 : Math.min(100, (current / target) * 100)
  const breached = current >= target && target > 0
  return (
    <div className="relative w-full h-2.5 rounded-sm bg-black/60 border border-arena-lineDim overflow-hidden">
      {/* Fill */}
      <motion.div
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', damping: 22, stiffness: 220 }}
        className={`absolute inset-y-0 left-0 rounded-sm ${breached ? 'bg-neon-gold' : 'bg-neon-cyan'}`}
        style={{
          boxShadow: breached
            ? '0 0 12px rgba(255,216,77,0.75), 0 0 24px rgba(255,216,77,0.35)'
            : '0 0 10px rgba(34,233,255,0.6)',
        }}
      />

      {/* Breach flash overlay */}
      {breached && (
        <motion.div
          initial={{ opacity: 0.85 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.9, repeat: Infinity }}
          className="absolute inset-0 bg-neon-gold pointer-events-none"
        />
      )}

      {/* Leading-edge sparkle when filled */}
      {pct > 0 && (
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-y-0 w-1 rounded-sm pointer-events-none"
          style={{
            left: `calc(${pct}% - 4px)`,
            background: breached ? '#ffd84d' : '#ffffff',
            boxShadow: breached ? '0 0 10px #ffd84d' : '0 0 8px #ffffff',
          }}
        />
      )}
    </div>
  )
}
