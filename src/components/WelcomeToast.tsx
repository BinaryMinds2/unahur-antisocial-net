import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useAuth } from '../context/useAuth'

export default function WelcomeToast() {
  const { welcomeUser, dismissWelcomeToast } = useAuth()

  return createPortal(
    <AnimatePresence>
      {welcomeUser && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-sm overflow-hidden rounded-xl border border-matrix-accent/70 bg-matrix-card/95 font-mono shadow-[0_0_30px_rgba(0,255,102,0.22)] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between border-b border-matrix-accent/30 bg-black/75 px-3.5 py-2">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-matrix-accent" />
            </div>
            <span className="text-[11px] text-matrix-muted">
              bash -- auth_session.sh
            </span>
            <button
              type="button"
              onClick={dismissWelcomeToast}
              aria-label="Cerrar notificación de bienvenida"
              className="rounded border border-matrix-border px-1.5 py-0.5 text-[10px] text-matrix-muted transition-colors hover:border-matrix-accent hover:text-matrix-accent"
            >
              [×]
            </button>
          </div>

          <div className="flex items-start gap-3 p-4">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-matrix-accent/60 bg-matrix-accent/15 text-matrix-accent">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-matrix-accent">
                  &gt; SESSION_ACTIVE_
                </span>
                <span className="rounded border border-matrix-accent/30 bg-matrix-accent/10 px-1.5 py-0.5 text-[10px] text-matrix-accent">
                  [ 200_OK ]
                </span>
              </div>
              <p className="text-xs leading-relaxed text-matrix-text">
                Sesión iniciada. Bienvenido/a,{' '}
                <span className="font-bold text-matrix-accent">
                  @{welcomeUser}
                </span>
                .
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}