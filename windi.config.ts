import { defineConfig } from 'windicss/helpers'
import colors from 'windicss/colors'

export default defineConfig({
  attributify: true,
  theme: {
    extend: {
      colors: {
        white: colors.white,
        black: colors.black,
        gray: '#979797',
        lightBlack: '#23232b',
        darkBlack: '#323233',
        orange: '#FB9904',
        red: '#FB0404'
      }
    },
    /**
         * theme - 主題色
         * primary - 主要色
         * secondary - 次要色
         */
    backgroundColor: {
      theme: 'var(--color-theme)',
      primary: 'var(--color-bg-primary)',
      secondary: 'var(--color-bg-secondary)',
      light: 'var(--color-bg-light)'
    },
    textColor: {
      theme: 'var(--color-theme)',
      primary: 'var(--color-text-primary)',
      secondary: 'var(--color-text-secondary)',
      error: 'var(--color-text-error)'
    }
  }
})
