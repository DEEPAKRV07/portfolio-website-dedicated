/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgPrimary: '#050505',
        bgSurface: '#0d0d0d',
        primaryGreen: '#00ff88',
        mediumGreen: '#00cc66',
        darkGreen: '#004422',
        traceGreen: '#001a0d',
        primaryText: '#f0f0f0',
        secondaryText: '#888888',
        blueAccent: '#00aaff',
        purpleAccent: '#8b5cf6',
        pinkOutput: '#ff007f'
      },
      fontFamily: {
        delta: ['Cinzel', 'serif'],
        sans: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
