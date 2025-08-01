/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      colors: {
        border: "hsl(220 13% 91%)",
        input: "hsl(220 13% 91%)", 
        ring: "hsl(224 71.4% 4.1%)",
        background: "hsl(0 0% 100%)",
        foreground: "hsl(224 71.4% 4.1%)",
        primary: {
          DEFAULT: "hsl(220.9 39.3% 11%)",
          foreground: "hsl(210 20% 98%)",
        },
        secondary: {
          DEFAULT: "hsl(220 14.3% 95.9%)",
          foreground: "hsl(220.9 39.3% 11%)",
        },
        destructive: {
          DEFAULT: "hsl(0 84.2% 60.2%)",
          foreground: "hsl(210 20% 98%)",
        },
        muted: {
          DEFAULT: "hsl(220 14.3% 95.9%)",
          foreground: "hsl(220 8.9% 46.1%)",
        },
        accent: {
          DEFAULT: "hsl(220 14.3% 95.9%)",
          foreground: "hsl(220.9 39.3% 11%)",
        },
        popover: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(224 71.4% 4.1%)",
        },
        card: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(224 71.4% 4.1%)",
        },
      },
    },
  },
  plugins: [],
}