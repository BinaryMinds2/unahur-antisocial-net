import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import ConfirmActionModal from './ConfirmActionModal'
import TerminalIcon from './TerminalIcon'

const CHARS = '01#$@!%&*<>?/'
const TARGET_TEXT = 'anti-social_net'

function HackerTextWave() {
  const [displayText, setDisplayText] = useState(TARGET_TEXT)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const scramble = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)

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
      if (intervalRef.current) clearInterval(intervalRef.current)
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

const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 rounded-lg border-l-2 border-transparent px-3 py-2.5 font-mono text-sm transition-all duration-200 hover:border-matrix-accent hover:bg-matrix-accent/10 hover:text-matrix-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-matrix-accent ${
    isActive ? 'border-matrix-accent bg-matrix-accent/10 text-matrix-accent' : 'text-matrix-text'
  }`

const registerLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded border border-matrix-accent/60 bg-green-700/60 px-4 py-2 font-mono font-bold text-sm text-white transition-all shadow-sm hover:bg-green-600 hover:shadow-[0_0_15px_rgba(0,204,82,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent focus-visible:ring-offset-2 focus-visible:ring-offset-matrix-bg ${
    isActive ? 'ring-2 ring-matrix-accent' : ''
  }`

function NavigationItems({
  mobile,
  user,
  closeMenu,
  setShowLogoutModal,
}: {
  mobile: boolean
  user: { nickName: string } | null
  closeMenu: () => void
  setShowLogoutModal: (value: boolean) => void
}) {
  const linkClass = mobile ? mobileNavLinkClass : navLinkClass

  return (
    <>
      {user ? (
        <>
          <NavLink to="/create-post" className={linkClass} onClick={closeMenu}>
            {mobile && '> '}[ +publicar ]
          </NavLink>
          <NavLink to="/profile" className={linkClass} onClick={closeMenu}>
            {mobile && '> '}[ @{user.nickName} ]
          </NavLink>
          <button
            type="button"
            onClick={() => {
              closeMenu()
              setShowLogoutModal(true)
            }}
            className={mobile ? mobileNavLinkClass({ isActive: false }) : navLinkClass({ isActive: false })}
          >
            {mobile && '> '}[ /salir ]
          </button>
        </>
      ) : (
        <>
          <NavLink to="/login" className={linkClass} onClick={closeMenu}>
            {mobile && '> '}[ /login ]
          </NavLink>
          <NavLink
            to="/register"
            className={mobile ? mobileNavLinkClass : registerLinkClass}
            onClick={closeMenu}
          >
            {mobile && '> '}[ /registrarse ]
          </NavLink>
        </>
      )}
    </>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const closeMenu = () => setIsOpen(false)

  return (
    <>
      <ConfirmActionModal
        open={showLogoutModal}
        title="¿Estás seguro que deseas salir?"
        onConfirm={() => {
          setShowLogoutModal(false)
          logout()
        }}
        onCancel={() => {
          setShowLogoutModal(false)
        }}
      />

      <header className="sticky top-0 z-50 border-b border-matrix-border/80 bg-matrix-bg/85 backdrop-blur-md">
        <nav className="py-4" aria-label="Navegación principal">
          <div className="relative mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
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
            className={`rounded border p-2 font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent focus-visible:ring-offset-2 focus-visible:ring-offset-matrix-bg md:hidden ${
              isOpen
                ? 'border-matrix-accent text-matrix-accent shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'border-matrix-border text-matrix-muted hover:border-matrix-accent-hover hover:text-matrix-accent-hover hover:shadow-[0_0_10px_rgba(0,204,82,0.35)]'
            }`}
            aria-label={isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          <div className="hidden items-center gap-3 md:flex">
            <NavigationItems
              mobile={false}
              user={user}
              closeMenu={closeMenu}
              setShowLogoutModal={setShowLogoutModal}
            />
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 right-0 top-full z-50 mx-4 mt-2 rounded-xl border border-matrix-border/80 bg-matrix-card/95 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl md:hidden"
              >
                <div className="flex flex-col gap-2">
                  <NavigationItems
                    mobile
                    user={user}
                    closeMenu={closeMenu}
                    setShowLogoutModal={setShowLogoutModal}
                  />
                </div>
                <div className="mt-4 flex items-center gap-2 border-t border-matrix-border/50 pt-3 font-mono text-[10px] tracking-wider text-matrix-muted">
                  <motion.span
                    aria-hidden="true"
                    animate={{ opacity: [0.35, 1, 0.35] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="h-2 w-2 rounded-full bg-matrix-accent shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                  />
                  [ MOBILE_NODE: ACTIVE ]
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </nav>
      </header>
    </>
  )
}
