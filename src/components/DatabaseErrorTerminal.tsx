import { motion, type Variants } from 'motion/react'
import { API_URL } from '../services/api'

interface DatabaseErrorTerminalProps {
  error?: string
  onRetry?: () => void
}

const logVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
}

const terminalVariants: Variants = {
  hidden: { opacity: 0, y: 12, x: 0 },
  visible: {
    opacity: 1,
    y: 0,
    x: [0, -3, 3, -2, 2, 0],
    transition: {
      duration: 0.55,
      ease: 'easeOut',
      x: { duration: 0.35, delay: 0.15 },
      staggerChildren: 0.12,
    },
  },
}

export default function DatabaseErrorTerminal({
  error,
  onRetry,
}: DatabaseErrorTerminalProps) {
  return (
    <motion.div
      variants={terminalVariants}
      initial="hidden"
      animate="visible"
      role="alert"
      className="my-6 max-w-2xl mx-auto overflow-hidden rounded-xl border border-red-500/50 bg-matrix-card/80 shadow-[0_0_30px_rgba(239,68,68,0.15)] backdrop-blur-md"
    >
      <div className="flex items-center justify-between border-b border-red-500/30 bg-black/70 px-4 py-2.5">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/50" />
          <span className="h-3 w-3 rounded-full bg-zinc-700" />
        </div>
        <span className="font-mono text-xs text-red-400/90">
          bash -- db_diagnostic.sh
        </span>
        <span className="rounded border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-mono text-[10px] text-red-400">
          [ ERR_503 ]
        </span>
      </div>

      <motion.div
        variants={logVariants}
        className="space-y-3 p-6 font-mono text-xs sm:text-sm"
      >
        <motion.div
          variants={logVariants}
          className="flex items-center gap-2 font-bold text-red-400"
        >
          <span>[CRITICAL_ERROR]</span>
          <span className="font-normal text-matrix-muted">
            No se pudo completar la solicitud a la API...
          </span>
        </motion.div>

        <motion.div
          variants={logVariants}
          className="space-y-2 rounded-r-lg border-l-2 border-red-500 bg-black/60 p-4"
        >
          <p className="text-red-300">
            <span className="mr-2 font-bold text-red-500">&gt; [EN]:</span>
            &quot;The API request failed.&quot;
          </p>
          <p className="text-matrix-text">
            <span className="mr-2 font-bold text-red-500">&gt; [ES]:</span>
            &quot;No se pudo completar la solicitud al servidor.&quot;
          </p>
        </motion.div>

        {error && (
          <motion.p variants={logVariants} className="text-red-300/80">
            <span className="mr-2 font-bold text-red-500">&gt; [DETAIL]:</span>
            {error}
          </motion.p>
        )}

        <motion.div
          variants={logVariants}
          className="space-y-1 pt-1 text-xs text-matrix-muted"
        >
          <p className="text-yellow-400/90">&gt; DIAGNOSTIC_HINT:</p>
          <p className="pl-3">
            1. Verificá que el servidor backend esté corriendo en{' '}
            <code className="rounded bg-black/50 px-1.5 py-0.5 text-matrix-accent">
              {API_URL}
            </code>
            .
          </p>
          <p className="pl-3">
            2. Ejecutá{' '}
            <code className="rounded bg-black/50 px-1.5 py-0.5 text-matrix-accent">
              npm run dev:all
            </code>{' '}
            en la terminal de este proyecto.
          </p>
        </motion.div>

        {onRetry && (
          <motion.button
            variants={logVariants}
            type="button"
            onClick={onRetry}
            className="rounded border border-red-500/50 bg-red-500/10 px-4 py-2 font-mono text-xs text-red-300 transition-colors hover:bg-red-500/20 hover:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            [ reintentar_conexión ]
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  )
}
