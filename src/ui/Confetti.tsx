import { useMemo } from 'react'
import { motion } from 'framer-motion'

/**
 * Neon confetti burst. Pure CSS particles — no library.
 * Renders `count` shards falling from top with random x + rotation.
 */
export function Confetti({ count = 40 }: { count?: number }) {
  const shards = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const colors = ['#00e5ff', '#ff2bd6', '#ffe600', '#22ff88', '#66f0ff']
      return {
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        duration: 2.5 + Math.random() * 2,
        rotate: Math.random() * 720 - 360,
        color: colors[Math.floor(Math.random() * colors.length)]!,
        size: 6 + Math.random() * 10,
      }
    })
  }, [count])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {shards.map((s) => (
        <motion.div
          key={s.id}
          initial={{ y: -20, x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: '110vh', rotate: s.rotate, opacity: 0 }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            ease: 'easeIn',
          }}
          style={{
            position: 'absolute',
            top: '-2%',
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size * 0.4}px`,
            background: s.color,
            boxShadow: `0 0 6px ${s.color}, 0 0 12px ${s.color}`,
          }}
        />
      ))}
    </div>
  )
}
