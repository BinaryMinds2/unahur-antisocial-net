import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion, type Variants } from 'motion/react'
import AuthRequiredModal from './AuthRequiredModal'
import ConfirmActionModal from './ConfirmActionModal'
import { useAuth } from '../context/useAuth'
import {
  isFollowingUser,
  PROFILE_STATS_UPDATED,
  updateFollowing,
} from '../services/profileStats'
import { deletePost, getApiErrorMessage } from '../services/api'
import type { Post } from '../types'

interface PostCardProps {
  post: Post
  onDeleted?: (postId: number) => void
}

const postVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
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

export default function PostCard({ post, onDeleted }: PostCardProps) {
  const { user: authenticatedUser } = useAuth()
  const user = post.User ?? post.user ?? post.author
  const targetNickName =
    user?.nickName ?? `usuario_${post.UserId ?? post.userId}`
  const tags = post.Tags ?? post.tags ?? []
  const images = post.PostImages ?? post.images ?? []
  const commentsCount = post.commentsCount ?? post.comments?.length ?? 0
  const [failedImageIds, setFailedImageIds] = useState<number[]>([])
  const [isFollowing, setIsFollowing] = useState(() =>
    isFollowingUser(targetNickName),
  )
  const [followError, setFollowError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAuthRequired, setShowAuthRequired] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const currentUser = authenticatedUser
  const isOwnPost =
    currentUser &&
    (post.User?.id === currentUser.id ||
      post.user?.id === currentUser.id ||
      post.author?.id === currentUser.id ||
      post.UserId === currentUser.id ||
      post.userId === currentUser.id)
  const visibleImages = images.filter(
    (image) => !failedImageIds.includes(image.id),
  )

  const imageGridClass =
    visibleImages.length === 1
      ? 'grid-cols-1'
      : visibleImages.length === 2
        ? 'grid-cols-2'
        : 'grid-cols-2 sm:grid-cols-3'

  useEffect(() => {
    const syncFollowing = () => {
      setIsFollowing(
        authenticatedUser ? isFollowingUser(targetNickName) : false,
      )
    }

    window.addEventListener(PROFILE_STATS_UPDATED, syncFollowing)
    window.addEventListener('storage', syncFollowing)
    return () => {
      window.removeEventListener(PROFILE_STATS_UPDATED, syncFollowing)
      window.removeEventListener('storage', syncFollowing)
    }
  }, [authenticatedUser, targetNickName])

  const handleFollowChange = (shouldFollow: boolean) => {
    if (!authenticatedUser) {
      setShowAuthRequired(true)
      return
    }

    try {
      updateFollowing(targetNickName, shouldFollow)
      setIsFollowing(shouldFollow)
      setFollowError('')
    } catch (error: unknown) {
      setFollowError(
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar la lista de seguidos.',
      )
    }
  }

  const handleDelete = async () => {
    if (!currentUser?.id || !isOwnPost) return

    setIsDeleting(true)
    setDeleteError('')
    try {
      const localPosts = JSON.parse(
        localStorage.getItem('unahur_local_posts') ?? '[]',
      ) as Post[]
      const localPostExists = Array.isArray(localPosts)
        ? localPosts.some((localPost) => localPost.id === post.id)
        : false

      if (localPostExists) {
        localStorage.setItem(
          'unahur_local_posts',
          JSON.stringify(localPosts.filter((localPost) => localPost.id !== post.id)),
        )
      } else {
        await deletePost(post.id, currentUser.id)
      }

      setShowDeleteConfirm(false)
      onDeleted?.(post.id)
    } catch (error: unknown) {
      setDeleteError(
        getApiErrorMessage(error, 'No se pudo eliminar la publicación.'),
      )
      setShowDeleteConfirm(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
    <AuthRequiredModal
      open={showAuthRequired}
      onClose={() => setShowAuthRequired(false)}
    />
    <ConfirmActionModal
      open={showDeleteConfirm}
      title={`¿Eliminar la publicación #${post.id}? Esta acción no se puede deshacer.`}
      confirmLabel={isDeleting ? '[ / eliminando... ]' : '[ / eliminar ]'}
      cancelLabel="[ / cancelar ]"
      onConfirm={() => void handleDelete()}
      onCancel={() => setShowDeleteConfirm(false)}
    />
    <motion.article
      layout
      variants={postVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-xl border border-matrix-border bg-matrix-card/70 p-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.01] hover:border-matrix-accent/60 hover:border-l-matrix-accent hover:shadow-[0_0_25px_rgba(16,185,129,0.12)]"
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-matrix-border transition-colors duration-200 group-hover:bg-matrix-accent" />

      <header className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-full border border-matrix-accent/30 bg-matrix-bg p-1.5 text-matrix-accent transition-colors group-hover:border-matrix-accent">
            <SpyAvatar className="h-6 w-6" />
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-mono font-bold text-matrix-text transition-colors group-hover:text-matrix-accent">
              @{user?.nickName ?? `usuario_${post.UserId ?? post.userId}`}
            </span>
            {!isOwnPost && (!authenticatedUser || !isFollowing) ? (
              <button
                type="button"
                onClick={() => handleFollowChange(true)}
                className="shrink-0 rounded border border-matrix-accent/60 bg-matrix-accent/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-tight text-matrix-accent transition hover:border-matrix-accent hover:bg-matrix-accent/20"
                aria-label={`Seguir a ${targetNickName}`}
              >
                [ +seguir ]
              </button>
            ) : null}
            {authenticatedUser && !isOwnPost && isFollowing ? (
              <button
                type="button"
                onClick={() => handleFollowChange(false)}
                className="shrink-0 rounded border border-orange-400/70 bg-orange-500/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-tight text-orange-300 transition hover:border-orange-300 hover:bg-orange-500/20"
                aria-label={`Dejar de seguir a ${targetNickName}`}
              >
                [ dejar de seguir ]
              </button>
            ) : null}
            {isOwnPost ? (
              <span className="shrink-0 rounded border border-matrix-border/70 bg-matrix-bg/80 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-tight text-matrix-muted">
                [ yo ]
              </span>
            ) : null}
          </div>
        </div>
        <span className="shrink-0 font-mono text-xs text-matrix-muted">
          #POST-{String(post.id).padStart(3, '0')}
        </span>
      </header>

      {followError && (
        <p role="alert" className="mt-2 font-mono text-xs text-red-400">
          ! {followError}
        </p>
      )}
      {deleteError && (
        <p role="alert" className="mt-2 font-mono text-xs text-red-400">
          ! {deleteError}
        </p>
      )}

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
        <div className="flex items-center gap-4">
          {isOwnPost && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="font-semibold text-red-400 transition hover:text-red-300 hover:underline"
              aria-label={`Eliminar publicación ${post.id}`}
            >
              [ eliminar ]
            </button>
          )}
          <Link
            to={`/post/${post.id}`}
            className="flex items-center gap-1 font-semibold text-matrix-accent transition-transform group-hover:translate-x-0.5 hover:underline"
          >
            [ ver_detalle -&gt; ]
          </Link>
        </div>
      </footer>
    </motion.article>
    </>
  )
}
