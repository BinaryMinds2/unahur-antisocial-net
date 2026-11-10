import type { Comment } from '../types'

interface CommentListProps {
  comments: Comment[]
  loading?: boolean
}

export default function CommentList({
  comments,
  loading = false,
}: CommentListProps) {
  if (loading) {
    return (
      <p className="rounded border border-matrix-border bg-matrix-bg p-4 font-mono text-xs text-matrix-accent">
        [ cargando_comentarios... ]
      </p>
    )
  }

  if (comments.length === 0) {
    return (
      <p className="rounded border border-matrix-border bg-matrix-bg p-4 font-mono text-xs text-matrix-muted">
        // [ todavía_no_hay_comentarios ]
      </p>
    )
  }

  return (
    <ul className="space-y-3" aria-label="Comentarios de la publicación">
      {comments.map((comment) => (
        <li
          key={comment.id}
          className="rounded border border-matrix-border bg-matrix-bg/70 p-4"
        >
          <div className="mb-2 flex items-center justify-between gap-3 font-mono text-xs">
            <span className="font-bold text-matrix-accent">
              @{comment.User?.nickName ?? `usuario_${comment.UserId ?? comment.userId ?? 'desconocido'}`}
            </span>
            <span className="text-matrix-muted">#COM-{String(comment.id).padStart(3, '0')}</span>
          </div>
          <p className="text-sm leading-relaxed text-matrix-text">{comment.content}</p>
        </li>
      ))}
    </ul>
  )
}
