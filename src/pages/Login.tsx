import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormInput from '../components/FormInput'
import { useAuth } from '../context/useAuth'
import { getApiErrorMessage } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [nickName, setNickName] = useState('')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const normalizedNickName = nickName.trim().toLowerCase()
    if (!normalizedNickName) {
      setError('Ingresa un nombre de usuario.')
      return
    }

    if (!password.trim()) {
      setError('Ingresa una contraseña.')
      return
    }

    setLoading(true)

    try {
      const authenticated = await login(normalizedNickName, password)
      if (!authenticated) {
        throw new Error('Usuario o contraseña incorrectos.')
      }
      navigate('/')
    } catch (err: unknown) {
      setError(
        getApiErrorMessage(
          err,
          'Error al iniciar sesión. Revisa tus credenciales.',
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded border border-matrix-border bg-matrix-card p-6 shadow-xl backdrop-blur-md">
        <h2 className="mb-2 font-mono text-xl font-bold text-matrix-accent">
          // [ /acceso_sistema ]
        </h2>
        <p className="mb-6 font-mono text-xs text-matrix-muted">
          Ingresa tu nombre de usuario para autenticar el perfil.
        </p>

        {error && (
          <div className="mb-4 rounded border border-red-500/50 bg-red-950/30 p-3 font-mono text-xs text-red-400">
            ! {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            id="nickName"
            label="nombre_usuario"
            type="text"
            placeholder="matrix_dev"
            value={nickName}
            onChange={(e) => setNickName(e.target.value)}
            required
          />

          <FormInput
            id="password"
            label="clave_acceso"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded border border-matrix-accent/60 bg-green-700/60 py-2.5 font-mono text-sm font-bold text-white shadow-sm transition-all hover:bg-green-600 hover:shadow-[0_0_15px_rgba(0,204,82,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent focus-visible:ring-offset-2 focus-visible:ring-offset-matrix-bg disabled:opacity-50"
          >
            {loading ? '[ autenticando... ]' : '[ ingresar ]'}
          </button>
        </form>

        <div className="mt-6 border-t border-matrix-border/50 pt-4 text-center font-mono text-xs text-matrix-muted">
          ¿No tenés cuenta aún?{' '}
          <Link
            to="/register"
            className="text-matrix-accent hover:underline focus-visible:outline-none"
          >
            [ /registrarse ]
          </Link>
        </div>
      </div>
    </div>
  )
}