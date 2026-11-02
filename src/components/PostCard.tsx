import type { Post } from '../types'

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
      <header className="mb-3 text-sm text-slate-400">
        <span className="font-semibold text-slate-200">
          {post.author?.nickName ?? `Usuario ${post.userId}`}
        </span>
        {post.createdAt && (
          <time className="ml-2" dateTime={post.createdAt}>
            {new Date(post.createdAt).toLocaleDateString('es-AR')}
          </time>
        )}
      </header>
      <p className="whitespace-pre-wrap text-slate-100">{post.description}</p>
      {post.tags && post.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Etiquetas">
          {post.tags.map((tag) => (
            <li
              className="rounded-full bg-slate-800 px-3 py-1 text-xs text-cyan-300"
              key={tag.id}
            >
              #{tag.name}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
