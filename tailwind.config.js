/** @type {import('tailwindcss').Config} */
const color = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: color('background'),
        surface: color('surface'),
        'surface-muted': color('surface-muted'),
        card: color('card'),
        foreground: color('foreground'),
        muted: color('muted'),
        'muted-foreground': color('muted-foreground'),
        border: color('border'),
        primary: {
          DEFAULT: color('primary'),
          light: color('primary-light'),
          dark: color('primary-dark'),
        },
        success: color('success'),
        warning: color('warning'),
        error: color('error'),
        info: color('info'),
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
