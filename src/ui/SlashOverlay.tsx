import { motion, AnimatePresence } from 'framer-motion'

export type SlashVariant =
  | 'flag-taken-by-me'    // 내가 상대 깃발 뺏음
  | 'flag-taken-by-foe'   // 상대가 내 깃발 뺏음
  | 'match-win'
  | 'match-lose'
  | 'bench-full-me'       // 내 벤치 오버플로 → 패배
  | 'bench-full-foe'      // 상대 벤치 오버플로 → 승리
  | 'attacker-empty-me'   // 내 덱 소진 → 패배
  | 'attacker-empty-foe'  // 상대 덱 소진 → 승리

const CONTENT: Record<SlashVariant, {
  headline: string
  sub?: string
  color: string
  glow: string
}> = {
  'flag-taken-by-me': {
    headline: '깃발 뺏음!',
    sub: '상대 깃발 획득',
    color: 'text-neon-cyan',
    glow: 'drop-shadow(0 0 20px rgba(0,229,255,0.9))',
  },
  'flag-taken-by-foe': {
    headline: '깃발 뺏김!',
    sub: '내 깃발 상대에게',
    color: 'text-neon-red',
    glow: 'drop-shadow(0 0 20px rgba(255,51,85,0.9))',
  },
  'match-win': {
    headline: '승리!',
    sub: 'VICTORY',
    color: 'text-holo',
    glow: 'drop-shadow(0 0 24px rgba(0,229,255,0.9))',
  },
  'match-lose': {
    headline: '패배',
    sub: 'DEFEAT',
    color: 'text-neon-red',
    glow: 'drop-shadow(0 0 24px rgba(255,51,85,0.9))',
  },
  'bench-full-me': {
    headline: '내 벤치 오버플로!',
    sub: '7종째 카드 · 매치 패배',
    color: 'text-neon-red',
    glow: 'drop-shadow(0 0 24px rgba(255,51,85,0.9))',
  },
  'bench-full-foe': {
    headline: '상대 벤치 오버플로!',
    sub: '7종째 카드 · 매치 승리',
    color: 'text-neon-cyan',
    glow: 'drop-shadow(0 0 24px rgba(0,229,255,0.9))',
  },
  'attacker-empty-me': {
    headline: '내 덱 소진',
    sub: '깃발 못 뺏음 · 매치 패배',
    color: 'text-neon-magenta',
    glow: 'drop-shadow(0 0 20px rgba(255,43,214,0.9))',
  },
  'attacker-empty-foe': {
    headline: '상대 덱 소진',
    sub: '내 깃발 지킴 · 매치 승리',
    color: 'text-neon-cyan',
    glow: 'drop-shadow(0 0 20px rgba(0,229,255,0.9))',
  },
}

/**
 * Big centered slash-in text used for punchy match moments.
 * Auto-hides via parent state (managed by scene).
 */
export function SlashOverlay({
  variant, keyId,
}: {
  variant: SlashVariant | null
  keyId: string | number
}) {
  const content = variant ? CONTENT[variant] : null

  return (
    <AnimatePresence>
      {content && (
        <motion.div
          key={keyId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none overflow-hidden"
        >
          <motion.div
            initial={{ scale: 3.2, rotate: -8, opacity: 0 }}
            animate={{ scale: 1, rotate: -3, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ type: 'spring', damping: 14, stiffness: 240 }}
            className="text-center px-4 py-4 max-w-[90vw]"
          >
            <div className={`font-display font-black text-[clamp(1.75rem,10vw,3.25rem)] leading-none tracking-widest ${content.color} whitespace-nowrap`}
                 style={{ filter: content.glow }}>
              {content.headline}
            </div>
            {content.sub && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-mono text-[10px] sm:text-[11px] tracking-[0.25em] text-white/80 mt-3 whitespace-nowrap"
              >
                {content.sub}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
