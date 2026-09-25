export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#8b5cf6",
        secondary: "#2563eb",
        background: "#0b0d16",
        card: "#131725",
        textMain: "#f8fafc",
        textMuted: "#94a3b8",
      },
      boxShadow: {
        "dark-neumorphic": "0 24px 70px rgba(0,0,0,.28)",
        "dark-neumorphic-sm": "0 14px 38px rgba(0,0,0,.22)",
        "dark-neumorphic-inset": "inset 0 0 0 1px rgba(255,255,255,.06)",
      },
    },
  },
  plugins: [],
};
