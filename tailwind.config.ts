import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        adipa: {
          purple: '#704EFD',
          cyan:   '#2CB7FF',
          light:  '#F3F4FF',
          navy:   '#091E42',
          lavender: '#DFD5FF',
          'light-blue': '#CBE8FF',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
