import { defineConfig } from 'windicss/helpers'
import colors from 'windicss/colors'

export default defineConfig({
  attributify: true,
  theme: {
    extend: {
      colors: {
        white: colors.white,
        black: colors.black,
        gray: '#f6f3f3',
        lightBlack: '#363636',
        darkBlack: '#202020',
        orange: '#FB9904',
        red: '#FB0404',
        
      }
    },
    backgroundColor: {
      theme: 'var(--color-theme)',
      primary: 'var(--color-bg-primary)',
    },

  }
})
