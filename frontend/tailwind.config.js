/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        surface: {
          900: "#080b14",
          800: "#0d1120",
          700: "#111827",
          600: "#1a2235",
          500: "#1e2a3d",
        },
        accent: {
          blue: "#3b82f6",
          purple: "#8b5cf6",
          cyan: "#06b6d4",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-dot": "pulseDot 1.4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        pulseDot: { "0%, 80%, 100%": { transform: "scale(0)", opacity: "0.5" }, "40%": { transform: "scale(1)", opacity: "1" } },
      },
      backdropBlur: { xs: "2px" },
    },
  },
  plugins: [],
};
