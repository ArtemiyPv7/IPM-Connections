/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        black: '#0D1117',
        white: '#E6EDF3',
        gray: '#8B949E',
        blue: '#4493F8',
        sky: '#79C0FF',
        green: '#3FB950',
        red: '#F85149',
        amber: '#D29922',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}