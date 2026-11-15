import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'

interface ConfirmActionModalProps {
  open: boolean
  title: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmActionModal({
  open,
  title,
  confirmLabel = '[ / aceptar ]',
  cancelLabel = '[ / cancelar ]',
  onConfirm,
  onCancel,
}: ConfirmActionModalProps) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-action-title"
            className="w-full max-w-md overflow-hidden rounded-xl border border-amber-500/50 bg-matrix-card/95 font-mono shadow-[0_0_35px_rgba(245,158,11,0.15)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-matrix-border bg-black/70 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-matrix-accent/80" />
                </div>
                <span className="text-xs text-matrix-muted">bash -- session_control.sh</span>
              </div>
              <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400">
                [ WARN ]
              </span>
            </div>

            <div className="p-6">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-400">
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
                  <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                  <line x1="12" x2="12" y1="2" y2="12" />
                </svg>
              </div>
              <div className="text-center text-xs text-amber-400">
                &gt; TERMINATE_SESSION_
              </div>
              <h2
                id="confirm-action-title"
                className="mt-1 text-center text-base font-bold text-matrix-text sm:text-lg"
              >
                // {title}
              </h2>
              <p className="mt-1 text-center text-xs text-matrix-muted">
                Se cerrará tu sesión actual en este navegador.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={onConfirm}
                  className="whitespace-nowrap rounded-lg border border-red-500/60 bg-red-500/15 px-4 py-2.5 text-xs font-bold text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] transition-all hover:bg-red-500 hover:text-black"
                >
                  {confirmLabel}
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="whitespace-nowrap rounded-lg border border-matrix-border bg-black/50 px-4 py-2.5 text-xs font-bold text-matrix-text transition-all hover:bg-zinc-800"
                >
                  {cancelLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
