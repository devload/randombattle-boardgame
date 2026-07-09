import { motion } from 'framer-motion'

/**
 * Progress bar showing how close the attacker's power is to breaching
 * the flag. Fills cyan and flashes yellow at 100%.
 */
export function PowerBar({ current, target }: { current: number; target: number }) {
  const pct = target === 0 ? 0 : Math.min(100, (current / target) * 100)
  const breached = current >= target && target > 0
  return (
    <div className="relative w-full h-2 rounded-sm bg-black/60 border border-arena-lineDim overflow-hidden">
      <motion.div
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', damping: 22, stiffness: 220 }}
        className={`h-full rounded-sm
                    ${breached ? 'bg-neon-yellow' : 'bg-neon-cyan'}`}
        style={{
          boxShadow: breached
            ? '0 0 10px rgba(255,230,0,0.7)'
            : '0 0 8px rgba(0,229,255,0.5)',
        }}
      />
      {breached && (
        <motion.div
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="absolute inset-0 bg-neon-yellow"
        />
      )}
    </div>
  )
}
