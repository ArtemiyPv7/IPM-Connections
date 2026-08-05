/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#1B1712',
        card: '#251F18',
        card2: '#2D261E',
        line: '#3B332A',
        ink: '#F0E7D8',
        muted: '#A19585',
        bronze: '#B08C5A',
        sand: '#DDBA8C',
        sage: '#A9BFA9',
        terra: '#DE8168',
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        sans: ['Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}