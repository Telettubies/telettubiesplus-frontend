/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: 'var(--color-brand-primary, #1E3A5F)',
          hover: 'var(--color-brand-hover, #172E4D)',
          muted: 'var(--color-brand-muted, #334155)',
          accent: 'var(--color-brand-accent, #2563EB)',
        },
        surface: {
          page: 'var(--surface-page, #F8FAFC)',
          card: 'var(--surface-card, #FFFFFF)',
          subtle: 'var(--surface-subtle, #F1F5F9)',
          hover: 'var(--surface-hover, #F1F5F9)',
          border: 'var(--surface-border, #E2E8F0)',
        },
        status: {
          success: 'var(--color-status-success, #059669)',
          'success-bg': 'var(--color-status-success-bg, #ECFDF5)',
          'success-border': 'var(--color-status-success-border, #A7F3D0)',
          warning: 'var(--color-status-warning, #D97706)',
          'warning-bg': 'var(--color-status-warning-bg, #FFFBEB)',
          'warning-border': 'var(--color-status-warning-border, #FDE68A)',
          danger: 'var(--color-status-danger, #DC2626)',
          'danger-bg': 'var(--color-status-danger-bg, #FEF2F2)',
          'danger-border': 'var(--color-status-danger-border, #FECACA)',
          info: 'var(--color-status-info, #2563EB)',
          'info-bg': 'var(--color-status-info-bg, #EFF6FF)',
          'info-border': 'var(--color-status-info-border, #BFDBFE)',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(15, 23, 42, 0.03), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
        elevated: '0 12px 28px -6px rgba(15, 23, 42, 0.07), 0 4px 10px -4px rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
};
