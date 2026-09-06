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
        sprint: {
          red: '#E34A32',
          orange: '#F05A3C',
          dark: '#2E3034',
          text: '#232427',
          muted: '#55575c',
          bg: '#ECEDEE',
          'dark-surface': '#171719',
          'dark-card': '#202024',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'serif-accent': ['"Instrument Serif"', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        heading: '-0.035em',
        'serif-accent': '-0.01em',
      },
      boxShadow: {
        'white-inset': '0 1px 0 rgba(255,255,255,0.9) inset',
        'card-depth': '0 1px 0 rgba(255,255,255,0.9) inset, 0 14px 30px -18px rgba(35,36,39,0.25)',
        'package-featured': '0 24px 60px rgba(23,23,25,0.7)',
      },
      scale: {
        '104': '1.04',
      }
    },
  },
  plugins: [],
}


