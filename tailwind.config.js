/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Semantic palette
        primary: {
          DEFAULT: '#2563EB', // blue-600 base CTA
          hover: '#1D4ED8',
          fg: '#FFFFFF'
        },
        secondary: {
          DEFAULT: '#6B7280',
          hover: '#4B5563',
          fg: '#FFFFFF'
        },
        accent: {
          DEFAULT: '#F59E0B',
          fg: '#1F2937'
        },
        surface: '#111316',
  surfaceAlt: '#1A1D21',
        background: '#0B0C0D',
        border: '#1E2226',
  foreground: '#F5F5F5',
  muted: { DEFAULT: '#9CA3AF', subtle: '#6B7280' },
        success: { light: '#DCFCE7', DEFAULT: '#16A34A', dark: '#15803D' },
        warning: { light: '#FEF9C3', DEFAULT: '#D97706', dark: '#B45309' },
        error: { light: '#FEE2E2', DEFAULT: '#DC2626', dark: '#B91C1C' },
        info: { light: '#E0F2FE', DEFAULT: '#0284C7', dark: '#0369A1' }
      },
      spacing: {
        s0: '0px', s1: '4px', s2: '8px', s3: '12px', s4: '16px', s5: '24px', s6: '32px', s7: '40px', s8: '48px', s9: '64px'
      },
      borderRadius: {
        none: '0px', DEFAULT: '4px', card: '8px', pill: '999px'
      },
      fontSize: {
        h1: ['32px', '40px'],
        h2: ['24px', '32px'],
        h3: ['20px', '28px'],
        h4: ['18px', '26px'],
        body: ['16px', '24px'],
        small: ['14px', '20px'],
        micro: ['12px', '16px']
      },
      boxShadow: {
        elevation1: '0 1px 2px 0 rgba(0,0,0,0.5)',
        elevation2: '0 4px 12px -2px rgba(0,0,0,0.45)',
        elevation3: '0 8px 24px -4px rgba(0,0,0,0.5)'
      },
      transitionDuration: {
        micro: '80ms', standard: '160ms', emphasized: '240ms'
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.4,0,0.2,1)',
        emphasized: 'cubic-bezier(0.4,0,0.6,1)'
      }
    }
  },
  plugins: []
};
