import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CommentForm from '../components/CommentForm'

import CommentList from '../components/CommentList'
import DatabaseErrorTerminal from '../components/DatabaseErrorTerminal'
import PostCard from '../components/PostCard'
import {
  getApiErrorMessage,
  getCommentsByPost,
  getPostById,
  getPostImages,
} from '../services/api'
import type { Comment, Post } from '../types'

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
  const navigate = useNavigate()
  const postId = Number(id)
  const hasInvalidId = !Number.isInteger(postId) || postId <= 0
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (hasInvalidId) {
      return
    }

    let active = true

    Promise.all([
      getPostById(postId),
      getPostImages(postId),
      getCommentsByPost(postId),
    ])
      .then(([loadedPost, images, loadedComments]) => {
        if (!active) return
        setPost({
          ...loadedPost,
          PostImages: images,
          commentsCount: loadedComments.length,
        })
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
      <header className="mb-6 flex flex-col overflow-hidden rounded-xl border border-matrix-border bg-matrix-card/80 shadow-[0_0_30px_rgba(16,185,129,0.08)] backdrop-blur-md">
        {/* Barra superior idéntica a CreatePost */}
        <div className="flex items-center justify-between border-b border-matrix-border bg-black/70 px-4 py-2.5">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <span className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <span className="font-mono text-xs text-matrix-muted">
            bash -- view_post.sh
          </span>
          <div className="w-10" />
        </div>

        {/* Contenido del encabezado con misma escala tipográfica */}
        <div className="p-6 sm:p-8">
          <div className="mb-1 flex items-center gap-1 font-mono text-xs text-matrix-accent">
            <span>&gt; SYSTEM_POST_DETAIL</span>
            <span className="animate-pulse font-bold">_</span>
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h1 className="font-mono text-xl font-bold tracking-wide text-matrix-text sm:text-2xl">
              // publicación #{post.id}
            </h1>

            <Link
              to="/"
              className="flex w-fit items-center gap-1 font-mono text-xs text-matrix-accent hover:underline"
            >
              [ &lt; volver_al_feed ]
            </Link>
          </div>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <PostCard
          post={post}
          isDetail={true}
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