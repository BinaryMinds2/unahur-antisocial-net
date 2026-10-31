/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        matrix: {
          bg: '#020617',        // slate-950 (fondo general)
          card: '#0f172a',      // slate-900 (tarjetas y contenedores)
          border: '#1e293b',    // slate-800 (bordes)
          accent: '#00ff66',    // Verde neón/consola vibrante y claro
          'accent-hover': '#00cc52', // Verde neón ligeramente más oscuro para hover
          text: '#f8fafc',      // slate-100 (texto principal)
          muted: '#94a3b8',     // slate-400 (texto secundario)
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"Space Grotesk"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}