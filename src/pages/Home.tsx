import { useEffect, useMemo, useState } from 'react'
import { motion, type Variants } from 'motion/react'
import DatabaseErrorTerminal from '../components/DatabaseErrorTerminal'
import PostCard from '../components/PostCard'
import { getCommentsByPost, getPostImages, getPosts } from '../services/api'
import type { Post } from '../types'

function getPostSortValue(post: Post): number {
  if (post.createdAt) {
    return new Date(post.createdAt).getTime()
  }

  return Number(post.id)
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [localPosts, setLocalPosts] = useState<Post[]>([])
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    try {
      const storedPosts = JSON.parse(localStorage.getItem('unahur_local_posts') ?? '[]') as Post[]
      setLocalPosts(Array.isArray(storedPosts) ? storedPosts : [])
    } catch {
      setLocalPosts([])
    }
  }, [])

  const mergedPosts = useMemo(
    () => [...localPosts, ...posts].sort((first, second) => getPostSortValue(second) - getPostSortValue(first)),
    [localPosts, posts],
  )

  const availableTags = Array.from(
    new Map(
      mergedPosts
        .flatMap((post) => post.Tags ?? post.tags ?? [])
        .map((tag) => [tag.id, tag]),
    ).values(),
  ).sort((first, second) => first.name.localeCompare(second.name))

  const filteredPosts =
    selectedTagId === null
      ? mergedPosts
      : mergedPosts.filter((post) =>
          (post.Tags ?? post.tags ?? []).some(
            (tag) => tag.id === selectedTagId,
          ),
        )

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
          try {
            const storedPosts = JSON.parse(localStorage.getItem('unahur_local_posts') ?? '[]') as Post[]
            setPosts(Array.isArray(storedPosts) ? storedPosts : [])
          } catch {
            setPosts([])
          }

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
  }, [retryCount])

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
          <DatabaseErrorTerminal
            error={error}
            onRetry={() => {
              setError(null)
              setLoading(true)
              setRetryCount((count) => count + 1)
            }}
          />
        )}
        {!loading && !error && mergedPosts.length === 0 && (
          <p className="font-mono text-matrix-muted">
            // [ sin publicaciones para mostrar ]
          </p>
        )}

        {!loading && !error && availableTags.length > 0 && (
          <nav
            className="flex flex-wrap items-center gap-2"
            aria-label="Filtrar publicaciones por etiqueta"
          >
            <button
              type="button"
              aria-pressed={selectedTagId === null}
              onClick={() => setSelectedTagId(null)}
              className={`rounded border px-3 py-1.5 font-mono text-xs transition-colors ${
                selectedTagId === null
                  ? 'border-matrix-accent bg-matrix-accent/10 text-matrix-accent'
                  : 'border-matrix-border text-matrix-muted hover:border-matrix-accent/60 hover:text-matrix-text'
              }`}
            >
              Todas
            </button>
            {availableTags.map((tag) => (
              <button
                type="button"
                key={tag.id}
                aria-pressed={selectedTagId === tag.id}
                onClick={() => setSelectedTagId(tag.id)}
                className={`rounded border px-3 py-1.5 font-mono text-xs transition-colors ${
                  selectedTagId === tag.id
                    ? 'border-matrix-accent bg-matrix-accent/10 text-matrix-accent'
                    : 'border-matrix-border text-matrix-muted hover:border-matrix-accent/60 hover:text-matrix-text'
                }`}
              >
                #{tag.name}
              </button>
            ))}
          </nav>
        )}

        {!loading &&
          !error &&
          selectedTagId !== null &&
          filteredPosts.length === 0 && (
            <p className="font-mono text-matrix-muted">
              // [ no hay publicaciones con esta etiqueta ]
            </p>
          )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDeleted={(deletedPostId) => {
                setPosts((current) =>
                  current.filter((post) => post.id !== deletedPostId),
                )
                setLocalPosts((current) =>
                  current.filter((post) => post.id !== deletedPostId),
                )
              }}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
