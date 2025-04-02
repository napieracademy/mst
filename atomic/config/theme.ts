export const theme = {
  colors: {
    primary: {
      DEFAULT: '#E50914',
      hover: '#B1060F',
    },
    secondary: {
      DEFAULT: '#FFFFFF',
      hover: '#E5E5E5',
    },
    background: {
      DEFAULT: '#000000',
      card: 'rgba(0, 0, 0, 0.3)',
      cardHover: 'rgba(0, 0, 0, 0.5)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B3B3B3',
      accent: '#FFD700',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px',
  },
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  transitions: {
    default: '150ms ease-in-out',
    slow: '300ms ease-in-out',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  zIndex: {
    dropdown: 1000,
    modal: 1100,
    tooltip: 1200,
  },
} as const;

export type Theme = typeof theme; 