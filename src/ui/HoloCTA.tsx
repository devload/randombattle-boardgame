import type { ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

/**
 * Big holographic CTA button with clip-cyber shape and sweep-shine animation.
 * Used for scene-level primary actions (NEW TOURNAMENT, 다시 도전, 다음, etc.)
 * per the #05 language.
 */
export function HoloCTA({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: Variant
  size?: 'md' | 'lg'
  fullWidth?: boolean
}) {
  const sizes = {
    md: 'px-6 py-2.5 text-xs',
    lg: 'px-8 py-3.5 text-sm',
  }
  const styles: Record<Variant, string> = {
    primary: 'bg-holo-gradient text-arena-void shadow-neon-cyan',
    secondary: 'border border-neon-cyan text-neon-cyan bg-neon-cyan/5 hover:bg-neon-cyan/10',
    ghost: 'border border-arena-line text-arena-textDim hover:text-neon-cyan hover:border-neon-cyan/50',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden clip-cyber font-display font-bold uppercase
                  tracking-[0.14em] transition-all
                  ${sizes[size]} ${styles[variant]}
                  ${fullWidth ? 'w-full' : ''}
                  ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
      style={{ letterSpacing: '0.14em' }}
    >
      <span className="relative z-10">{children}</span>
      {!disabled && variant === 'primary' && (
        <span
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.35) 48%, transparent 62%)',
            animation: 'holo-sweep 2.4s ease-in-out infinite',
          }}
        />
      )}
      <style>{`
        @keyframes holo-sweep {
          0%   { transform: translateX(-140%); }
          60%  { transform: translateX(140%); }
          100% { transform: translateX(140%); }
        }
      `}</style>
    </button>
  )
}
