import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  title?: string
  eyebrow?: string
  children: React.ReactNode
  /** Max height ratio (0-1). Default 0.85 */
  maxHeight?: number
}

/**
 * Bottom sheet overlay. Used for card detail, rules, stats.
 */
export function Sheet({ open, onClose, title, eyebrow, children, maxHeight = 0.85 }: Props) {
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-arena-void/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 260 }}
            className="fixed left-0 right-0 bottom-0 z-50 flex flex-col
                       rounded-t-3xl border-t border-x border-neon-cyan/40
                       bg-gradient-to-b from-arena-panel to-arena-void
                       shadow-[0_-24px_60px_rgba(0,0,0,0.6)] pb-safe"
            style={{ maxHeight: `${maxHeight * 100}%` }}
          >
            <button
              onClick={onClose}
              className="mx-auto mt-3 w-14 h-1.5 rounded-full bg-white/30 hover:bg-white/50 transition"
              aria-label="Close"
            />

            {(eyebrow || title) && (
              <div className="px-5 pt-3 pb-4 flex items-baseline justify-between">
                <div>
                  {eyebrow && (
                    <div className="text-[10px] tracking-widest text-neon-cyan/70 font-mono">
                      {eyebrow}
                    </div>
                  )}
                  {title && (
                    <h2 className="font-display font-black text-2xl text-holo mt-0.5 tracking-wider uppercase">
                      {title}
                    </h2>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="text-white/50 hover:text-white text-xl leading-none w-9 h-9 rounded-full border border-white/20 hover:border-white/40 transition"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 pb-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
