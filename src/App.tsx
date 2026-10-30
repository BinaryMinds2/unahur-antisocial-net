import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'

function PagePlaceholder({ title }: { title: string }) {
  return <main><h1>{title}</h1></main>
}

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}

export default App
