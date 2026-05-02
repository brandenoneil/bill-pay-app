/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f4f3f0',
          100: '#e8e6e0',
          200: '#d0ccc0',
          300: '#b0aa9a',
          400: '#8a836f',
          500: '#6b6352',
          600: '#524c3e',
          700: '#3a352a',
          800: '#221f18',
          900: '#100e0a',
        },
        moss: {
          400: '#7a9e6e',
          500: '#5d8a4f',
          600: '#4a7040',
        },
        amber: {
          400: '#e8b84b',
          500: '#d4a030',
          600: '#b8861f',
        },
        rust: {
          400: '#c97b5a',
          500: '#b5623e',
          600: '#994d2c',
        }
      },
    },
  },
  plugins: [],
}
