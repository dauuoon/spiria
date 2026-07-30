import type { Config } from 'tailwindcss'
import aspectRatio from '@tailwindcss/aspect-ratio'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#6D5BD0',
          600: '#5B4AB8',
        },
        gold: '#D9B36C'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.2)'
      }
    },
  },
  plugins: [aspectRatio],
} satisfies Config
