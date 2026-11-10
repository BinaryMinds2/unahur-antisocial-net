import type { ReactNode } from 'react'
import { motion, type Variants } from 'motion/react'

interface AuthTerminalLayoutProps {
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}

const terminalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.15,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -15 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
}

export default function AuthTerminalLayout({
  title,
  description,
  children,
  footer,
}: AuthTerminalLayoutProps) {
  return (
    <section className="relative flex min-h-[calc(100vh-140px)] items-center justify-center overflow-hidden bg-[linear-gradient(to_right,#10b9810a_1px,transparent_1px),linear-gradient(to_bottom,#10b9810a_1px,transparent_1px)] bg-[size:3rem_3rem] px-4 py-10">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-matrix-accent/10 blur-[120px]" />
      <div className="relative z-10 mx-auto grid w-full max-w-4xl grid-cols-1 items-center gap-6 lg:grid-cols-2">
        <motion.div
          variants={terminalVariants}
          initial="hidden"
          animate="visible"
          className="group relative hidden cursor-pointer flex-col gap-4 overflow-hidden rounded-xl border border-matrix-border bg-matrix-card/60 p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-[1.01] hover:border-matrix-accent/70 hover:border-l-matrix-accent hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] lg:flex"
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-matrix-accent/5 blur-3xl" />
          <motion.div variants={itemVariants} className="relative">
            <div className="mb-3 flex items-center gap-1 font-mono text-xs text-matrix-accent/80">
              <span>&gt; INITIALIZING PROTOCOL</span>
              <span className="animate-pulse font-bold text-matrix-accent">_</span>
            </div>
            <motion.h2
              animate={{
                opacity: [1, 0.85, 1, 0.9, 1],
                textShadow: [
                  '0 0 5px rgba(16,185,129,0.3)',
                  '0 0 15px rgba(16,185,129,0.7)',
                  '0 0 5px rgba(16,185,129,0.3)',
                ],
              }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="font-mono text-lg font-bold text-matrix-accent"
            >
              UNAHUR Anti-Social Network v2.4
            </motion.h2>
          </motion.div>

          <motion.div variants={itemVariants} className="relative space-y-3">
            <motion.div
              variants={itemVariants}
              className="space-y-1 rounded border border-matrix-border/40 bg-black/40 p-3 font-mono text-xs text-matrix-muted"
            >
              <p className="font-bold text-matrix-accent/80">&gt; METRICAS_RED</p>
              <motion.div
                animate={{ opacity: [0.7, 1, 0.7], x: [0, 2, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="space-y-1"
              >
                <p>[ CPU_LOAD: 14% ]</p>
                <p>[ LATENCY: 12ms ]</p>
              </motion.div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="space-y-1 rounded border border-matrix-border/50 bg-black/40 p-3 font-mono text-xs text-matrix-muted"
            >
              <p className="text-matrix-accent">[INFO] Conexión establecida con node_server...</p>
              <p>[SEC] Canal encriptado (SSL/TLS)</p>
            </motion.div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="relative mt-2 flex items-center gap-2 font-mono text-xs text-matrix-accent"
          >
            <motion.span
              animate={{
                scale: [1, 1.3, 1],
                boxShadow: [
                  '0 0 4px rgba(16,185,129,0.6)',
                  '0 0 12px rgba(16,185,129,1)',
                  '0 0 4px rgba(16,185,129,0.6)',
                ],
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="inline-block h-2.5 w-2.5 rounded-full bg-matrix-accent"
            />
            <span>[ STATUS: SYSTEM_READY ]</span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="overflow-hidden rounded-xl border border-matrix-border bg-matrix-card/90 shadow-[0_0_30px_rgba(16,185,129,0.08)] backdrop-blur"
        >
          <div className="flex items-center justify-between border-b border-matrix-border bg-black/60 px-4 py-2.5">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-green-500/80" />
            </div>
            <span className="font-mono text-xs text-matrix-muted">bash -- auth_system.sh</span>
            <span className="w-[3.75rem]" aria-hidden="true" />
          </div>

          <div className="p-6">
            <h2 className="mb-2 font-mono text-xl font-bold text-matrix-accent">{title}</h2>
            <p className="mb-6 font-mono text-xs text-matrix-muted">{description}</p>
            {children}
            {footer}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
