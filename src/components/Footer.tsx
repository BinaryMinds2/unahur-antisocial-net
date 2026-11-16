import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function Footer() {
  const { pathname } = useLocation()
  const { user } = useAuth()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative z-10 border-t border-matrix-border bg-black/80 px-4 py-4 font-mono text-xs text-matrix-muted backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <span className="text-matrix-accent">&gt;</span>
          <span className="font-bold text-matrix-text">UNAHUR</span>
          <span>// anti-social_net_</span>
          <span className="hidden text-matrix-border sm:inline">|</span>
          <span className="rounded border border-matrix-accent/30 bg-matrix-accent/10 px-2 py-0.5 text-[11px] font-semibold text-matrix-accent">
            Binary Minds · 2026
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="rounded border border-matrix-border/70 bg-matrix-card/60 px-2 py-0.5 text-[11px] text-matrix-muted">
            pwd: <span className="text-matrix-accent">{pathname}</span>
          </span>

          <span className="hidden text-[11px] md:inline">
            node:{' '}
            <span className="text-matrix-text">
              {user ? `@${user.nickName}` : 'invitado'}
            </span>
          </span>

          <button
            type="button"
            onClick={scrollToTop}
            className="rounded border border-matrix-border px-2.5 py-1 text-[11px] text-matrix-accent transition hover:border-matrix-accent hover:bg-matrix-accent/10"
          >
            [ ^ top ]
          </button>
        </div>
      </div>
    </footer>
  )
}