/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#ffffff',
        text: '#111827',
        muted: '#6b7280',
        line: '#e5e7eb',
        brand: '#111827',
        pill: '#f3f4f6',
        pillText: '#374151',
        hover: '#f9fafb',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Inter', 'Helvetica Neue', 'Arial'],
      },
      spacing: {
        '18': '4.5rem',
        '28': '7rem',
      },
    },
  },
  plugins: [],
}