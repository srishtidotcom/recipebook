/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        cream: {
          50:  '#fefdf8',
          100: '#fdf9ec',
          200: '#faf0d0',
          300: '#f5e3a8',
        },
        bark: {
          500: '#8B5E3C',
          600: '#7A4F2E',
          700: '#6B3E20',
          800: '#4A2B14',
          900: '#2E1A0A',
        },
        sage: {
          400: '#8FAF7E',
          500: '#7A9E6A',
          600: '#65884E',
        },
        terracotta: {
          400: '#E07D5A',
          500: '#D4603A',
          600: '#B84C27',
        },
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
