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
        opacity: 'opacity 2s ease-in-out',
        swipe: 'swipe 1.5s ease-in-out infinite',
        rotation: 'rotation 3s ease-in-out'
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
          '0%': { bottom: '-96px' },
          '100%': { bottom: '0' },
        },
        slideDown: {
          '0%': { bottom: '0' },
          '100%': { bottom: '-96px' },
        },
        opacity: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        swipe: {
          '0%': { marginLeft: '5vw', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { marginLeft: '70vw', opacity: '0' },
        },
        rotation: {
          '0%': { rotate: '-80deg', transform: 'translateX(0)', opacity: '0' },
          '10%': { opacity: '1' },
          '30%': { rotate: '-120deg', transform: 'translateX(-40px)', opacity: '0' },
          '31%': { rotate: '-80deg', transform: 'translateX(0)', opacity: '0' },
          '40%': { opacity: '1' },
          '70%': { rotate: '-120deg', transform: 'translateX(-40px)', opacity: '0' },
          '71%': { rotate: '-80deg', transform: 'translateX(0)', opacity: '0' },
          '80%': { opacity: '1' },
          '100%': { rotate: '-120deg', transform: 'translateX(-40px)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
