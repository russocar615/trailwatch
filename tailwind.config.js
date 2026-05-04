/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        hunter: {
          50:  '#f0f5f1',
          100: '#dceade',
          200: '#bcd5c0',
          300: '#92b99a',
          400: '#659870',
          500: '#3d7a4d',
          600: '#2d6a4f',
          700: '#1f5438',
          800: '#163d28',
          900: '#0d2618',
          950: '#071510',
        },
        creme: {
          50:  '#fdfcf7',
          100: '#faf7ed',
          200: '#f5edd8',
          300: '#ede0be',
          400: '#e0cea0',
          500: '#d0b87d',
          600: '#b89660',
          700: '#957548',
          800: '#6e5535',
          900: '#473525',
        },
        forest: '#1a3a2a',
        bark:   '#4a3728',
      },
      fontFamily: {
        serif:  ['DM Serif Display', 'Georgia', 'serif'],
        sans:   ['Instrument Sans', 'system-ui', 'sans-serif'],
        mono:   ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
