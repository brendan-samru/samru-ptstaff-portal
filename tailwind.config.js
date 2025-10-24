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
        inter: ['Inter', 'Poppins', 'sans-serif'],      },
    },
  },
  plugins: [],
};
