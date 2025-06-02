/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FFBF00", // Gold/amber primary color
        primaryHover: "#E6AC00",
        secondary: {
          light: "#FFFFFF", // White
          dark: "#000000",  // Black
        },
        accent: {
          light: "#FFD54F", // Lighter amber
          DEFAULT: "#FFBF00", // Same as primary
          dark: "#FFB300", // Darker amber
        }
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      boxShadow: {
        button: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
