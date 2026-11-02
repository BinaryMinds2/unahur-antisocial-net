import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
      <section className="w-full max-w-2xl rounded border border-matrix-border bg-matrix-card p-8 text-center shadow-xl backdrop-blur-md">
        <h1 className="font-mono text-2xl font-bold text-matrix-accent">
          {'// [ bienvenido '}
          <span className="text-matrix-text">{user.nickName}</span>
          {' ]'}
        </h1>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 rounded border border-matrix-accent/60 bg-green-700/60 px-5 py-2.5 font-mono text-sm font-bold text-white shadow-sm transition-all hover:bg-green-600 hover:shadow-[0_0_15px_rgba(0,204,82,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent focus-visible:ring-offset-2 focus-visible:ring-offset-matrix-bg"
        >
          [ cerrar_sesion ]
        </button>
      </section>
    </div>
  )
}
