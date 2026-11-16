import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import { createComment, getApiErrorMessage } from '../services/api'
import type { Comment } from '../types' 

interface CommentFormProps {
  postId: number
  onCreated: (comment: Comment) => void
}

export default function CommentForm({ postId, onCreated }: CommentFormProps) {
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
      const newComment = await createComment({
        content: trimmedContent, // O 'description', dependiendo de tu API
        userId: user.id,
        postId: postId,
      })

      setContent('')
      setSubmittedAttempt(false)
      onCreated({ ...newComment, User: user })
    } catch (err: unknown) {
      setError(
        getApiErrorMessage(err, 'No se pudo enviar el comentario. Intentá nuevamente.')
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-6 flex flex-col overflow-hidden rounded-xl border border-matrix-border bg-matrix-card/80 shadow-[0_0_30px_rgba(16,185,129,0.08)] backdrop-blur-md"
    >
      {/* Barra superior estilo Terminal */}
      <div className="flex items-center justify-between border-b border-matrix-border bg-black/70 px-4 py-2.5">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <span className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <span className="font-mono text-xs text-matrix-muted">
          bash -- add_comment.sh
        </span>
        <div className="hidden items-center gap-1.5 rounded border border-matrix-border/60 bg-black/50 px-2.5 py-0.5 font-mono text-xs text-matrix-muted sm:flex">
          <span
            className={`h-2 w-2 rounded-full ${
              submitting ? 'animate-pulse bg-amber-400' : 'bg-matrix-accent'
            }`}
          />
          <span>{submitting ? 'status: posting' : 'status: ready'}</span>
        </div>
      </div>

      {/* Contenido del formulario */}
      <div className="space-y-4 p-6">
        <label
          htmlFor="comment-content"
          className="flex items-center gap-1 font-mono text-xs text-matrix-accent"
        >
          <span>&gt; NEW_COMMENT_PROTOCOL</span>
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
            placeholder="¿Qué opinás de esta publicación?"
            disabled={submitting || !user}
            className={`min-h-[100px] w-full resize-y rounded-lg border bg-matrix-bg/90 p-3.5 font-mono text-sm text-matrix-text outline-none transition-all placeholder:text-matrix-muted/50 ${
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

        <div className="flex items-center justify-between border-t border-matrix-border/60 pt-4">
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
            {submitting ? '[ procesando... ]' : '[ enviar_comentario ]'}
          </button>
        </div>
      </div>
    </form>
  )
}