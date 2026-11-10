import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormInput from '../components/FormInput'
import AuthTerminalLayout from '../components/AuthTerminalLayout'
import AuthFieldIcon from '../components/AuthFieldIcon'
import { useAuth } from '../context/useAuth'
import { getApiErrorMessage } from '../services/api'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [nickName, setNickName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!nickName.trim() || !email.trim()) {
      setError('Completá todos los campos.')
      return
    }

    setLoading(true)

    try {
      await register({ nickName: nickName.trim(), email: email.trim() })
      navigate('/login')
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
            type="password"
            placeholder="••••••••"
            value="123456"
            readOnly
            icon={<AuthFieldIcon type="lock" />}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-lg border border-matrix-accent bg-matrix-accent/20 py-3 font-mono text-sm font-bold text-matrix-accent shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all duration-200 hover:bg-matrix-accent hover:text-black hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent focus-visible:ring-offset-2 focus-visible:ring-offset-matrix-bg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? '[ registrando... ]' : '[ crear_cuenta ]'}
          </button>
        </form>

    </AuthTerminalLayout>
  )
}