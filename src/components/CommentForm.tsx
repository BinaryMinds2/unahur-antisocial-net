import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import { createComment, getApiErrorMessage } from '../services/api'
import type { Comment } from '../types'

interface CommentFormProps {
  postId: number
  onCreated: (comment: Comment) => void
}

export default function CommentForm({
  postId,
  onCreated,
}: CommentFormProps) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedContent = content.trim()

    if (!trimmedContent) {
      setError('Escribí un comentario antes de enviarlo.')
      return
    }

    if (!user) {
      setError('Necesitás iniciar sesión para comentar.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const comment = await createComment({
        postId,
        userId: user.id,
        content: trimmedContent,
      })
      onCreated(comment)
      setContent('')
    } catch (requestError: unknown) {
      setError(
        getApiErrorMessage(
          requestError,
          'No se pudo publicar el comentario. Intentá nuevamente.',
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-matrix-border bg-matrix-card/70 p-4 shadow-lg backdrop-blur-md"
    >
      <label
        htmlFor="comment-content"
        className="mb-2 block font-mono text-xs font-bold uppercase tracking-wider text-matrix-muted"
      >
        [ nuevo_comentario ]
      </label>
      <textarea
        id="comment-content"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Escribí tu comentario..."
        rows={3}
        maxLength={500}
        className="w-full resize-y rounded-lg border border-matrix-border bg-black/40 px-3 py-2 font-mono text-sm text-matrix-text placeholder-matrix-muted/40 focus:border-matrix-accent focus:outline-none focus:ring-1 focus:ring-matrix-accent focus:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        disabled={loading}
      />
      {error && (
        <p className="mt-2 font-mono text-xs text-red-400">! {error}</p>
      )}
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-matrix-muted">
          {content.length}/500
        </span>
        <button
          type="submit"
          disabled={loading}
          className="rounded border border-matrix-accent/60 bg-green-700/60 px-4 py-2 font-mono text-xs font-bold text-white transition-all hover:bg-green-600 hover:shadow-[0_0_15px_rgba(0,204,82,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent disabled:opacity-50"
        >
          {loading ? '[ enviando... ]' : '[ enviar_comentario ]'}
        </button>
      </div>
    </form>
  )
}
