/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // ✅ required for toggle to work
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
};
