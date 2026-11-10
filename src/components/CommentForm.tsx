import { useState } from 'react'
import { motion } from 'motion/react'
import { useAuth } from '../context/useAuth'
import { createComment, getApiErrorMessage } from '../services/api'
import type { Comment } from '../types'

interface CommentFormProps {
  postId: number
  onCreated: (comment: Comment) => void
}

const SendIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
)

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
      onCreated({ ...comment, User: user })
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
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative overflow-hidden rounded-xl border border-matrix-border/80 bg-matrix-card/75 p-4 shadow-[0_0_25px_rgba(0,0,0,0.3)] backdrop-blur-md"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-matrix-accent/70 to-transparent" />
      <div className="mb-3 flex items-center justify-between border-b border-matrix-border/60 pb-3">
        <label
          htmlFor="comment-content"
          className="font-mono text-xs font-bold uppercase tracking-wider text-matrix-accent"
        >
          &gt; nuevo_comentario<span className="animate-pulse">_</span>
        </label>
        <span className="font-mono text-[10px] uppercase tracking-wider text-matrix-muted">
          input://comment
        </span>
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-3 font-mono text-sm text-matrix-accent/70">
          &gt;
        </span>
        <textarea
          id="comment-content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Escribí tu comentario..."
          rows={3}
          maxLength={500}
          className="w-full resize-y rounded-lg border border-matrix-border bg-black/50 py-2 pl-8 pr-3 font-mono text-sm text-matrix-text placeholder-matrix-muted/40 transition-all focus:border-matrix-accent focus:outline-none focus:ring-1 focus:ring-matrix-accent focus:shadow-[0_0_18px_rgba(16,185,129,0.2)]"
          disabled={loading}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          className="mt-2 font-mono text-xs text-red-400"
        >
          ! {error}
        </motion.p>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-xs text-matrix-muted">
          <span className={content.length === 500 ? 'text-amber-300' : 'text-matrix-accent'}>
            {String(content.length).padStart(3, '0')}
          </span>
          /500 chars
        </span>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-matrix-accent/70 bg-matrix-accent/10 px-4 py-2 font-mono text-xs font-bold text-matrix-accent transition-all hover:bg-matrix-accent hover:text-black hover:shadow-[0_0_18px_rgba(16,185,129,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SendIcon className={loading ? 'h-4 w-4 animate-pulse' : 'h-4 w-4'} />
          {loading ? '[ transmitiendo... ]' : '[ enviar_comentario ]'}
        </button>
      </div>
    </motion.form>
  )
}
