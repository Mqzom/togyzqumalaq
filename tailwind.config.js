/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#102C3A',
        deep: '#153F48',
        teal: {
          DEFAULT: '#1B9A91',
          deep: '#12756E',
        },
        gold: {
          DEFAULT: '#C8A45D',
          light: '#E4CC96',
        },
        milk: '#F6F2E9',
        ink: '#182A30',
      },
      fontFamily: {
        serif: ['"Noto Serif"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', '"Noto Serif"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        board: '0 30px 80px rgba(0, 0, 0, 0.35)',
        glow: '0 0 0 1px rgba(200, 164, 93, 0.45), 0 10px 40px rgba(16, 44, 58, 0.12)',
      },
      letterSpacing: {
        eyebrow: '0.22em',
      },
    },
  },
  plugins: [],
}
