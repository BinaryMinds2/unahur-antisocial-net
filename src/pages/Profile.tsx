import { useEffect, useState } from 'react'
import { motion, type Variants } from 'motion/react'
import { Link } from 'react-router-dom'
import PostCard from '../components/PostCard'
import { useAuth } from '../context/useAuth'
import {
  getApiErrorMessage,
  getCommentsByPost,
  getPostImages,
  getPostsByUser,
} from '../services/api'
import {
  getProfileStats,
  PROFILE_STATS_UPDATED,
  type ProfileStats,
} from '../services/profileStats'
import type { Post } from '../types'

type ProfileList = 'followers' | 'following'

const postsVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
}

export default function Profile() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeList, setActiveList] = useState<ProfileList | null>(null)
  const [profileStats, setProfileStats] = useState<ProfileStats>(getProfileStats)

  useEffect(() => {
    if (!activeList) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveList(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeList])

  useEffect(() => {
    const syncProfileStats = () => setProfileStats(getProfileStats())

    window.addEventListener(PROFILE_STATS_UPDATED, syncProfileStats)
    window.addEventListener('storage', syncProfileStats)
    return () => {
      window.removeEventListener(PROFILE_STATS_UPDATED, syncProfileStats)
      window.removeEventListener('storage', syncProfileStats)
    }
  }, [])

  useEffect(() => {
    if (!user) return

    let active = true

    const localPosts = JSON.parse(localStorage.getItem('unahur_local_posts') ?? '[]') as Post[]
    const filteredLocalPosts = (Array.isArray(localPosts) ? localPosts : []).filter(
      (post) => post.userId === user.id || post.UserId === user.id,
    )

    const syncPosts = async () => {
      try {
        const loadedPosts = await getPostsByUser(user.id)
        const postsWithDetails = await Promise.all(
          loadedPosts.map(async (post) => {
            const [images, comments] = await Promise.all([
              getPostImages(post.id),
              getCommentsByPost(post.id),
            ])

            return {
              ...post,
              PostImages: images,
              commentsCount: comments.length,
            }
          }),
        )

        if (!active) return

        const mergedPosts = [...filteredLocalPosts, ...postsWithDetails].sort(
          (first, second) =>
            new Date(second.createdAt ?? new Date()).getTime() -
            new Date(first.createdAt ?? new Date()).getTime(),
        )
        setPosts(mergedPosts)
      } catch (requestError: unknown) {
        if (!active) return
        setPosts(filteredLocalPosts)
        setError(
          getApiErrorMessage(
            requestError,
            'No se pudieron cargar tus publicaciones.',
          ),
        )
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void syncPosts()

    return () => {
      active = false
    }
  }, [user])

  if (!user) {
    return null
  }

  const activeListTitle =
    activeList === 'followers' ? 'seguidores' : 'seguidos'
  const activeListUsers =
    activeList === 'followers'
      ? profileStats.followers
      : profileStats.following

  return (
    <>
      {activeList && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
        >
          <button
            type="button"
            className="absolute inset-0 h-full w-full cursor-default"
            aria-label="Cerrar listado"
            onClick={() => setActiveList(null)}
          />
          <motion.section
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-list-title"
            className="relative z-10 w-full max-w-md rounded-2xl border border-matrix-accent/50 bg-matrix-card p-5 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
          >
            <header className="mb-5 flex items-center justify-between border-b border-matrix-border pb-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-matrix-accent">
                  &gt; USER_NETWORK
                </p>
                <h2
                  id="profile-list-title"
                  className="mt-1 font-mono text-lg font-bold text-matrix-text"
                >
                  {activeListTitle} de @{user.nickName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveList(null)}
                className="rounded border border-matrix-border px-3 py-1 font-mono text-sm text-matrix-muted transition hover:border-matrix-accent hover:text-matrix-accent"
                aria-label="Cerrar listado"
              >
                [ X ]
              </button>
            </header>

            {activeListUsers.length > 0 ? (
              <ul className="max-h-[50vh] space-y-2 overflow-y-auto">
                {activeListUsers.map((nickName) => (
                  <li
                    key={nickName}
                    className="flex items-center gap-3 rounded-lg border border-matrix-border/70 bg-matrix-bg/70 px-3 py-2.5 font-mono text-sm text-matrix-text"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-matrix-accent/50 bg-matrix-accent/10 text-matrix-accent">
                      {nickName.replace(/^@/, '').charAt(0).toUpperCase()}
                    </span>
                    {nickName.startsWith('@') ? nickName : `@${nickName}`}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center font-mono text-sm text-matrix-muted">
                // [ todavía no hay {activeListTitle} ]
              </p>
            )}
          </motion.section>
        </motion.div>
      )}

    <section className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden bg-matrix-bg px-4 py-8">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#10b9810a_1px,transparent_1px),linear-gradient(to_bottom,#10b9810a_1px,transparent_1px)] [background-size:3rem_3rem]" />

      <div className="relative z-10 mx-auto max-w-3xl space-y-6">
        <header className="rounded-[22px] border border-matrix-border bg-matrix-card/70 p-5 shadow-[0_0_28px_rgba(16,185,129,0.08)] backdrop-blur-md">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(300px,auto)] md:items-center">
            <div className="flex min-w-0 items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-matrix-accent bg-[radial-gradient(circle,_rgba(16,185,129,0.16),_rgba(2,6,23,0.9))] font-mono text-2xl font-bold text-matrix-accent shadow-[0_0_18px_rgba(16,185,129,0.3)]">
                {user.nickName.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-matrix-accent/80">
                  <span>&gt;</span>
                  <span>USER_PROFILE</span>
                </div>
                <h1 className="font-mono text-xl font-bold tracking-wide text-matrix-text sm:text-2xl">
                  <span className="block">// publicaciones de</span>
                  <span className="block break-all">@{user.nickName}</span>
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-2 border-t border-matrix-border/60 pt-4 md:min-w-[300px] md:border-l md:border-t-0 md:pl-5 md:pt-0">
              <div className="min-w-0 text-center">
                <div className="font-mono text-2xl font-bold leading-none text-matrix-text sm:text-3xl">
                  {posts.length}
                </div>
                <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-matrix-muted sm:text-[10px] sm:tracking-[0.18em]">
                  publicaciones
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveList('followers')}
                className="min-w-0 cursor-pointer rounded-lg px-1 py-2 text-center transition hover:bg-matrix-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent"
                aria-label={`Ver ${profileStats.followers.length} seguidores`}
              >
                <div className="font-mono text-2xl font-bold leading-none text-matrix-text sm:text-3xl">
                  {profileStats.followers.length}
                </div>
                <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-matrix-muted sm:text-[10px] sm:tracking-[0.18em]">
                  seguidores
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveList('following')}
                className="min-w-0 cursor-pointer rounded-lg px-1 py-2 text-center transition hover:bg-matrix-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent"
                aria-label={`Ver ${profileStats.following.length} seguidos`}
              >
                <div className="font-mono text-2xl font-bold leading-none text-matrix-text sm:text-3xl">
                  {profileStats.following.length}
                </div>
                <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-matrix-muted sm:text-[10px] sm:tracking-[0.18em]">
                  seguidos
                </div>
              </button>
            </div>
          </div>
        </header>

        {loading && (
          <div className="space-y-4" aria-label="Cargando publicaciones" aria-busy="true">
            {[1, 2].map((skeleton) => (
              <div
                key={skeleton}
                className="h-52 animate-pulse rounded-xl border border-matrix-border/50 bg-matrix-card/40"
              />
            ))}
          </div>
        )}

        {error && (
          <p className="rounded border border-red-500/50 bg-red-950/30 p-4 font-mono text-red-400">
            ! {error}
          </p>
        )}

        {!loading && !error && posts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative mx-auto my-6 max-w-2xl overflow-hidden rounded-xl border border-dashed border-zinc-700/80 bg-zinc-900/40 p-8 text-center shadow-[0_0_30px_rgba(161,161,170,0.06)] backdrop-blur-md sm:p-10"
          >
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-400/10 blur-[80px]" />

            <div className="relative z-10 flex flex-col items-center space-y-4 font-mono">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
                className="rounded-2xl border border-zinc-700/60 bg-zinc-800/60 p-4 text-zinc-400 shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-12 w-12 text-zinc-300/80 drop-shadow-[0_0_10px_rgba(212,212,216,0.2)]"
                  aria-hidden="true"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M10 9h.01" />
                  <path d="M14 9h.01" />
                  <path d="M12 3a7 7 0 0 1 7 7v1l1 0a2 2 0 1 1 0 4l-1 0v3l2 3h-10a6 6 0 0 1 -6 -5.775l0 -.226l-1 0a2 2 0 0 1 0 -4l1 0v-1a7 7 0 0 1 7 -7l0 .001" />
                  <path d="M11 14h2a1 1 0 0 0 -2 0" />
                </svg>
              </motion.div>

              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <span>&gt; EMPTY_POSTS_LOG</span>
                <span className="animate-pulse font-bold">_</span>
              </div>

              <p className="max-w-md text-sm leading-relaxed text-zinc-300 sm:text-base">
                Ups, no encontramos ninguna publicación hecha por vos.{' '}
                <span className="block text-zinc-400 sm:inline">
                  Subí algo, no seas aguafiestas.
                </span>
              </p>

              <Link
                className="mt-2 inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/80 px-4 py-2 text-xs font-bold text-zinc-300 transition-all duration-200 hover:border-matrix-accent hover:bg-matrix-accent/20 hover:text-matrix-accent"
                to="/create-post"
              >
                <span>[ + crear_primera_publicacion ]</span>
              </Link>
            </div>
          </motion.div>
        )}

        {!loading && !error && posts.length > 0 && (
          <motion.div
            variants={postsVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDeleted={(deletedPostId) =>
                  setPosts((current) =>
                    current.filter((currentPost) => currentPost.id !== deletedPostId),
                  )
                }
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
    </>
  )
}
