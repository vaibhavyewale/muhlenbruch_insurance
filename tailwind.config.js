/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {
    colors: { naturally: { green: '#6A8F4A', dark: '#2E4018', light: '#F4F7F2', pale: '#E8EFE5' } },
    fontFamily: { serif: ['Playfair Display', 'serif'], sans: ['Inter', 'sans-serif'] }
  } },
  plugins: []
}
