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
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
        >
          <button
            type="button"
            className="absolute inset-0 h-full w-full cursor-default"
            aria-label="Cerrar aviso de inicio de sesión"
            onClick={onClose}
          />
          <motion.section
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-required-title"
            className="relative z-10 w-[min(92vw,560px)] rounded-2xl border border-matrix-border bg-[#111d2d]/95 p-6 shadow-[0_0_26px_rgba(16,185,129,0.2)]"
          >
            <div className="text-center">
              <h2
                id="auth-required-title"
                className="font-mono text-base font-bold text-matrix-text sm:text-lg"
              >
                Iniciá sesión para seguir a esta persona
              </h2>
              <p className="mt-2 font-mono text-sm text-matrix-muted">
                Elegí una opción para continuar.
              </p>
              <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  to="/login"
                  onClick={onClose}
                  className="rounded border border-matrix-accent bg-matrix-accent/10 px-6 py-3 font-mono text-sm font-bold text-matrix-accent transition hover:bg-matrix-accent/20 hover:shadow-[0_0_12px_rgba(16,185,129,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent"
                >
                  [ /login ]
                </Link>
                <Link
                  to="/register"
                  onClick={onClose}
                  className="rounded border border-matrix-accent/60 bg-green-700/60 px-6 py-3 font-mono text-sm font-bold text-white shadow-sm transition hover:bg-green-600 hover:shadow-[0_0_15px_rgba(0,204,82,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent"
                >
                  [ /registrarse ]
                </Link>
              </div>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
