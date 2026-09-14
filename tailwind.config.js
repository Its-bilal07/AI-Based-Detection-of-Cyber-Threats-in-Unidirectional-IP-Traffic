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
          bg: '#0B0F19',
          surface: '#111827',
          panel: '#131C2E',
          card: '#151E31',
          cardHover: '#1A263D',
          border: '#1E293B',
          borderHover: '#2E3D56',
          accent: '#0284C7',
          subtle: '#334155',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
