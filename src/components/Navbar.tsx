import { motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import TerminalIcon from './TerminalIcon'

const CHARS = '01#$@!%&*<>?/'
const TARGET_TEXT = 'anti-social_net'

function HackerTextWave() {
  const [displayText, setDisplayText] = useState(TARGET_TEXT)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const scramble = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    let iteration = 0
    intervalRef.current = setInterval(() => {
      setDisplayText(
        TARGET_TEXT.split('')
          .map((letter, index) => {
            if (letter === ' ' || letter === '_') return letter
            if (index < iteration) return TARGET_TEXT[index]
            return CHARS[Math.floor(Math.random() * CHARS.length)]
          })
          .join(''),
      )

      if (iteration >= TARGET_TEXT.length) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
      iteration += 1 / 2
    }, 30)
  }, [])

  useEffect(() => {
    scramble()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [scramble])

  return (
    <span onMouseEnter={scramble} className="inline-flex cursor-pointer">
      <motion.span
        animate={{ backgroundPosition: ['0% 50%', '200% 50%'] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
        className="inline-block bg-[linear-gradient(90deg,#a7f3d0,#00ff66,#34d399,#ffffff,#00ff66)] bg-[length:200%_auto] bg-clip-text font-mono font-bold text-transparent"
      >
        {displayText}
      </motion.span>
      <motion.span
        aria-hidden="true"
        animate={{ opacity: [1, 0.25, 1] }}
        transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
        className="font-mono font-bold text-matrix-accent"
      >
        _
      </motion.span>
    </span>
  )
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded border px-3 py-2 font-mono font-bold text-sm transition-all hover:shadow-[0_0_10px_rgba(0,204,82,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent focus-visible:ring-offset-2 focus-visible:ring-offset-matrix-bg ${
    isActive
      ? 'border-matrix-accent bg-matrix-accent/10 text-matrix-accent'
      : 'border-transparent text-matrix-muted hover:border-matrix-accent-hover hover:text-matrix-accent-hover'
  }`

export default function Navbar() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-matrix-border/80 bg-matrix-bg/85 backdrop-blur-md">
      <nav className="py-4" aria-label="Navegación principal">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link
            to="/"
            className="group flex items-center gap-3 font-mono font-bold text-matrix-text transition-all hover:text-matrix-accent-hover hover:drop-shadow-[0_0_8px_rgba(0,204,82,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent focus-visible:ring-offset-2 focus-visible:ring-offset-matrix-bg"
            aria-label="UnaHur Anti-Social Net - Inicio"
            onClick={closeMenu}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded border border-matrix-accent/50 bg-matrix-card text-matrix-accent transition-colors group-hover:border-matrix-accent">
              <TerminalIcon />
            </span>
            <span className="text-sm font-bold tracking-wider">
              <span className="text-matrix-text">UNAHUR</span>
              <span className="text-matrix-accent"> //</span>{' '}
              <HackerTextWave />
            </span>
          </Link>

          <button
            type="button"
            className="rounded border border-matrix-border p-2 font-bold text-matrix-muted transition-all hover:border-matrix-accent-hover hover:text-matrix-accent-hover hover:shadow-[0_0_10px_rgba(0,204,82,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent focus-visible:ring-offset-2 focus-visible:ring-offset-matrix-bg md:hidden"
            aria-label="Abrir menú de navegación"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          >
            <span className="block h-0.5 w-5 bg-current" />
            <span className="my-1 block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
          </button>

          <div
            className={`${isMenuOpen ? 'flex' : 'hidden'} absolute left-4 right-4 top-16 flex-col gap-3 rounded border border-matrix-border bg-matrix-card p-4 shadow-lg md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
          >
            <NavLink to="/" end className={navLinkClass} onClick={closeMenu}>
              [ /inicio ]
            </NavLink>
            {user ? (
              <>
                <NavLink to="/create-post" className={navLinkClass} onClick={closeMenu}>
                  [ +publicar ]
                </NavLink>
                <NavLink to="/profile" className={navLinkClass} onClick={closeMenu}>
                  [ @{user.nickName} ]
                </NavLink>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded border border-matrix-border px-3 py-2 font-mono font-bold text-sm text-matrix-muted transition-all hover:border-red-400/60 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent focus-visible:ring-offset-2 focus-visible:ring-offset-matrix-bg"
                >
                  [ /salir ]
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass} onClick={closeMenu}>
                  [ /login ]
                </NavLink>
                <NavLink
                  to="/register"
                  className={navLinkClass}
                  onClick={closeMenu}
                >
                 [ /registrarse ]
                </NavLink>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
