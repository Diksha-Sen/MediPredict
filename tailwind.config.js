/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
      },
      colors: {
        brand: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
          400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
          800: '#1e3a5f', 900: '#0f1d33',
        },
        surface: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1' },
        accent: { green: '#059669', red: '#dc2626', amber: '#d97706', teal: '#0d9488' },
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        progress: { from: { width: '0' } },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease both',
        'slide-in': 'slideIn 0.4s ease both',
        'progress': 'progress 1.2s ease both',
      },
    },
  },
  plugins: [],
}
