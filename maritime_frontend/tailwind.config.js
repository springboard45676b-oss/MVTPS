/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maritime: {
          blue: '#0077be',
          navy: '#001f3f',
          teal: '#20b2aa',
          ocean: '#006994',
        }
      }
    },
  },
  plugins: [],
}
