const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  mode: 'jit',
  content: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'], // remove unused styles in production
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    colors: {
      altel: '#E72487',
      white: '#fff',
      black: '#000',
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
      },
      pink: {
        50: '#fdf2f8',
        100: '#fdf2f8',
        200: '#fce7f3',
        300: '#f9a8d4',
        400: '#f472b6',
        500: '#ec4899',
        600: '#db2777',
        700: '#be185d',
        800: '#9d174d',
        900: '#831843',
      },
      yellow: {
        400: '#FFC821',
      },
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
