import { useMemo } from 'react'
import { motion } from 'framer-motion'

/**
 * Radial particle burst. Renders shards flying outward from center once.
 * Different from Confetti (which falls from top) — used for hit impacts.
 */
export function Burst({
  colors = ['#00e5ff', '#ff2bd6', '#ffe600'],
  count = 24,
  radius = 180,
  keyId,
}: {
  colors?: string[]
  count?: number
  radius?: number
  keyId?: string | number
}) {
  const shards = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3
      const dist = radius * (0.6 + Math.random() * 0.5)
      const color = colors[Math.floor(Math.random() * colors.length)]!
      return {
        id: i,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        color,
        size: 4 + Math.random() * 6,
        duration: 0.6 + Math.random() * 0.5,
      }
    })
  }, [colors, count, radius, keyId])

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
      {shards.map((s) => (
        <motion.div
          key={s.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: s.x, y: s.y, opacity: 0, scale: 0.4 }}
          transition={{ duration: s.duration, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: `${s.size}px`,
            height: `${s.size * 0.5}px`,
            background: s.color,
            boxShadow: `0 0 8px ${s.color}, 0 0 16px ${s.color}`,
            borderRadius: '2px',
          }}
        />
      ))}
    </div>
  )
}
