/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Superficies
        void: '#04081A',
        deep: '#050A1C',
        panel: '#0B1A3F',

        // Luz
        electric: '#2457FF',
        cyan: '#3FD0FF',

        // Texto
        frost: '#F2F6FF',
        mist: '#A9C0E8',
        steel: '#7C93BC',

        // Líneas
        line: '#7FA8FF',

        // Estado
        ok: '#2EE6A8',
        warn: '#FFC24B',
        danger: '#FF5C7A',
      },
      fontFamily: {
        display: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        dock: '0 24px 60px -24px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        'glow-cyan': '0 0 0 1px rgba(63, 208, 255, 0.35), 0 0 42px -10px rgba(63, 208, 255, 0.75)',
        'glow-blue': '0 22px 50px -18px rgba(36, 87, 255, 0.9)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(-3%, 4%, 0) scale(1.06)' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        drift: 'drift 20s ease-in-out infinite',
        rise: 'rise 420ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}
