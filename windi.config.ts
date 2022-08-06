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
        purple: '#9b4dca'
      }
    },
    backgroundColor: {
      theme: 'var(--color-theme)',
      primary: 'var(--color-bg-primary)'
    },
    textColor: {
      theme: 'var(--color-text-theme)'
    }

  }
})
