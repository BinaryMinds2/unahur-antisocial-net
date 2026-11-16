import type { Comment } from '../types'
import { motion } from 'motion/react'

interface CommentListProps {
  comments: Comment[]
}

export default function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="rounded border border-matrix-border/50 bg-matrix-bg/50 p-4 font-mono text-sm text-matrix-muted">
        // [ todavia_no_hay_comentarios ]
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-matrix-border bg-matrix-card/80 shadow-lg backdrop-blur-sm">
      {/* Barra superior estilo ventana de terminal para toda la lista */}
      <div className="flex items-center justify-between border-b border-matrix-border/60 bg-matrix-bg/50 px-4 py-2">
        <div className="font-mono text-xs text-matrix-muted">
          bash -- read_logs.sh
        </div>
        <div className="font-mono text-xs text-matrix-accent">
          [ {comments.length} registros_encontrados ]
        </div>
      </div>

      {/* Contenedor de los comentarios con scroll interno por si hay muchos */}
      <div className="max-h-[500px] space-y-1 overflow-y-auto p-4 font-mono text-sm">
        {comments.map((comment, index) => {
          const nickName =
            comment.User?.nickName ?? `usuario_${comment.UserId ?? 'anon'}`

          return (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              key={comment.id}
              className="group border-l-2 border-matrix-border/30 py-2 pl-4 transition-colors hover:border-matrix-accent/50 hover:bg-matrix-accent/5"
            >
              <div className="mb-1 flex items-center justify-between">
                <div className="font-bold text-matrix-accent">
                  @{nickName}
                </div>
                <div className="text-xs text-matrix-muted opacity-50 transition-opacity group-hover:opacity-100">
                  #COM-{String(comment.id).padStart(3, '0')}
                </div>
              </div>
              <div className="text-sm text-matrix-text">
                {'>'} {comment.content}
              </div>
            </motion.div>
          )
        })}
        {/* Cursor parpadeante al final del log */}
        <div className="animate-pulse pl-4 pt-2 text-matrix-accent">_</div>
      </div>
    </div>
  )
}