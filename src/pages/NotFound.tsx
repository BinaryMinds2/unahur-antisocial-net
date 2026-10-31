import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="py-24 text-center font-mono">
      <p className="text-6xl font-bold text-matrix-accent">404</p>
      <h1 className="mt-4 text-xl font-bold text-matrix-text">
        Esta ruta no existe en el sistema
      </h1>
      <p className="mt-2 text-sm text-matrix-muted">
        Revisá la URL o volvé al inicio.
      </p>
      <Link
        to="/"
        className="focus-ring mt-8 inline-block rounded border border-matrix-accent px-4 py-2 text-sm font-bold text-matrix-accent transition-all hover:bg-matrix-accent/10"
      >
        [ /volver_al_inicio ]
      </Link>
    </section>
  )
}