// ✅ tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Helvetica", "sans-serif"],
        paragraph: ["Poppins", "sans-serif"],
      },
      colors: {
        primary: "#FFD100", // jaune éducatif
        secondary: "#FFA000", // orange oriental
      },
    },
  },
  plugins: [],
};