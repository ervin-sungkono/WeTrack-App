import flowbite from "flowbite/plugin";
const defaultTheme = require('tailwindcss/defaultTheme')

const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}'
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
        'dark-gray': '#ECECEC'
      },
      zIndex:{
        'fixed': 9999
      },
      fontSize: {
        'title-bold': '30px',
        'title-semibold': '24px',
      },
      width: {
        '1/20': '5%',
        '1/10': '10%',
        '1/8': '12.5%',
        '3/20': '15%',
        '3/10': '30%',
        '7/20': '35%',
        '3/8': '37.5%',
        '9/20': '45%',
        '11/20': '55%',
        '5/8': '62.5%',
        '13/20': '65%',
        '7/10': '70%',
        '17/20': '85%',
        '7/8': '87.5%',
        '9/10': '90%',
        '19/20': '95%',
      },
      height: {
        '1/20': '5%',
        '1/10': '10%',
        '1/8': '12.5%',
        '3/20': '15%',
        '3/10': '30%',
        '7/20': '35%',
        '3/8': '37.5%',
        '9/20': '45%',
        '11/20': '55%',
        '5/8': '62.5%',
        '13/20': '65%',
        '7/10': '70%',
        '17/20': '85%',
        '7/8': '87.5%',
        '9/10': '90%',
        '19/20': '95%',
      },
    },
  },
  plugins: [flowbite],
}

export default config