import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import FormInput from '../components/FormInput'
import AuthTerminalLayout from '../components/AuthTerminalLayout'
import AuthFieldIcon from '../components/AuthFieldIcon'
import PasswordVisibilityToggle from '../components/PasswordVisibilityToggle'
import { useAuth } from '../context/useAuth'
import { getApiErrorMessage } from '../services/api'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [nickName, setNickName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [registeredUser, setRegisteredUser] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!nickName.trim() || !email.trim()) {
      setError('Completá todos los campos.')
      return
    }

    setLoading(true)

    try {
      const normalizedNickName = nickName.trim()
      await register({ nickName: normalizedNickName, email: email.trim() })
      setRegisteredUser(normalizedNickName)
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Error al registrar el usuario.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthTerminalLayout
      title="// [ /registro_usuario ]"
      description="Crea tu cuenta para ingresar a la red anti-social."
      footer={
        <div className="mt-6 border-t border-matrix-border/50 pt-4 text-center font-mono text-xs text-matrix-muted">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-matrix-accent hover:underline focus-visible:outline-none">
            [ /login ]
          </Link>
        </div>
      }
    >
        {error && (
          <div className="mb-4 rounded border border-red-500/50 bg-red-950/30 p-3 font-mono text-xs text-red-400">
            ! {error}
          </div>
        )}

        {registeredUser ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="mx-auto w-full max-w-md overflow-hidden rounded-xl border border-matrix-accent/70 bg-matrix-card/90 shadow-[0_0_35px_rgba(16,185,129,0.2)] backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-matrix-accent/30 bg-black/70 px-4 py-2.5">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 animate-pulse rounded-full bg-matrix-accent" />
              </div>
              <span className="font-mono text-xs text-matrix-muted">bash -- register_success.sh</span>
              <span className="rounded border border-matrix-accent/30 bg-matrix-accent/10 px-2 py-0.5 font-mono text-[10px] text-matrix-accent">
                [ 201_OK ]
              </span>
            </div>

            <div className="space-y-4 p-6 font-mono">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-matrix-accent bg-matrix-accent/15 text-matrix-accent shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.15 }}
                      d="M20 6 9 17l-5-5"
                    />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-xs text-matrix-accent">
                    <span>&gt; USER_NODE_CREATED</span>
                    <span className="animate-pulse font-bold">_</span>
                  </div>
                  <h3 className="text-base font-bold text-matrix-text">
                    [ REGISTRO_COMPLETADO ]
                  </h3>
                </div>
              </div>

              <div className="rounded-r-lg border-l-2 border-matrix-accent bg-black/50 p-4 text-xs leading-relaxed text-matrix-text sm:text-sm">
                <p>
                  Felicidades,{' '}
                  <span className="font-bold text-matrix-accent">@{registeredUser}</span>.
                  Te has registrado correctamente, inicia sesión para disfrutar de
                  nuestra <span className="text-matrix-accent">Anti-Social Net</span>.
                </p>
              </div>

              <div className="space-y-1 text-[11px] text-matrix-muted">
                <p>&gt; [INFO] Identidad encriptada en la base de datos.</p>
                <p>&gt; [NEXT] Autenticación requerida para acceder al feed.</p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate('/login', { state: { prefillUser: registeredUser } })
                }
                className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-matrix-accent bg-matrix-accent/20 px-4 py-2.5 font-mono text-sm font-bold text-matrix-accent shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all duration-200 hover:bg-matrix-accent hover:text-black hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
              >
                <span>[ iniciar_sesion -&gt; ]</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              id="nickName"
              label="nombre_usuario"
              type="text"
              placeholder="matrix_dev"
              value={nickName}
              onChange={(e) => setNickName(e.target.value)}
              icon={<AuthFieldIcon type="user" />}
              required
            />

            <FormInput
              id="email"
              label="email_usuario"
              type="email"
              placeholder="usuario@unahur.edu.ar"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<AuthFieldIcon type="email" />}
              required
            />

            <FormInput
              id="password"
              label="clave_acceso"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value="123456"
              readOnly
              icon={<AuthFieldIcon type="lock" />}
              rightElement={
                <PasswordVisibilityToggle
                  isVisible={showPassword}
                  onToggle={() => setShowPassword((isVisible) => !isVisible)}
                />
              }
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer rounded-lg border border-matrix-accent bg-matrix-accent/20 py-3 font-mono text-sm font-bold text-matrix-accent shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all duration-200 hover:bg-matrix-accent hover:text-black hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent focus-visible:ring-offset-2 focus-visible:ring-offset-matrix-bg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? '[ registrando... ]' : '[ crear_cuenta ]'}
            </button>
          </form>
        )}

    </AuthTerminalLayout>
  )
}