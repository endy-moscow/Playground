const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  mode: 'jit',
  content: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'], // remove unused styles in production
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    colors: {
      altel: '#E72487',
      white: '#fff',
    },
    extend: {
      fontFamily: {
        stratos: ['StratosLCG-SemiBold', ...defaultTheme.fontFamily.sans],
      },
      animation: {
        hexagon: 'moveOut 3s linear infinite',
      },
      keyframes: {
        moveOut: {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0)' },
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
