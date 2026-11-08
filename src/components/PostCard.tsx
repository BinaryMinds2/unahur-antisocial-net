import { Link } from 'react-router-dom'
import { useState } from 'react'
import type { Post } from '../types'

interface PostCardProps {
  post: Post
}

export function SpyAvatar({ className = 'w-5 h-5' }: { className?: string }) {
  return (
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
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M3 11h18" />
      <path d="M5 11v-4a3 3 0 0 1 3 -3h8a3 3 0 0 1 3 3v4" />
      <path d="M4 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
      <path d="M14 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
      <path d="M10 17h4" />
    </svg>
  )
}

export default function PostCard({ post }: PostCardProps) {
  const user = post.User ?? post.user ?? post.author
  const tags = post.Tags ?? post.tags ?? []
  const images = post.PostImages ?? post.images ?? []
  const commentsCount = post.commentsCount ?? post.comments?.length ?? 0
  const [failedImageIds, setFailedImageIds] = useState<number[]>([])
  const visibleImages = images.filter(
    (image) => !failedImageIds.includes(image.id),
  )

  const imageGridClass =
    visibleImages.length === 1
      ? 'grid-cols-1'
      : visibleImages.length === 2
        ? 'grid-cols-2'
        : 'grid-cols-2 sm:grid-cols-3'

  return (
    <article className="group relative overflow-hidden rounded-lg border border-matrix-border bg-matrix-card/80 p-5 shadow-lg transition-all duration-200 hover:border-matrix-accent/40">
      <div className="absolute inset-y-0 left-0 w-1 bg-matrix-border transition-colors duration-200 group-hover:bg-matrix-accent" />

      <header className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-full border border-matrix-accent/30 bg-matrix-bg p-1.5 text-matrix-accent transition-colors group-hover:border-matrix-accent">
            <SpyAvatar className="h-6 w-6" />
          </div>
          <span className="truncate font-mono font-bold text-matrix-text transition-colors group-hover:text-matrix-accent">
            @{user?.nickName ?? `usuario_${post.UserId ?? post.userId}`}
          </span>
        </div>
        <span className="shrink-0 font-mono text-xs text-matrix-muted">
          #POST-{String(post.id).padStart(3, '0')}
        </span>
      </header>

      <p className="my-3 text-sm leading-relaxed text-matrix-text sm:text-base">
        {post.description}
      </p>

      {visibleImages.length > 0 && (
        <div
          className={`my-3 grid gap-2 overflow-hidden rounded-md border border-matrix-border ${imageGridClass}`}
        >
          {visibleImages.map((image) => (
            <div className="overflow-hidden" key={image.id}>
              <img
                src={image.url}
                alt="Imagen de publicación"
                className="h-52 w-full object-cover transition-transform hover:scale-[1.01] sm:h-64"
                loading="lazy"
                onError={() => {
                  setFailedImageIds((currentIds) =>
                    currentIds.includes(image.id)
                      ? currentIds
                      : [...currentIds, image.id],
                  )
                }}
              />
            </div>
          ))}
        </div>
      )}

      {tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Etiquetas">
          {tags.map((tag) => (
            <li
              className="cursor-pointer rounded border border-matrix-accent/20 bg-matrix-bg/80 px-2.5 py-1 font-mono text-xs text-matrix-accent transition-colors hover:border-matrix-accent"
              key={tag.id}
            >
              #{tag.name}
            </li>
          ))}
        </ul>
      )}

      <footer className="mt-4 flex items-center justify-between border-t border-matrix-border/60 pt-3 font-mono text-xs">
        <span className="flex items-center gap-1.5 text-matrix-muted">
          [ &gt; {commentsCount} comentarios ]
        </span>
        <Link
          to={`/post/${post.id}`}
          className="flex items-center gap-1 font-semibold text-matrix-accent transition-transform group-hover:translate-x-0.5 hover:underline"
        >
          [ ver_detalle -&gt; ]
        </Link>
      </footer>
    </article>
  )
}
