import { AnimatePresence, motion } from 'framer-motion'
import { useToast, type ToastKind } from '../store/toastStore'

const STYLES: Record<ToastKind, { border: string; text: string; icon: string }> = {
  info:    { border: 'border-neon-cyan', text: 'text-neon-cyan', icon: 'ℹ' },
  warn:    { border: 'border-neon-yellow', text: 'text-neon-yellow', icon: '⚠' },
  error:   { border: 'border-neon-red', text: 'text-neon-red', icon: '✕' },
  success: { border: 'border-neon-green', text: 'text-neon-green', icon: '✓' },
}

export function ToastStack() {
  const toasts = useToast((s) => s.toasts)
  const dismiss = useToast((s) => s.dismiss)

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[90] flex flex-col items-center gap-2 pt-safe pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const s = STYLES[t.kind]
          return (
            <motion.button
              key={t.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: 'spring', damping: 22 }}
              onClick={() => dismiss(t.id)}
              className={`pointer-events-auto flex items-center gap-2 max-w-[90vw] px-4 py-2.5
                          bg-arena-void/90 backdrop-blur border ${s.border} clip-cyber
                          font-body text-sm ${s.text}`}
            >
              <span className="font-display font-black">{s.icon}</span>
              <span className="text-white">{t.message}</span>
            </motion.button>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
