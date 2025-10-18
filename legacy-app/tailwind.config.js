/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Pure black and white theme
        'pure-black': '#040404',
        'pure-white': '#ffffff',
        'pure-gray-50': '#fafafa',
        'pure-gray-100': '#f5f5f5',
        'pure-gray-200': '#e5e5e5',
        'pure-gray-300': '#d4d4d4',
        'pure-gray-400': '#a3a3a3',
        'pure-gray-500': '#737373',
        'pure-gray-600': '#525252',
        'pure-gray-700': '#404040',
        'pure-gray-800': '#1a1a1a',
        'pure-gray-900': '#171717',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
