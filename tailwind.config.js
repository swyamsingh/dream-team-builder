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
        // Design tokens (light/dark provided via CSS vars, these are fallbacks)
        'brand-primary': { DEFAULT: 'hsl(var(--color-brand-primary) / <alpha-value>)' },
        'brand-accent': { DEFAULT: 'hsl(var(--color-brand-accent) / <alpha-value>)' },
        success: { DEFAULT: 'hsl(var(--color-success) / <alpha-value>)' },
        warning: { DEFAULT: 'hsl(var(--color-warning) / <alpha-value>)' },
        error: { DEFAULT: 'hsl(var(--color-error) / <alpha-value>)' },
        surface: 'hsl(var(--color-surface) / <alpha-value>)',
        surfaceAlt: 'hsl(var(--color-surface-alt) / <alpha-value>)',
        background: 'hsl(var(--color-background) / <alpha-value>)',
        border: 'hsl(var(--color-border) / <alpha-value>)',
        foreground: 'hsl(var(--color-foreground) / <alpha-value>)',
        muted: {
          DEFAULT: 'hsl(var(--color-muted) / <alpha-value>)',
          subtle: 'hsl(var(--color-muted-subtle) / <alpha-value>)'
        }
      },
      spacing: {
        '0': '0px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '32px',
        '8': '40px',
        '9': '48px',
        '10': '64px'
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '16px',
        full: '999px'
      },
      fontSize: {
        // Typography scale per spec
        h1: ['1.875rem', { lineHeight: '2.25rem', fontWeight: '600' }], // text-3xl
        h2: ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }], // text-xl
        h3: ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase' }],
        body: ['0.875rem', { lineHeight: '1.4rem', fontWeight: '400' }],
        caption: ['0.75rem', { lineHeight: '1rem', fontWeight: '500', letterSpacing: '0.08em', textTransform: 'uppercase' }]
      },
      boxShadow: {
        elevation1: '0 1px 2px 0 rgba(0,0,0,0.5)',
        elevation2: '0 4px 8px -2px rgba(0,0,0,0.45)',
        elevation3: '0 8px 24px -4px rgba(0,0,0,0.5)'
      },
      transitionDuration: {
        DEFAULT: '150ms'
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4,0,0.2,1)'
      }
    }
  },
  plugins: []
};
