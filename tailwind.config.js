/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#10201d',
        mint: '#0f766e',
        limewash: '#f3f8ef',
        paper: '#fbfcf8',
        coral: '#d95f43',
        gold: '#b98219'
      },
      boxShadow: {
        soft: '0 18px 45px rgba(16, 32, 29, 0.08)'
      }
    }
  },
  plugins: []
};
