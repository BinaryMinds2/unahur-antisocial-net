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
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-[min(92vw,560px)] rounded-2xl border border-matrix-border bg-[#111d2d]/95 p-6 shadow-[0_0_26px_rgba(16,185,129,0.2)]"
          >
            <div className="mb-6 text-center font-mono text-[18px] font-semibold text-matrix-text">
              // {title}
            </div>

            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={onConfirm}
                className="rounded border border-matrix-accent bg-matrix-accent/10 px-3 py-2 font-mono text-sm font-bold text-matrix-accent transition hover:border-matrix-accent hover:bg-matrix-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent focus-visible:ring-offset-2 focus-visible:ring-offset-matrix-bg"
              >
                {confirmLabel}
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="rounded border border-matrix-border bg-matrix-bg/70 px-3 py-2 font-mono text-sm font-bold text-matrix-text transition hover:border-matrix-accent hover:text-matrix-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent focus-visible:ring-offset-2 focus-visible:ring-offset-matrix-bg"
              >
                {cancelLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
