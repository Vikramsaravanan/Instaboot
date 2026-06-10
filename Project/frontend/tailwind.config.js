/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        // ── Base surfaces — warm charcoal, not cold gray ─────────────────────
        surface: {
          base:    '#0e0e11',   // deepest background
          raised:  '#16161a',   // sidebar, cards
          overlay: '#1c1c22',   // inputs, hover surfaces
          border:  '#2a2a35',   // dividers
          muted:   '#3a3a48',   // subtle borders
        },
        // ── Primary — violet/purple ──────────────────────────────────────────
        violet: {
          50:  '#f3f0ff',
          100: '#e8e1ff',
          200: '#cfc0fe',
          300: '#ac93fc',
          400: '#8b5cf6',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#3b1575',
          950: '#1e0a4a',
        },
        // ── Secondary — cyan/teal ────────────────────────────────────────────
        cyan: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        // ── Text scale ───────────────────────────────────────────────────────
        ink: {
          primary:   '#f0eeff',   // headings
          secondary: '#b8b5d0',   // body
          muted:     '#6e6b88',   // placeholders, timestamps
          faint:     '#3d3a52',   // disabled, hairlines
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      animation: {
        'fade-in':    'fadeInUp 0.22s ease-out forwards',
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'violet-glow': '0 0 24px -4px rgba(124,58,237,0.35)',
        'cyan-glow':   '0 0 24px -4px rgba(6,182,212,0.25)',
        'card':        '0 4px 24px 0 rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};
