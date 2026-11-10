import { useEffect, useState } from 'react'
import { motion, type Variants } from 'motion/react'
import PostCard from '../components/PostCard'
import { getCommentsByPost, getPostImages, getPosts } from '../services/api'
import type { Post } from '../types'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    getPosts()
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
    <section className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden bg-matrix-bg px-4 py-8">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#10b9810a_1px,transparent_1px),linear-gradient(to_bottom,#10b9810a_1px,transparent_1px)] [background-size:3rem_3rem]" />
      <div className="pointer-events-none absolute left-1/2 top-1/4 z-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-matrix-accent/10 blur-[160px] animate-pulse" />

      <div className="relative z-10 mx-auto max-w-3xl space-y-6">
        <header className="flex items-center justify-between rounded-xl border border-matrix-border bg-matrix-card/60 p-5 shadow-xl backdrop-blur-md">
          <div>
            <div className="mb-1 flex items-center gap-1 font-mono text-xs text-matrix-accent/80">
              <span>&gt; SYSTEM_FEED</span>
              <span className="animate-pulse font-bold">_</span>
            </div>
            <h1 className="flex items-center gap-2 font-mono text-xl font-bold tracking-wide text-matrix-text">
              // publicaciones
            </h1>
          </div>
          <div className="hidden items-center gap-2 rounded border border-matrix-border/50 bg-black/40 px-3 py-1.5 font-mono text-xs text-matrix-muted sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-matrix-accent" />
            <span>NET_STATUS: ONLINE</span>
          </div>
        </header>

        {loading && (
          <div className="space-y-4" aria-label="Cargando publicaciones" aria-busy="true">
            {[1, 2, 3].map((skeleton) => (
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
            // [ sin publicaciones para mostrar ]
          </p>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
