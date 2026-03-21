/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'body': ['Montserrat', 'sans-serif'],
        'display': ['Creepster', 'cursive'],
        'accent': ['Permanent Marker', 'cursive'],
      },
      colors: {
        // Dark theme - Pure blacks & deep charcoals
        dark: {
          950: '#000000',  // Pure black
          900: '#0A0A0A',  // Near black
          850: '#121212',  // Very dark gray
          800: '#1A1A1A',  // Dark charcoal
          700: '#2D2D2D',
          600: '#3D3D3D',
          500: '#4D4D4D',
          400: '#6D6D6D',
          300: '#8D8D8D',
        },
        // Gold accents - Premium feel
        gold: {
          50: '#FFFEF7',
          100: '#FFF9E6',
          200: '#FFF0C2',
          300: '#FFE99D',
          400: '#FFD966',
          500: '#D4AF37',
          600: '#C5A028',
          700: '#A68519',
          800: '#876B0B',
          900: '#695200',
        },
        // Blood red - Tattoo ink vibe
        blood: {
          50: '#FFE5E5',
          100: '#FFCCCC',
          200: '#FF9999',
          300: '#FF6666',
          400: '#FF3333',
          500: '#DC143C',
          600: '#B71C1C',
          700: '#8B0000',
          800: '#660000',
          900: '#4D0000',
        },
        // Electric cyan - Neon highlights
        neon: {
          50: '#E0FFFF',
          100: '#B3FFFF',
          200: '#80FFFF',
          300: '#4DFFFF',
          400: '#1AFFFF',
          500: '#00E5FF',
          600: '#00B8D4',
          700: '#0097A7',
          800: '#00838F',
          900: '#006064',
        },
        // Purple accents
        purple: {
          50: '#F3E5FF',
          100: '#E1BEE7',
          200: '#CE93D8',
          300: '#BA68C8',
          400: '#AB47BC',
          500: '#9D00FF',
          600: '#8E24AA',
          700: '#7B1FA2',
          800: '#6A1B9A',
          900: '#4A148C',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      minHeight: {
        'screen-75': '75vh',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
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
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 20px -5px rgba(0, 0, 0, 0.04)',
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.5), 0 0 40px rgba(212, 175, 55, 0.3)',
        'glow-red': '0 0 20px rgba(220, 20, 60, 0.5), 0 0 40px rgba(220, 20, 60, 0.3)',
        'glow-neon': '0 0 20px rgba(0, 229, 255, 0.5), 0 0 40px rgba(0, 229, 255, 0.3)',
        'inner-dark': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}