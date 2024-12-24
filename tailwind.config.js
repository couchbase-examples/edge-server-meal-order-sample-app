/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "cb-red": "#EA2328",   // Primary Couchbase red
        "cb-teal": "#00BCE4",  // Couchbase teal
      },
    },
  },
  plugins: [],
};