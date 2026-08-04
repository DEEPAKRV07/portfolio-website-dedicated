/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgDark: '#050505',
        primaryGreen: '#00ff88',
        secondaryGreen: '#00cc66',
        darkGreen: '#004422',
        traceGreen: '#001a0d',
        primaryBlue: '#3b82f6',
        accentPink: '#ff007f',
        primaryText: '#f0f0f0',
        secondaryText: '#888888',
        surface: '#0d0d0d'
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
