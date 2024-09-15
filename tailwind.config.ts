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
        slideLeft: 'slideLeft 1s ease-in infinite',
        slideUp: 'slideUp 1s ease-in-out',
        slideDown: 'slideDown 1s ease-in-out',
        opacity: 'opacity 3s ease-in-out',
        swipe: 'swipe 1.4s ease-in-out infinite',
        swipeDown: 'swipeDown 1s ease-in-out infinite'
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
        slideLeft: {
          '10%': { left: '100px', opacity: '1' },
          '100%': { left: '4px', opacity: '0.2' },
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
          '0%': { marginLeft: '70vw', opacity: '0', rotate:'30deg' },
          '50%': { opacity: '1' },
          '100%': { marginLeft: '30vw', opacity: '0' },
        },
        swipeDown: {
          '0%': { rotate: '-80deg', transform: 'translateX(0px)', opacity: '0' },
          '20%': { opacity: '1' },
          '50%': { opacity: '1' },
          '100%': { rotate: '-50deg', transform: 'translateX(40px) translateY(-30px)', opacity: '0' },
        }
      },
      transitionProperty: {
        'portfolio': 'transform, width',
      }
    },
  },
  plugins: [],
};
export default config;
