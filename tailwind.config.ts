import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        rt: {
          sidebar: "hsl(var(--rt-sidebar))",
          "sidebar-fg": "hsl(var(--rt-sidebar-foreground))",
          blue: "hsl(var(--rt-blue))",
          "blue-light": "hsl(var(--rt-blue-light))",
          "blue-mid": "hsl(var(--rt-blue-mid))",
          "blue-pale": "hsl(var(--rt-blue-pale))",
          green: "hsl(var(--rt-green))",
          "green-light": "hsl(var(--rt-green-light))",
          amber: "hsl(var(--rt-amber))",
          "amber-light": "hsl(var(--rt-amber-light))",
          "amber-dark": "hsl(var(--rt-amber-dark))",
          red: "hsl(var(--rt-red))",
          "red-light": "hsl(var(--rt-red-light))",
          "red-dark": "hsl(var(--rt-red-dark))",
          purple: "hsl(var(--rt-purple))",
          "purple-light": "hsl(var(--rt-purple-light))",
          "gray-50": "hsl(var(--rt-gray-50))",
          "gray-100": "hsl(var(--rt-gray-100))",
          "gray-200": "hsl(var(--rt-gray-200))",
          "gray-400": "hsl(var(--rt-gray-400))",
          "gray-500": "hsl(var(--rt-gray-500))",
          "gray-700": "hsl(var(--rt-gray-700))",
          "gray-900": "hsl(var(--rt-gray-900))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
