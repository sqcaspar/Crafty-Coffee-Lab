/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Monochrome Design System
        mono: {
          white: '#FFFFFF',
          50: '#F8F9FA',    // Lightest grey
          100: '#E9ECEF',   // Very light grey
          200: '#DEE2E6',   // Light grey
          300: '#CED4DA',   // Medium-light grey
          400: '#ADB5BD',   // Medium grey
          500: '#6C757D',   // Medium-dark grey
          600: '#495057',   // Dark grey
          700: '#343A40',   // Darker grey
          800: '#212529',   // Very dark grey
          900: '#000000',   // Pure black
        },
        // Stone tones for warmth
        stone: {
          50: '#F5F5F4',    // Warm light
          100: '#E7E5E4',   // Warm medium-light
          200: '#D6D3D1',   // Warm medium
        },
        // Keep existing for backwards compatibility during transition
        primary: {
          50: '#F8F9FA',
          100: '#E9ECEF',
          500: '#000000',
          600: '#000000',
          700: '#000000',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        // Design system spacing - 24px base unit
        'gutter': '24px',      // Grid gutters
        'gutter-sm': '12px',   // Small gutters
        'gutter-lg': '48px',   // Large gutters
        'section': '80px',     // Section spacing
        'hero': '120px',       // Hero section spacing
      },
      // 12-column grid system
      gridTemplateColumns: {
        'design': 'repeat(12, 1fr)',
      },
      gap: {
        'gutter': '24px',
        'gutter-sm': '12px',
        'gutter-lg': '48px',
      },
      // Typography scale
      fontSize: {
        'hero': ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],    // 56px
        'h1': ['2.5rem', { lineHeight: '1.2', fontWeight: '600' }],      // 40px
        'h2': ['2rem', { lineHeight: '1.3', fontWeight: '600' }],        // 32px
        'h3': ['1.5rem', { lineHeight: '1.4', fontWeight: '500' }],      // 24px
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }], // 18px
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],      // 16px
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }], // 14px
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }], // 12px
      },
      animation: {
        // Existing animations
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
        
        // Monochrome UI specific animations
        'hover-lift': 'hoverLift 0.2s ease-out',
        'hover-depress': 'hoverDepress 0.15s ease-in-out',
        'scale-up': 'scaleUp 0.2s ease-out',
        'accordion-open': 'accordionOpen 0.3s ease-out',
        'accordion-close': 'accordionClose 0.3s ease-in',
        'skeleton-pulse': 'skeletonPulse 2s ease-in-out infinite',
        'tab-transition': 'tabTransition 0.25s ease-in-out',
      },
      keyframes: {
        // Existing keyframes
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        
        // Monochrome UI keyframes
        hoverLift: {
          '0%': { transform: 'translateY(0) scale(1)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' },
          '100%': { transform: 'translateY(-2px) scale(1.02)', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)' },
        },
        hoverDepress: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.98)' },
          '100%': { transform: 'scale(1)' },
        },
        scaleUp: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.08)' },
        },
        accordionOpen: {
          '0%': { height: '0', opacity: '0' },
          '100%': { height: 'auto', opacity: '1' },
        },
        accordionClose: {
          '0%': { height: 'auto', opacity: '1' },
          '100%': { height: '0', opacity: '0' },
        },
        skeletonPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        tabTransition: {
          '0%': { transform: 'translateX(-4px)', opacity: '0.7' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}