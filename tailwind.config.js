/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'aussie': {
          50: '#f0fdf8',
          100: '#ccfce7',
          200: '#99f9d6',
          300: '#5af5c9',
          400: '#26f0b1',
          500: '#00e599',
          600: '#00c77a',
          700: '#00a05f',
          800: '#007a4a',
          900: '#005a38',
        },
        'os': {
          'bg': '#0b0f16',
          'panel': '#111728',
          'border': 'rgba(255, 255, 255, 0.06)',
          'borderStrong': 'rgba(255, 255, 255, 0.12)',
          'text': '#e8edf5',
          'textDim': '#8b95a7',
        },
        'success': {
          '400': '#3fb950',
          '500': '#1f6feb',
          '600': '#238636',
          '700': '#2ea043',
        },
        'error': {
          '400': '#f85149',
          '500': '#da3633',
          '600': '#da3633',
          '700': '#b1060d',
        },
        'warning': {
          '400': '#d29922',
          '500': '#d0883d',
          '600': '#9e6a03',
          '700': '#6e4601',
        },
        'info': {
          '400': '#58a6ff',
          '500': '#1f6feb',
        },
      },
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 229, 153, 0.4)',
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Space Mono'", "monospace"],
        sans: ["'Space Grotesk'", "'Inter'", "sans-serif"],
      },
      spacing: {
        'safe': 'env(safe-area-inset-bottom)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
