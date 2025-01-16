/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "cb-red": "#EA2328",
        "cb-teal": "#00BCE4",
      },
      screens: {
        'xs': '375px',    // iPhone SE
        'sm': '640px',    // Small tablets
        'md': '768px',    // iPads
        'lg': '1024px',   // Laptops
        'xl': '1280px',   // Desktop
        '2xl': '1536px'   // Large screens
      },
      touchAction: {
        'manipulation': 'manipulation',
      }
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
};