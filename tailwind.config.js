/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a0f',
          800: '#12121a',
          700: '#1a1a2e',
          600: '#232340',
          500: '#2d2d50',
        },
        sos: {
          red: '#ff2d55',
          orange: '#ff9500',
          yellow: '#ffcc00',
          green: '#34c759',
          blue: '#007aff',
          purple: '#af52de',
        }
      },
      animation: {
        'pulse-sos': 'pulseSOS 1.5s ease-in-out infinite',
        'slide-down': 'slideDown 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseSOS: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(255, 45, 85, 0.7)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 30px 10px rgba(255, 45, 85, 0.4)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(255, 45, 85, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(255, 45, 85, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
