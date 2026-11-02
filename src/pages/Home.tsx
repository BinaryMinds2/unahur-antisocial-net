import { useEffect, useState } from 'react'
import PostCard from '../components/PostCard'
import { fetchPosts } from '../services/api'
import type { Post } from '../types'

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    fetchPosts()
      .then((loadedPosts) => {
        if (isMounted) {
          setPosts(loadedPosts)
        }
      })
      .catch((requestError: unknown) => {
        if (isMounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'No se pudieron cargar las publicaciones.',
          )
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
          UnaHur Anti-Social Net
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">Publicaciones</h1>
      </header>

      {isLoading && <p className="text-slate-400">Cargando publicaciones...</p>}
      {error && (
        <p className="rounded-lg border border-red-900 bg-red-950/50 p-4 text-red-200">
          {error}
        </p>
      )}
      {!isLoading && !error && (!Array.isArray(posts) || posts.length === 0) && (
        <p className="font-mono text-matrix-muted">
          // [ sin publicaciones para mostrar ]
        </p>
      )}
      <section className="space-y-4" aria-label="Listado de publicaciones">
        {Array.isArray(posts) ? posts.map((post) => (
          <PostCard key={post.id} post={post} />
        )) : []}
      </section>
    </main>
  )
}
