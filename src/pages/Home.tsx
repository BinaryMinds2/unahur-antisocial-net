import { useEffect, useState } from 'react'
import PostCard from '../components/PostCard'
import { getPosts } from '../services/api'
import type { Post } from '../types'

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    getPosts()
      .then((loadedPosts) => {
        if (active) {
          setPosts(loadedPosts)
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'No se pudieron cargar las publicaciones.',
          )
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <p className="font-mono text-sm uppercase tracking-widest text-matrix-accent">
          UnaHur Anti-Social Net
        </p>
        <h1 className="mt-2 font-mono text-3xl font-bold text-matrix-text">
          // publicaciones
        </h1>
      </header>

      {loading && (
        <p className="rounded border border-matrix-border bg-matrix-card p-4 font-mono text-matrix-accent">
          [ cargando_publicaciones... ]
        </p>
      )}
      {error && (
        <p className="rounded border border-red-500/50 bg-red-950/30 p-4 font-mono text-red-400">
          ! {error}
        </p>
      )}
      {!loading && !error && posts.length === 0 && (
        <p className="font-mono text-matrix-muted">
          // [ sin publicaciones para mostrar ]
        </p>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  )
}
