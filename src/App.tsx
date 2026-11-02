import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import NotFound from './pages/NotFound'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import { ProtectedRoute } from './components/ProtectedRoute'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Login from './pages/Login'       // <-- 1. Importá Login
import Register from './pages/Register' // <-- 1. Importá Register
import { useAuth } from './context/useAuth'

function PagePlaceholder({ title }: { title: string }) {
  return <h1 className="py-8 text-2xl font-bold text-matrix-text">{title}</h1>
}

function HomeRoute() {
  const { user } = useAuth()

  return user ? <Navigate to="/perfil" replace /> : <Home />
}

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-matrix-bg">
        <Navbar />
        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <Routes>
              <Route path="/" element={<HomeRoute />} />
              <Route path="/login" element={<Login />} />             {/* <-- 2. Usá Login */}
              <Route path="/register" element={<Register />} />       {/* <-- 2. Usá Register */}
              <Route path="/post/:id" element={<PagePlaceholder title="Publicación" />} />
              <Route
                path="/perfil"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-post"
                element={
                  <ProtectedRoute>
                    <PagePlaceholder title="Crear publicación" />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App