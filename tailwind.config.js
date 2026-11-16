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
        discord: {
          bg: '#1e1f22',
          secondary: '#313338',
          card: '#2b2d31',
          hover: '#35373c',
          darkest: '#111214',
          input: '#1e1f22',
          blurple: '#5865F2',
          'blurple-hover': '#4752c4',
          green: '#23a55a',
          'green-hover': '#1d8749',
          yellow: '#f0b232',
          red: '#f23f43',
          'red-hover': '#da373b',
          text: {
            normal: '#dbdee1',
            muted: '#949ba4',
            header: '#f2f3f5',
          },
          border: '#3f4147'
        },
        minecraft: {
          overworld: '#2ecc71',
          nether: '#e74c3c',
          end: '#9b59b6',
          gold: '#f1c40f',
          diamond: '#00d2d3',
          redstone: '#ff4757',
          emerald: '#2ed573'
        }
      },
      fontFamily: {
        sans: ['"gg sans"', '"Noto Sans"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}
