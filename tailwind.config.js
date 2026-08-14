/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  // Every page Tailwind should scan for class names when generating the
  // real, compiled stylesheet. If you add a new .html page or a new .js
  // file that uses Tailwind classes (even ones built as strings, like the
  // dashboard's card templates), add it here or Tailwind won't know to
  // keep those classes in the final CSS.
  content: ["./*.html", "./js/**/*.js"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        border: "var(--border)",
        text: "var(--text)",
        "text-soft": "var(--text-soft)",
        primary: "var(--primary)",
        "primary-dark": "var(--primary-dark)",
        success: "var(--success)",
        danger: "var(--danger)",
        teal: "var(--teal)",
        pink: "var(--pink)",
        amber: "var(--amber)",
      },
      fontFamily: {
        display: ['"Sora"', "sans-serif"],
        body: ['"Plus Jakarta Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};