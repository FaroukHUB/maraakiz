/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', 'serif'], // Police pour titres (remplace Trajan)
        poppins: ['Poppins', 'sans-serif'], // Police pour paragraphes
      },
    },
  },
  plugins: [],
};
