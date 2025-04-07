// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // update based on your project
  ],
  theme: {
    extend: {
      colors: {
        brand: "#f04d46",
      },
      fontFamily: {
        chewy: ["Chewy", "cursive"],
      },
    },
  },
  plugins: [],
};
