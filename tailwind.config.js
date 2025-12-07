/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        scientific: ['"Times New Roman"', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', "Liberation Mono", "Courier New", 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-in-out',
        'slide-up': 'slideUp 1s ease-out',
        'slide-up-fade': 'slideUpFade 0.5s ease-out forwards',
        'slide-down-fade': 'slideDownFade 0.5s ease-out forwards',
        'bounce-slow': 'bounce 2s infinite',
        'shimmer': 'shimmer 5s infinite',
        'pulse-orange': 'pulseOrange 3s infinite',
        'scan': 'scan 3s linear infinite',
        // Изменили скорость: 240s (было 120s)
        'pan-diagonal': 'panDiagonal 240s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(40px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideUpFade: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDownFade: { '0%': { transform: 'translateY(-20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        pulseOrange: { '0%, 100%': { borderColor: 'rgba(255, 255, 255, 0.1)' }, '50%': { borderColor: 'rgba(234, 88, 12, 0.6)' } },
        shimmer: { '0%': { transform: 'translateX(-150%) skewX(-12deg)' }, '100%': { transform: 'translateX(150%) skewX(-12deg)' } },
        scan: { '0%': { top: '-10%', opacity: '0' }, '100%': { top: '110%', opacity: '0' } },
        panDiagonal: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(-25%, -25%)' } // Уменьшили сдвиг, чтобы реже повторялся паттерн движения
        }
      }
    },
  },
  plugins: [],
}