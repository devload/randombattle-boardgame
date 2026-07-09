/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cyberpunk arena palette
        arena: {
          void: '#05050c',        // Deep background
          deep: '#0a0a14',        // Panel background
          panel: '#111124',       // Card panel
          panel2: '#1a1a2e',      // Card panel highlight
          line: '#3d3d66',        // Border
          lineDim: '#2a2a44',     // Dim border
          textDim: '#8888a8',     // Muted text
          textMuted: '#55557a',   // Extra muted
        },
        neon: {
          cyan: '#00e5ff',
          cyanSoft: '#66f0ff',
          magenta: '#ff2bd6',
          magentaSoft: '#ff7ce6',
          yellow: '#ffe600',
          green: '#22ff88',
          red: '#ff3355',
        },
        // Card level tints
        lvl: {
          s: '#8888a8',    // Starter, gray
          a: '#22ff88',    // Common, green
          b: '#00e5ff',    // Rare, cyan
          c: '#ff2bd6',    // Elite, magenta
        },
      },
      fontFamily: {
        display: ['"Orbitron"', '"Rajdhani"', 'system-ui', 'sans-serif'],
        body: ['"Rajdhani"', 'system-ui', 'sans-serif'],
        mono: ['"Share Tech Mono"', '"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 12px rgba(0, 229, 255, 0.55), 0 0 32px rgba(0, 229, 255, 0.55)',
        'neon-magenta': '0 0 12px rgba(255, 43, 214, 0.55), 0 0 32px rgba(255, 43, 214, 0.55)',
        'neon-yellow': '0 0 10px rgba(255, 230, 0, 0.6), 0 0 24px rgba(255, 230, 0, 0.6)',
        'neon-green': '0 0 10px rgba(34, 255, 136, 0.5), 0 0 24px rgba(34, 255, 136, 0.5)',
        'neon-red': '0 0 12px rgba(255, 51, 85, 0.55), 0 0 24px rgba(255, 51, 85, 0.55)',
        'deep': '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
      },
      backgroundImage: {
        'arena-radial': 'radial-gradient(ellipse at 20% 10%, rgba(0,229,255,0.08), transparent 40%), radial-gradient(ellipse at 80% 90%, rgba(255,43,214,0.10), transparent 45%), #05050c',
        'holo-gradient': 'linear-gradient(90deg, #00e5ff 0%, #ff2bd6 100%)',
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
