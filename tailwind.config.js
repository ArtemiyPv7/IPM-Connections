/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0D1117',
        card: '#161B22',
        card2: '#21262D',
        line: '#30363D',
        ink: '#E6EDF3',
        muted: '#8B949E',
        bronze: '#4493F8',
        sand: '#79C0FF',
        sage: '#3FB950',
        terra: '#F85149',
        warning: '#D29922',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}