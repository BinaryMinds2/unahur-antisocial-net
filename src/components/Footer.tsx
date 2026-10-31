import { Link } from 'react-router-dom'
import TerminalIcon from './TerminalIcon'

export default function Footer() {
  return (
    <footer className="border-t border-matrix-border bg-matrix-card">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between py-8">
        <div className="flex w-full flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 font-mono font-bold transition-all hover:text-matrix-accent-hover hover:drop-shadow-[0_0_8px_rgba(0,204,82,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent focus-visible:ring-offset-2 focus-visible:ring-offset-matrix-card"
          >
            <TerminalIcon className="h-7 w-7 text-matrix-accent" />
            <span>
              <span className="block text-sm font-bold tracking-wider text-matrix-text">
                UNAHUR // ANTI-SOCIAL NET
              </span>
              <span className="block text-xs text-matrix-muted">
                conexión segura · comunidad universitaria
              </span>
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono font-bold text-xs text-matrix-muted">
            <Link
              to="/"
              className="transition-all hover:text-matrix-accent-hover hover:drop-shadow-[0_0_8px_rgba(0,204,82,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent focus-visible:ring-offset-2 focus-visible:ring-offset-matrix-card"
            >
              [ /inicio ]
            </Link>
            <Link
              to="/login"
              className="transition-all hover:text-matrix-accent-hover hover:drop-shadow-[0_0_8px_rgba(0,204,82,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent focus-visible:ring-offset-2 focus-visible:ring-offset-matrix-card"
            >
              [ /login ]
            </Link>
            <span className="text-matrix-border">|</span>
            <span>
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-matrix-accent shadow-[0_0_8px_theme(colors.matrix.accent)]" />
              sistema_online
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-matrix-border/60 px-4 py-4 text-center font-sans font-bold text-sm text-matrix-text transition-all duration-200 hover:text-matrix-accent sm:px-6 lg:px-8">
        © 2026 UnaHur Anti-Social-Net. Desarrollado por BinaryMinds.
      </div>
    </footer>
  )
}
