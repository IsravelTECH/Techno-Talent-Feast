/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#03A695',
          tealDark: '#008C7E',
          tealLight: '#E6F7F5',
          navy: '#0B2545',
          darkBlue: '#022B3A',
          blue: '#0057B8',
          orange: '#FD5E01',
          orangeLight: '#FF7A00',
          bg: '#F7FCFB',
          darkText: '#0A1128',
          secondaryText: '#5B6B7C',
          border: '#D8EBE7',
          success: '#16A34A',
          warning: '#F59E0B',
          danger: '#DC2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 12px rgba(3, 166, 149, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 12px 28px -6px rgba(3, 166, 149, 0.12), 0 8px 12px -6px rgba(11, 37, 69, 0.05)',
        'glow-teal': '0 0 20px rgba(3, 166, 149, 0.25)',
        'glow-orange': '0 0 20px rgba(253, 94, 1, 0.3)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      }
    },
  },
  plugins: [],
}
