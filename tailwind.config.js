const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '440px',
      ...defaultTheme.screens,
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1.5rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6.25rem',
      },
    },
    extend: {
      colors: {
        // Tambah warna disini dengan format 'nama-warna': 'kode warna (hex atau rgb)'
        'dark-blue': '#1A1B36',
        'basic-blue': '#47389F',
        'light-blue': '#BBB7D3',
        'danger-red': '#FF594E',
        'warning-yellow': '#E3D55B',
        'success-green': '#4CAF50',
      },
      zIndex:{
        'fixed': 9999
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}
