import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import CommentForm from '../components/CommentForm'
import CommentList from '../components/CommentList'
import DatabaseErrorTerminal from '../components/DatabaseErrorTerminal'
import PostCard from '../components/PostCard'
import {
  createPost,
  createPostImage,
  getApiErrorMessage,
  getCommentsByPost,
  getPostById,
  getPostImages,
  getTags,
} from '../services/api'
import type { Comment, Post } from '../types'

const LOCAL_POSTS_KEY = 'unahur_local_posts'

interface StoredLocalPost extends Post {
  serverPostId?: number
}

function readLocalPosts(): StoredLocalPost[] {
  try {
    const storedPosts = JSON.parse(
      localStorage.getItem(LOCAL_POSTS_KEY) ?? '[]',
    ) as StoredLocalPost[]
    return Array.isArray(storedPosts) ? storedPosts : []
  } catch {
    return []
  }
}

function DetailShell({ children }: { children: ReactNode }) {
  return (
    <section className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden bg-matrix-bg px-4 py-8">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#10b9810a_1px,transparent_1px),linear-gradient(to_bottom,#10b9810a_1px,transparent_1px)] [background-size:3rem_3rem]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 z-0 h-[450px] w-[800px] -translate-x-1/2 rounded-full bg-matrix-accent/5 blur-[180px]" />
      <div className="relative z-10 mx-auto max-w-3xl">{children}</div>
    </section>
  )
}

export default function PostDetail() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const postId = Number(id)
  const hasInvalidId = !Number.isInteger(postId) || postId <= 0
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const locationState = location.state as { migrationNotice?: unknown } | null
  const migrationNotice =
    typeof locationState?.migrationNotice === 'string'
      ? locationState.migrationNotice
      : null

  useEffect(() => {
    if (hasInvalidId) {
      return
    }

    let active = true

    Promise.resolve()
      .then(async () => {
        const storedPosts = readLocalPosts()
        const localPost = storedPosts.find(
          (storedPost) => storedPost.id === postId,
        )

        if (!active) return

        if (localPost) {
          const localTags = localPost.Tags ?? localPost.tags ?? []
          const availableTags =
            localTags.length > 0 ? await getTags() : []
          const matchedTags = localTags.map((tag) =>
            availableTags.find(
              (availableTag) =>
                availableTag.name.toLowerCase() === tag.name.toLowerCase(),
            ),
          )
          const missingTags = localTags
            .filter((_, index) => !matchedTags[index])
            .map((tag) => tag.name)

          let serverPostId = localPost.serverPostId
          if (!serverPostId) {
            const userId =
              localPost.UserId ??
              localPost.userId ??
              localPost.User?.id ??
              localPost.user?.id ??
              localPost.author?.id
            if (!userId) {
              throw new Error('No se pudo identificar al autor de la publicación.')
            }

            const createdPost = await createPost({
              description: localPost.description,
              userId,
              tagIds: matchedTags.flatMap((tag) =>
                tag ? [tag.id] : [],
              ),
            })
            serverPostId = createdPost.id
            localStorage.setItem(
              LOCAL_POSTS_KEY,
              JSON.stringify(
                storedPosts.map((storedPost) =>
                  storedPost.id === localPost.id
                    ? { ...storedPost, serverPostId }
                    : storedPost,
                ),
              ),
            )
          }

          const remoteImages = await getPostImages(serverPostId)
          const localImages = localPost.PostImages ?? localPost.images ?? []
          for (const image of localImages) {
            if (!remoteImages.some((remoteImage) => remoteImage.url === image.url)) {
              await createPostImage({
                postId: serverPostId,
                url: image.url,
              })
            }
          }

          if (!active) return
          localStorage.setItem(
            LOCAL_POSTS_KEY,
            JSON.stringify(
              storedPosts.filter(
                (storedPost) => storedPost.id !== localPost.id,
              ),
            ),
          )
          navigate(`/post/${serverPostId}`, {
            replace: true,
            state: missingTags.length
              ? {
                  migrationNotice: `No se pudieron migrar estas etiquetas porque no existen en el servidor: ${missingTags.map((tag) => `#${tag}`).join(', ')}.`,
                }
              : null,
          })
          return
        }

        const [loadedPost, images, loadedComments] = await Promise.all([
          getPostById(postId),
          getPostImages(postId),
          getCommentsByPost(postId),
        ])
        if (!active) return
        setPost({ ...loadedPost, PostImages: images })
        setComments(loadedComments)
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            getApiErrorMessage(
              requestError,
              'No se pudo cargar la publicación.',
            ),
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [hasInvalidId, navigate, postId, retryCount])

  if (hasInvalidId) {
    return (
      <DetailShell>
        <div className="rounded border border-red-500/50 bg-red-950/30 p-5 font-mono text-red-400">
          ! La publicación solicitada no es válida.
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-5 rounded border border-matrix-border px-4 py-2 font-mono text-sm text-matrix-muted transition-colors hover:border-matrix-accent hover:text-matrix-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent"
        >
          [ volver ]
        </button>
      </DetailShell>
    )
  }

  if (loading) {
    return (
      <DetailShell>
        <p className="rounded border border-matrix-border bg-matrix-card p-4 font-mono text-matrix-accent">
          [ cargando_publicacion... ]
        </p>
      </DetailShell>
    )
  }

  if (error || !post) {
    return (
      <DetailShell>
        {error ? (
          <DatabaseErrorTerminal
            error={error}
            onRetry={() => {
              setError('')
              setLoading(true)
              setRetryCount((count) => count + 1)
            }}
          />
        ) : (
          <div className="rounded border border-red-500/50 bg-red-950/30 p-5 font-mono text-red-400">
            ! No se encontró la publicación.
          </div>
        )}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-5 rounded border border-matrix-border px-4 py-2 font-mono text-sm text-matrix-muted transition-colors hover:border-matrix-accent hover:text-matrix-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent"
        >
          [ volver ]
        </button>
      </DetailShell>
    )
  }

  return (
    <DetailShell>
      <header className="mb-6 flex items-center justify-between rounded-xl border border-matrix-border bg-matrix-card/60 p-5 shadow-xl backdrop-blur-md">
        <div>
          <div className="mb-1 flex items-center gap-1 font-mono text-xs text-matrix-accent">
            <span>&gt; SYSTEM_POST_DETAIL</span>
            <span className="animate-pulse font-bold">_</span>
          </div>
          <h1 className="font-mono text-xl font-bold tracking-wide text-matrix-text">
            // publicación #{post.id}
          </h1>
        </div>
        <Link
          to="/"
          className="flex items-center gap-1 font-mono text-xs text-matrix-accent hover:underline"
        >
          [ &lt;- volver_al_feed ]
        </Link>
      </header>

      {migrationNotice && (
        <p
          role="status"
          className="mb-4 rounded-lg border border-amber-400/40 bg-amber-500/10 p-3 font-mono text-xs text-amber-200"
        >
          {migrationNotice}
        </p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <PostCard
          post={post}
          onDeleted={() => navigate('/', { replace: true })}
        />
      </motion.div>

      <section className="mt-8 space-y-4" aria-labelledby="comments-title">
        <div className="flex items-center justify-between gap-3 border-b border-matrix-border pb-3">
          <h2
            id="comments-title"
            className="mb-0 font-mono text-sm text-matrix-accent"
          >
            [ &gt; comentarios_archivados ]
          </h2>
          <span className="font-mono text-xs text-matrix-muted">
            [{comments.length}]
          </span>
        </div>
        <CommentList comments={comments} />
        <CommentForm
          postId={post.id}
          onCreated={(comment) => setComments((current) => [...current, comment])}
        />
      </section>
    </DetailShell>
  )
}
