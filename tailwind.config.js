/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cyberpunk arena palette — aligned with #05 mockup tokens.
        arena: {
          void: '#0a0e18',        // Deep background (was #05050c)
          deep: '#0f1830',        // Panel background (was #0a0a14)
          panel: '#111a30',       // Card panel
          panel2: '#1a2340',      // Card panel highlight
          line: '#3d3d66',        // Border
          lineDim: '#2a2a44',     // Dim border
          textDim: '#9aa3c7',     // Muted text (was #8888a8)
          textMuted: '#55557a',   // Extra muted
          text: '#e8ecff',        // Bright text
        },
        neon: {
          cyan: '#22e9ff',        // was #00e5ff — brighter, matches #05
          cyanSoft: '#66f0ff',
          magenta: '#ff2bd6',
          magentaSoft: '#ff7ce6',
          yellow: '#ffd84d',      // was #ffe600 — warmer gold
          gold: '#ffd84d',        // alias for gold-specific use
          green: '#22ff88',
          red: '#ff3355',
        },
        // Card level tints (T1..T5 semantics; existing S/A/B/C mapped)
        lvl: {
          s: '#8888a8',    // Starter, gray (T1)
          a: '#22ff88',    // Common, green (T2)
          b: '#22e9ff',    // Rare, cyan (T3)
          c: '#ff2bd6',    // Elite, magenta (T4)
          gold: '#ffd84d', // Legendary (T5, reserved)
        },
      },
      fontFamily: {
        // #05 language: Bebas Neue for big numbers/headings,
        // Space Mono for microlabels/badges, Inter for body.
        display: ['"Bebas Neue"', '"Orbitron"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', '"Rajdhani"', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', '"Share Tech Mono"', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 12px rgba(34, 233, 255, 0.55), 0 0 32px rgba(34, 233, 255, 0.55)',
        'neon-magenta': '0 0 12px rgba(255, 43, 214, 0.55), 0 0 32px rgba(255, 43, 214, 0.55)',
        'neon-yellow': '0 0 10px rgba(255, 216, 77, 0.6), 0 0 24px rgba(255, 216, 77, 0.6)',
        'neon-gold': '0 0 12px rgba(255, 216, 77, 0.65), 0 0 32px rgba(255, 216, 77, 0.5)',
        'neon-green': '0 0 10px rgba(34, 255, 136, 0.5), 0 0 24px rgba(34, 255, 136, 0.5)',
        'neon-red': '0 0 12px rgba(255, 51, 85, 0.55), 0 0 24px rgba(255, 51, 85, 0.55)',
        'deep': '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
      },
      backgroundImage: {
        'arena-radial': 'radial-gradient(ellipse at 20% 10%, rgba(34,233,255,0.08), transparent 40%), radial-gradient(ellipse at 80% 90%, rgba(255,43,214,0.10), transparent 45%), #0a0e18',
        'holo-gradient': 'linear-gradient(90deg, #22e9ff 0%, #ff2bd6 100%)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 1.4s ease-in-out infinite',
        'slide-in': 'slide-in 0.5s ease-out',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'slide-in': {
          from: { transform: 'translateX(30px) scale(0.8)', opacity: '0' },
          to: { transform: 'translateX(0) scale(1)', opacity: '1' },
        },
        'scanline': {
          from: { transform: 'translateY(-100%)' },
          to: { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
}
