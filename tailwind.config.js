/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        heading: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      colors: {
        df: {
          bg: 'var(--color-bg-base)',
          surface: 'var(--color-surface-solid)',
          border: 'var(--color-border)',
          text: 'var(--color-text-primary)',
          muted: 'var(--color-text-secondary)',
          faint: 'var(--color-text-tertiary)',
          primary: '#7C5CFF',
          'primary-hover': '#6A4AED',
          cyan: '#22D3EE',
          success: '#22C55E',
          danger: '#EF4444',
          warning: '#F59E0B',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        shimmer: 'shimmer 2s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

