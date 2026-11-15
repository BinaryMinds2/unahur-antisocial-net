import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Link } from 'react-router-dom'

interface AuthRequiredModalProps {
  open: boolean
  onClose: () => void
}

export default function AuthRequiredModal({
  open,
  onClose,
}: AuthRequiredModalProps) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-required-title"
            className="w-full max-w-md overflow-hidden rounded-xl border border-matrix-accent/60 bg-matrix-card/95 font-mono shadow-[0_0_40px_rgba(16,185,129,0.2)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-matrix-border bg-black/70 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-matrix-accent/80" />
                </div>
                <span className="text-xs text-matrix-muted">bash -- auth_required.sh</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar aviso de inicio de sesión"
                className="font-mono text-xs text-matrix-muted transition hover:text-matrix-accent"
              >
                [ × ]
              </button>
            </div>

            <div className="p-6">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-matrix-accent/50 bg-matrix-accent/15 text-matrix-accent">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              </div>
              <div className="text-center text-xs text-matrix-accent">
                &gt; ACCESS_DENIED_
              </div>
              <h2
                id="auth-required-title"
                className="mt-1 text-center text-base font-bold text-matrix-text sm:text-lg"
              >
                Iniciá sesión para seguir a esta persona
              </h2>
              <p className="mt-1 text-center text-xs text-matrix-muted">
                Elegí una opción para continuar.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={onClose}
                  className="flex items-center justify-center whitespace-nowrap rounded-lg border border-matrix-accent bg-matrix-accent/20 px-4 py-2.5 text-xs font-bold text-matrix-accent transition-all hover:bg-matrix-accent hover:text-black hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  [ /login ]
                </Link>
                <Link
                  to="/register"
                  onClick={onClose}
                  className="flex items-center justify-center whitespace-nowrap rounded-lg border border-matrix-border bg-black/50 px-4 py-2.5 text-xs font-bold text-matrix-text transition-all hover:border-matrix-accent/60 hover:bg-matrix-accent/15 hover:text-matrix-accent"
                >
                  [ /registrarse ]
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
