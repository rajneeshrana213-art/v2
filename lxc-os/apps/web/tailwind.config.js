/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        brand: {
          'primary-dark': '#071B2C',
          'primary-blue': '#2C81B4',
          'secondary-blue': '#224662',
          'accent-green': '#75B96D',
          'bg-light': '#FFFFFF',
          'bg-dark': '#071B2C',
          'text-dark': '#071B2C',
          'text-light': '#FFFFFF',
          'text-muted': '#9FB3C8',
          'border': '#1E3A52',
          'gradient-start': '#071B2C',
          'gradient-mid': '#2C81B4',
          'gradient-end': '#75B96D',
        },
        primary: '#6366f1',
        secondary: '#10b981',
      },
      animation: {
        'gradient': 'gradient 3s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        glow: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 }
        }
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

