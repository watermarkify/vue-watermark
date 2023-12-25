import { defineConfig } from 'windicss/helpers'
import plugin from 'windicss/plugin'

export default defineConfig({
  theme: {
    extend: {
      colors: {
        watermarkify: {
          500: '#62D7F4',
        },
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      const newUtilities = {
        '.flex-2': {
          flex: '2',
        },
      }
      addUtilities(newUtilities)
    }),
  ],
})
