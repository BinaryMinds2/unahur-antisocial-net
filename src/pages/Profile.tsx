import { useEffect, useState } from 'react'
import { motion, type Variants } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import PostCard from '../components/PostCard'
import { useAuth } from '../context/useAuth'
import {
  getApiErrorMessage,
  getCommentsByPost,
  getPostImages,
  getPostsByUser,
} from '../services/api'
import type { Post } from '../types'

const postsVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    if (!user) return

    let active = true

    getPostsByUser(user.id)
      .then(async (loadedPosts) => {
        const postsWithDetails = await Promise.all(
          loadedPosts.map(async (post) => {
            const [images, comments] = await Promise.all([
              getPostImages(post.id),
              getCommentsByPost(post.id),
            ])

            return {
              ...post,
              PostImages: images,
              commentsCount: comments.length,
            }
          }),
        )

        if (active) {
          setPosts(postsWithDetails)
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            getApiErrorMessage(
              requestError,
              'No se pudieron cargar tus publicaciones.',
            ),
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
  }, [user])

  if (!user) {
    return null
  }

  return (
    <section className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden bg-matrix-bg px-4 py-8">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#10b9810a_1px,transparent_1px),linear-gradient(to_bottom,#10b9810a_1px,transparent_1px)] [background-size:3rem_3rem]" />

      <div className="relative z-10 mx-auto max-w-3xl space-y-6">
        <header className="rounded-xl border border-matrix-border bg-matrix-card/60 p-5 shadow-xl backdrop-blur-md">
          <div className="mb-1 font-mono text-xs text-matrix-accent/80">
            &gt; USER_PROFILE
          </div>
          <h1 className="font-mono text-xl font-bold tracking-wide text-matrix-text">
            // publicaciones de @{user.nickName}
          </h1>
        </header>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded border border-matrix-accent/60 bg-green-700/60 px-5 py-2.5 font-mono text-sm font-bold text-white shadow-sm transition-all hover:bg-green-600 hover:shadow-[0_0_15px_rgba(0,204,82,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent focus-visible:ring-offset-2 focus-visible:ring-offset-matrix-bg"
        >
          [ cerrar_sesion ]
        </button>

        {loading && (
          <div className="space-y-4" aria-label="Cargando publicaciones" aria-busy="true">
            {[1, 2].map((skeleton) => (
              <div
                key={skeleton}
                className="h-52 animate-pulse rounded-xl border border-matrix-border/50 bg-matrix-card/40"
              />
            ))}
          </div>
        )}

        {error && (
          <p className="rounded border border-red-500/50 bg-red-950/30 p-4 font-mono text-red-400">
            ! {error}
          </p>
        )}

        {!loading && !error && posts.length === 0 && (
          <p className="font-mono text-matrix-muted">
            // [ todavía no tenés publicaciones ]
          </p>
        )}

        {!loading && !error && posts.length > 0 && (
          <motion.div
            variants={postsVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
