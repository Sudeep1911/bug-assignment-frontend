// tailwind.config.js
module.exports = {
  content: ["./pages//*.{js,ts,jsx,tsx}", "./components//*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#a855f7", // Tailwind purple-500
          DEFAULT: "#9333ea", // Tailwind purple-600
          dark: "#6b21a8", // Tailwind purple-700
        },
        secondary: {
          light: "#22d3ee", // Tailwind cyan-400
          DEFAULT: "#06b6d4", // Tailwind cyan-500
          dark: "#0e7490", // Tailwind cyan-700
        },
        neutral: {
          100: "#f8fafc",
          200: "#e2e8f0",
          800: "#1e293b", // Tailwind slate-800
          900: "#0f172a", // Tailwind slate-900
        },
        pinkish: "#ec4899", // Tailwind pink-500
        glass: "rgba(255, 255, 255, 0.05)",
        border: "rgba(255, 255, 255, 0.2)",
      },
    },
  },

  plugins: [],
};
