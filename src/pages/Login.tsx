import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import FormInput from '../components/FormInput'
import AuthTerminalLayout from '../components/AuthTerminalLayout'
import AuthFieldIcon from '../components/AuthFieldIcon'
import PasswordVisibilityToggle from '../components/PasswordVisibilityToggle'
import { useAuth } from '../context/useAuth'
import { getApiErrorMessage } from '../services/api'
import { DEFAULT_PASSWORD } from '../constants'

export default function Login() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login, user } = useAuth()
  const state = location.state
  const destination =
    typeof state === 'object' &&
    state !== null &&
    'from' in state &&
    typeof state.from === 'object' &&
    state.from !== null &&
    'pathname' in state.from &&
    typeof state.from.pathname === 'string'
      ? state.from.pathname
      : '/'

  const [nickName, setNickName] = useState(() => {
    return typeof state === 'object' &&
      state !== null &&
      'prefillUser' in state &&
      typeof state.prefillUser === 'string'
      ? state.prefillUser
      : ''
  })
  const [password, setPassword] = useState(DEFAULT_PASSWORD)
  const [showPassword, setShowPassword] = useState(false)
  const [submittedAttempt, setSubmittedAttempt] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const normalizedNickName = nickName.trim().toLowerCase()
  const nickNameError = !normalizedNickName
    ? 'Ingresá tu nombre de usuario.'
    : null
  const passwordError = !password.trim()
    ? 'Ingresá tu clave de acceso.'
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittedAttempt(true)
    setError('')

    if (nickNameError) {
      document.getElementById('nickName')?.focus()
      return
    }

    if (passwordError) {
      document.getElementById('password')?.focus()
      return
    }

    setLoading(true)

    try {
      const authenticated = await login(normalizedNickName, password)
      if (!authenticated) {
        throw new Error('Usuario o contraseña incorrectos.')
      }
      navigate(destination)
    } catch (err: unknown) {
      setError(
        getApiErrorMessage(
          err,
          'Error al iniciar sesión. Revisá tus credenciales.',
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    return <Navigate to={destination} replace />
  }

  return (
    <AuthTerminalLayout
      title="// [ /acceso_sistema ]"
      description="Ingresá tu nombre de usuario para autenticar el perfil."
      footer={
        <div className="mt-6 border-t border-matrix-border/50 pt-4 text-center font-mono text-xs text-matrix-muted">
          ¿No tenés cuenta aún?{' '}
          <Link
            to="/register"
            className="text-matrix-accent hover:underline focus-visible:outline-none"
          >
            [ /registrarse ]
          </Link>
        </div>
      }
    >
      {error && (
        <div
          role="alert"
          className="mb-4 rounded border border-red-500/50 bg-red-950/30 p-3 font-mono text-xs text-red-400"
        >
          ! {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <FormInput
            id="nickName"
            label="nombre_usuario"
            type="text"
            placeholder="matrix_dev"
            value={nickName}
            onChange={(e) => {
              setNickName(e.target.value)
              if (error) setError('')
            }}
            icon={<AuthFieldIcon type="user" />}
            required
          />
          {submittedAttempt && nickNameError && (
            <p role="alert" className="font-mono text-xs text-red-400">
              ! {nickNameError}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <FormInput
            id="password"
            label="clave_acceso"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (error) setError('')
            }}
            icon={<AuthFieldIcon type="lock" />}
            rightElement={
              <PasswordVisibilityToggle
                isVisible={showPassword}
                onToggle={() => setShowPassword((isVisible) => !isVisible)}
              />
            }
            required
          />
          {submittedAttempt && passwordError && (
            <p role="alert" className="font-mono text-xs text-red-400">
              ! {passwordError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer rounded-lg border border-matrix-accent bg-matrix-accent/20 py-3 font-mono text-sm font-bold text-matrix-accent shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all duration-200 hover:bg-matrix-accent hover:text-black hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent focus-visible:ring-offset-2 focus-visible:ring-offset-matrix-bg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? '[ autenticando... ]' : '[ ingresar ]'}
        </button>
      </form>
    </AuthTerminalLayout>
  )
}