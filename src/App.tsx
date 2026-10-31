import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import { ProtectedRoute } from './components/ProtectedRoute'

function PagePlaceholder({ title }: { title: string }) {
  return <h1 className="py-8 text-2xl font-bold text-matrix-text">{title}</h1>
}

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-matrix-bg">
        <Navbar />
        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <Routes>
              <Route path="/" element={<PagePlaceholder title="Inicio" />} />
              <Route path="/login" element={<PagePlaceholder title="Iniciar sesión" />} />
              <Route path="/register" element={<PagePlaceholder title="Registrarse" />} />
              <Route path="/post/:id" element={<PagePlaceholder title="Publicación" />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <PagePlaceholder title="Perfil" />
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
