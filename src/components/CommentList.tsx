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
      <p className="rounded-lg border border-matrix-border/60 bg-black/40 p-3 font-mono text-xs text-matrix-accent">
        [ cargando_comentarios... ]
      </p>
    )
  }

  if (comments.length === 0) {
    return (
      <p className="rounded-lg border border-matrix-border/60 bg-black/40 p-3 font-mono text-xs text-matrix-muted">
        // [ todavía_no_hay_comentarios ]
      </p>
    )
  }

  return (
    <ul className="space-y-3" aria-label="Comentarios de la publicación">
      {comments.map((comment) => (
        <li
          key={comment.id}
          className="space-y-1 rounded-lg border border-matrix-border/60 bg-black/40 p-3 text-xs font-mono text-matrix-text"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-matrix-accent">
              @{comment.User?.nickName ?? `usuario_${comment.UserId ?? comment.userId ?? 'desconocido'}`}
            </span>
            <span className="text-matrix-muted">#COM-{String(comment.id).padStart(3, '0')}</span>
          </div>
          <p className="leading-relaxed">{comment.content}</p>
        </li>
      ))}
    </ul>
  )
}
