import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        pulse: 'pulse 1.3s linear infinite',
        slideRight: 'slideRight 3s ease-in-out infinite',
        slideUp: 'slideUp 1s ease-in-out',
        slideDown: 'slideDown 1s ease-in-out',
        opacity: 'opacity 2s ease-in-out'
      },
      keyframes: {
        pulse: {
          '30%': { opacity: '1' },
          '50%': { opacity: '0' },
          '70%': { opacity: '1' }
        },
        slideRight: {
          '10%': { left: '-200px' },
          '100%': { left: '110%' },
        },
        slideUp: {
          '0%': { bottom: '-128px' },
          '100%': { bottom: '0' },
        },
        slideDown: {
          '0%': { bottom: '0' },
          '100%': { bottom: '-128px' },
        },
        opacity: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
