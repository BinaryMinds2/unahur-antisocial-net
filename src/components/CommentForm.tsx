import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import { createComment, getApiErrorMessage } from '../services/api' // Ajustá la ruta según tu proyecto

interface CommentFormProps {
  postId: number
  onCommentAdded: () => void
}

export default function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submittedAttempt, setSubmittedAttempt] = useState(false)

  const trimmedContent = content.trim()
  const contentError = !trimmedContent ? 'El comentario no puede estar vacío.' : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittedAttempt(true)
    setError('')

    if (!user) {
      setError('Debés iniciar sesión para comentar.')
      return
    }

    if (contentError) {
      document.getElementById('comment-content')?.focus()
      return
    }

    setSubmitting(true)

    try {
      // Ajustá esta llamada según cómo tengas tu servicio API
      await createComment({
        description: trimmedContent,
        userId: user.id,
        postId: postId,
      })

      setContent('')
      setSubmittedAttempt(false)
      onCommentAdded() // Callback para recargar los comentarios en el componente padre
    } catch (err: unknown) {
      setError(
        getApiErrorMessage(err, 'No se pudo enviar el comentario. Intentá nuevamente.')
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-3 rounded-lg border border-matrix-border/50 bg-black/30 p-4">
      <label htmlFor="comment-content" className="flex items-center gap-1 font-mono text-xs text-matrix-accent">
        <span>&gt; ADD_COMMENT</span>
        <span className="animate-pulse font-bold">_</span>
      </label>

      {error && (
        <p role="alert" className="font-mono text-xs text-red-400">
          ! {error}
        </p>
      )}

      <div>
        <textarea
          id="comment-content"
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            if (error) setError('')
          }}
          placeholder="Escribí un comentario..."
          disabled={submitting || !user}
          className={`min-h-[80px] w-full resize-y rounded border bg-matrix-bg/80 p-3 font-mono text-sm text-matrix-text outline-none transition-colors placeholder:text-matrix-muted/50 ${
            submittedAttempt && contentError
              ? 'border-red-500/80 focus:border-red-400 focus:ring-1 focus:ring-red-400'
              : 'border-matrix-border focus:border-matrix-accent focus:ring-1 focus:ring-matrix-accent'
          } ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
          rows={3}
        />
        {submittedAttempt && contentError && (
          <p role="alert" className="mt-1.5 font-mono text-xs text-red-400">
            ! {contentError}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        {!user ? (
          <span className="font-mono text-xs text-amber-500">
            // Iniciá sesión para comentar
          </span>
        ) : (
          <span className="font-mono text-xs text-matrix-muted">
            {trimmedContent.length} chars
          </span>
        )}

        <button
          type="submit"
          disabled={submitting || !user}
          className="rounded border border-matrix-accent/60 bg-matrix-accent/10 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wide text-matrix-accent transition hover:border-matrix-accent hover:bg-matrix-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? '[ enviando... ]' : '[ comentar ]'}
        </button>
      </div>
    </form>
  )
}