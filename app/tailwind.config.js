/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: '#F5F5F7',
          dark: '#000000',
        },
        card: {
          light: 'rgba(255, 255, 255, 0.8)',
          dark: 'rgba(28, 28, 30, 0.8)',
        },
        accent: {
          blue: '#007AFF',
          green: '#34C759',
          orange: '#FF9500',
          red: '#FF3B30',
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
