/** @type {import('tailwindcss').Config} */
const colors = require("./colors.config");
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}','./app/**/*.{js,jsx,ts,tsx}'],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {colors},
  },
  plugins: [],
}

