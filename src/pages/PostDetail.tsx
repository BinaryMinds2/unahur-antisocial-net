import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CommentForm from '../components/CommentForm'
import CommentList from '../components/CommentList'
import PostCard from '../components/PostCard'
import {
  getApiErrorMessage,
  getCommentsByPost,
  getPostById,
  getPostImages,
} from '../services/api'
import type { Comment, Post } from '../types'

export default function PostDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const postId = Number(id)
  const hasInvalidId = !Number.isInteger(postId) || postId <= 0
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
  }, [hasInvalidId, postId])

  if (hasInvalidId) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-10">
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
      </section>
    )
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-10">
        <p className="rounded border border-matrix-border bg-matrix-card p-4 font-mono text-matrix-accent">
          [ cargando_publicacion... ]
        </p>
      </section>
    )
  }

  if (error || !post) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded border border-red-500/50 bg-red-950/30 p-5 font-mono text-red-400">
          ! {error || 'No se encontró la publicación.'}
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-5 rounded border border-matrix-border px-4 py-2 font-mono text-sm text-matrix-muted transition-colors hover:border-matrix-accent hover:text-matrix-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent"
        >
          [ volver ]
        </button>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <Link
        to="/"
        className="font-mono text-xs text-matrix-muted transition-colors hover:text-matrix-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent"
      >
        {'<'} volver_a_publicaciones
      </Link>

      <header className="mb-6 mt-6">
        <p className="font-mono text-sm uppercase tracking-widest text-matrix-accent">
          detalle_de_publicación
        </p>
        <h1 className="mt-2 font-mono text-3xl font-bold text-matrix-text">
          // publicación #{String(post.id).padStart(3, '0')}
        </h1>
      </header>

      <PostCard post={post} />

      <section className="mt-8 space-y-4" aria-labelledby="comments-title">
        <div className="flex items-center justify-between gap-3 border-b border-matrix-border pb-3">
          <h2
            id="comments-title"
            className="font-mono text-lg font-bold text-matrix-text"
          >
            // comentarios
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
    </section>
  )
}
