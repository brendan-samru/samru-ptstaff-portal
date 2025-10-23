/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        samru: {
          'green-light': '#8BC53F',
          'green-dark': '#65953B',
          'blue-light': '#26A9E0',
          'blue-dark': '#0D6537',
        },
      },
      fontFamily: {
        ubuntu: ['Ubuntu', 'sans-serif'],
        quicksand: ['Quicksand', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-samru': 'linear-gradient(135deg, #8BC53F 0%, #26A9E0 100%)',
        'gradient-soft': 'linear-gradient(135deg, #f0fdf4 0%, #dbeafe 50%, #ffffff 100%)',
      },
    },
  },
  plugins: [],
};
