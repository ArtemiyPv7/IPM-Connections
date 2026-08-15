/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ink — цвет текста, paper — фон страницы; оба меняются по data-theme
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        paper: 'rgb(var(--color-paper) / <alpha-value>)',
        gray: 'rgb(var(--color-gray) / <alpha-value>)',
        blue: 'rgb(var(--color-blue) / <alpha-value>)',
        sky: 'rgb(var(--color-sky) / <alpha-value>)',
        green: 'rgb(var(--color-green) / <alpha-value>)',
        red: 'rgb(var(--color-red) / <alpha-value>)',
        amber: 'rgb(var(--color-amber) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}