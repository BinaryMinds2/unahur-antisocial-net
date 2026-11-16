import { motion } from 'motion/react'
import { Link, useLocation } from 'react-router-dom'

export default function NotFound() {
  const { pathname } = useLocation()

  return (
    <section className="relative flex min-h-[calc(100vh-80px)] w-full items-center justify-center overflow-hidden bg-matrix-bg px-4 py-12">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#10b9810a_1px,transparent_1px),linear-gradient(to_bottom,#10b9810a_1px,transparent_1px)] [background-size:3rem_3rem]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[360px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-matrix-accent/10 blur-[140px]" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-xl border border-matrix-border bg-matrix-card/85 shadow-[0_0_30px_rgba(16,185,129,0.08)] backdrop-blur-md transition-colors hover:border-matrix-accent/50"
      >
        <div className="flex items-center justify-between border-b border-matrix-border bg-black/70 px-4 py-2.5">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <span className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <span className="font-mono text-xs text-matrix-muted">
            bash -- error_404.sh
          </span>
          <span className="rounded border border-red-500/40 bg-red-950/40 px-2 py-0.5 font-mono text-[10px] text-red-400">
            [ ERR_404 ]
          </span>
        </div>

        <div className="p-6 text-center font-mono sm:p-8">
          <div className="mb-2 inline-flex items-center gap-1 text-xs text-matrix-accent">
            <span>&gt; ROUTE_NOT_FOUND</span>
            <span className="animate-pulse font-bold">_</span>
          </div>

          <p className="text-6xl font-bold tracking-tight text-matrix-accent drop-shadow-[0_0_20px_rgba(16,185,129,0.25)] sm:text-7xl">
            404
          </p>

          <h1 className="mt-4 text-lg font-bold text-matrix-text sm:text-xl">
            // esta ruta no existe en el sistema
          </h1>

          <div className="mx-auto mt-4 max-w-md rounded-lg border border-matrix-border/70 bg-black/50 px-3.5 py-2.5 text-left text-xs text-matrix-muted">
            <p className="truncate">
              <span className="text-red-400">!</span> destino:{' '}
              <span className="text-matrix-text">{pathname}</span>
            </p>
            <p className="mt-1">
              <span className="text-matrix-accent">&gt;</span> Revisá la URL o
              regresá al nodo principal.
            </p>
          </div>

          <Link
            to="/"
            className="mt-6 inline-block rounded-lg border border-matrix-accent/70 bg-matrix-accent/15 px-5 py-2.5 text-sm font-bold text-matrix-accent shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all duration-200 hover:border-matrix-accent hover:bg-matrix-accent hover:text-black hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent"
          >
            [ /volver_al_inicio ]
          </Link>
        </div>
      </motion.div>
    </section>
  )
}