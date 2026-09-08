/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        soc: {
          bg: '#080C15',
          surface: '#0E1526',
          card: '#131C31',
          cardHover: '#18243E',
          border: '#1E293B',
          borderHover: '#334155',
          accent: '#06B6D4',
          cyanGlow: 'rgba(6, 182, 212, 0.15)',
          redGlow: 'rgba(239, 68, 68, 0.2)',
          amberGlow: 'rgba(245, 158, 11, 0.2)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', 'monospace'],
      },
      keyframes: {
        pulseRadar: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.2)' },
        },
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      },
      animation: {
        'pulse-radar': 'pulseRadar 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'sweep 4s linear infinite',
      }
    },
  },
  plugins: [],
}
