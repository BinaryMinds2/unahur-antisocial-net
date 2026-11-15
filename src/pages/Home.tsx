import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, type Variants } from 'motion/react'
import AuthRequiredModal from '../components/AuthRequiredModal'
import DatabaseErrorTerminal from '../components/DatabaseErrorTerminal'
import PostCard from '../components/PostCard'
import TerminalIcon from '../components/TerminalIcon'
import { useAuth } from '../context/useAuth'
import {
  getCommentsByPost,
  getPostImages,
  getPosts,
  getUsers,
} from '../services/api'
import {
  getProfileStats,
  isFollowingUser,
  PROFILE_STATS_UPDATED,
  updateFollowing,
  type ProfileStats,
} from '../services/profileStats'
import type { Post, Tag, User } from '../types'

function getPostSortValue(post: Post): number {
  if (post.createdAt) {
    return new Date(post.createdAt).getTime()
  }

  return Number(post.id)
}

function readLocalPosts(): Post[] {
  try {
    const storedPosts = JSON.parse(localStorage.getItem('unahur_local_posts') ?? '[]') as Post[]
    return Array.isArray(storedPosts) ? storedPosts : []
  } catch {
    return []
  }
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
}

function SuggestedUserRow({ suggestedUser }: { suggestedUser: User }) {
  const { user: authenticatedUser } = useAuth()
  const [following, setFollowing] = useState(() =>
    isFollowingUser(suggestedUser.nickName),
  )
  const [showAuthRequired, setShowAuthRequired] = useState(false)

  useEffect(() => {
    const syncFollowing = () =>
      setFollowing(
        authenticatedUser ? isFollowingUser(suggestedUser.nickName) : false,
      )

    window.addEventListener(PROFILE_STATS_UPDATED, syncFollowing)
    window.addEventListener('storage', syncFollowing)
    return () => {
      window.removeEventListener(PROFILE_STATS_UPDATED, syncFollowing)
      window.removeEventListener('storage', syncFollowing)
    }
  }, [authenticatedUser, suggestedUser.nickName])

  const handleFollowChange = () => {
    if (!authenticatedUser) {
      setShowAuthRequired(true)
      return
    }

    updateFollowing(suggestedUser.nickName, !following)
    setFollowing(!following)
  }

  return (
    <>
      <AuthRequiredModal
        open={showAuthRequired}
        onClose={() => setShowAuthRequired(false)}
      />
      <li className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <TerminalIcon className="h-4 w-4 shrink-0 text-matrix-accent" />
          <span className="truncate font-mono text-xs text-matrix-text">
            @{suggestedUser.nickName}
          </span>
        </div>
        <button
          type="button"
          onClick={handleFollowChange}
          className={`shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] transition ${
            following
              ? 'border-orange-400/70 bg-orange-500/10 text-orange-300 hover:border-orange-300'
              : 'border-matrix-accent/60 bg-matrix-accent/10 text-matrix-accent hover:border-matrix-accent'
          }`}
        >
          {following ? '[ siguiendo ]' : '[ +seguir ]'}
        </button>
      </li>
    </>
  )
}

function getTagEntries(posts: Post[]) {
  const tagCounts = new Map<string, { tag: Tag; count: number }>()

  posts.forEach((post) => {
    ;(post.Tags ?? post.tags ?? []).forEach((tag) => {
      const current = tagCounts.get(tag.name.toLowerCase())
      tagCounts.set(tag.name.toLowerCase(), {
        tag,
        count: (current?.count ?? 0) + 1,
      })
    })
  })

  return [...tagCounts.values()]
    .sort((first, second) => second.count - first.count)
    .slice(0, 4)
}

export default function Home() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [localPosts, setLocalPosts] = useState<Post[]>(readLocalPosts)
  const [tagQuery, setTagQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([])
  const [profileStats, setProfileStats] = useState<ProfileStats>(getProfileStats)

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
    let active = true

    getUsers()
      .then((users) => {
        if (!active) return
        const availableUsers = users.filter((candidate) => candidate.id !== user?.id)
        const shuffledUsers = [...availableUsers].sort(() => Math.random() - 0.5)
        setSuggestedUsers(shuffledUsers.slice(0, 3))
      })
      .catch(() => {
        if (active) setSuggestedUsers([])
      })

    return () => {
      active = false
    }
  }, [user?.id])

  const mergedPosts = useMemo(
    () => [...localPosts, ...posts].sort((first, second) => getPostSortValue(second) - getPostSortValue(first)),
    [localPosts, posts],
  )

  const filteredPosts = useMemo(() => {
    const normalizedQuery = tagQuery.replace('#', '').toLowerCase().trim()
    if (!normalizedQuery) return mergedPosts

    return mergedPosts.filter((post) =>
      (post.Tags ?? post.tags ?? []).some((tag) =>
        tag.name.toLowerCase().includes(normalizedQuery),
      ),
    )
  }, [mergedPosts, tagQuery])

  const topTags = useMemo(() => getTagEntries(mergedPosts), [mergedPosts])
  const userPostCount = user
    ? mergedPosts.filter(
        (post) =>
          post.User?.id === user.id ||
          post.user?.id === user.id ||
          post.author?.id === user.id ||
          post.UserId === user.id ||
          post.userId === user.id,
      ).length
    : 0

  useEffect(() => {
    let active = true

    getPosts()
      .then(async (loadedPosts) => {
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

        if (active) setPosts(postsWithDetails)
      })
      .catch((requestError: unknown) => {
        if (active) {
          try {
            const storedPosts = JSON.parse(localStorage.getItem('unahur_local_posts') ?? '[]') as Post[]
            setPosts(Array.isArray(storedPosts) ? storedPosts : [])
          } catch {
            setPosts([])
          }

          setError(
            requestError instanceof Error
              ? requestError.message
              : 'No se pudieron cargar las publicaciones.',
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [retryCount])

  return (
    <section className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden bg-matrix-bg px-4 py-8">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#10b9810a_1px,transparent_1px),linear-gradient(to_bottom,#10b9810a_1px,transparent_1px)] [background-size:3rem_3rem]" />
      <div className="pointer-events-none absolute left-1/2 top-1/4 z-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-matrix-accent/10 blur-[160px] animate-pulse" />

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-start justify-center gap-6 xl:grid-cols-[260px_minmax(0,720px)_260px]">
        <aside className="sticky top-24 hidden space-y-4 xl:block">
          <div className="space-y-4 rounded-xl border border-matrix-border bg-matrix-card/70 p-4 shadow-xl backdrop-blur-md">
            <div className="font-mono text-xs text-matrix-accent">
              &gt; NODE_IDENTITY_
            </div>
            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="rounded-full border border-matrix-accent/30 bg-matrix-bg p-2 text-matrix-accent">
                    <TerminalIcon className="h-6 w-6" />
                  </div>
                  <span className="truncate font-mono text-sm text-matrix-text">
                    @{user.nickName}
                  </span>
                </div>
                <div className="flex gap-4 font-mono text-[10px] text-matrix-muted">
                  <span>posts: {userPostCount}</span>
                  <span>seguidos: {profileStats.following.length}</span>
                </div>
                <Link
                  to="/create-post"
                  className="block rounded border border-matrix-accent/60 bg-matrix-accent/10 px-2 py-1.5 text-center font-mono text-xs text-matrix-accent transition hover:border-matrix-accent hover:bg-matrix-accent/20"
                >
                  [ +publicar ]
                </Link>
              </>
            ) : (
              <>
                <span className="block font-mono text-xs text-matrix-muted">
                  [ MODO_INVITADO ]
                </span>
                <Link
                  to="/login"
                  className="block rounded border border-matrix-accent/60 bg-matrix-accent/10 px-2 py-1.5 text-center font-mono text-xs text-matrix-accent transition hover:border-matrix-accent hover:bg-matrix-accent/20"
                >
                  [ /iniciar_sesion ]
                </Link>
              </>
            )}
          </div>

          {topTags.length > 0 && (
            <div className="space-y-3 rounded-xl border border-matrix-border bg-matrix-card/70 p-4 shadow-xl backdrop-blur-md">
              <div className="font-mono text-xs text-matrix-accent">
                &gt; TOP_TAGS_
              </div>
              <ul>
                {topTags.map(({ tag, count }) => (
                  <li key={tag.id}>
                    <button
                      type="button"
                      onClick={() => setTagQuery(`#${tag.name}`)}
                      className="flex w-full items-center justify-between rounded px-2 py-1.5 font-mono text-xs transition-colors hover:bg-matrix-accent/10 hover:text-matrix-accent"
                    >
                      <span>#{tag.name}</span>
                      <span className="text-matrix-muted">{count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <main className="min-w-0 space-y-6">
          <header className="flex items-center justify-between rounded-xl border border-matrix-border bg-matrix-card/60 p-5 shadow-xl backdrop-blur-md">
            <div>
              <div className="mb-1 flex items-center gap-1 font-mono text-xs text-matrix-accent/80">
                <span>&gt; SYSTEM_FEED</span>
                <span className="animate-pulse font-bold">_</span>
              </div>
              <h1 className="flex items-center gap-2 font-mono text-xl font-bold tracking-wide text-matrix-text sm:text-2xl">
                // publicaciones
              </h1>
            </div>
            <div className="hidden items-center gap-2 rounded border border-matrix-border/50 bg-black/40 px-3 py-1.5 font-mono text-xs text-matrix-muted sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-matrix-accent" />
              <span>NET_STATUS: ONLINE</span>
            </div>
          </header>

          {!loading && !error && (
            <div className="flex items-center justify-between gap-3">
              <span className="whitespace-nowrap font-mono text-xs text-matrix-muted">
                &gt; mostrando {filteredPosts.length} registros
              </span>
              <div className="relative w-full sm:w-64">
                <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-matrix-accent">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </span>
                <input
                  value={tagQuery}
                  onChange={(event) => setTagQuery(event.target.value)}
                  placeholder="filtrar_por_tag..."
                  aria-label="Filtrar publicaciones por etiqueta"
                  className="w-full rounded-lg border border-matrix-border bg-matrix-card/80 py-1.5 pl-9 pr-8 text-xs font-mono text-matrix-text outline-none backdrop-blur-md transition-all placeholder:text-matrix-muted/60 focus:border-matrix-accent focus:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                />
                {tagQuery && (
                  <button
                    type="button"
                    aria-label="Limpiar filtro de etiqueta"
                    onClick={() => setTagQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-sm text-matrix-muted transition hover:text-matrix-accent"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          )}

          {loading && (
            <div className="space-y-4" aria-label="Cargando publicaciones" aria-busy="true">
              {[1, 2, 3].map((skeleton) => (
                <div key={skeleton} className="h-52 animate-pulse rounded-xl border border-matrix-border/50 bg-matrix-card/40" />
              ))}
            </div>
          )}
          {error && (
            <DatabaseErrorTerminal
              error={error}
              onRetry={() => {
                setError(null)
                setLoading(true)
                setRetryCount((count) => count + 1)
              }}
            />
          )}
          {!loading && !error && mergedPosts.length === 0 && (
            <p className="font-mono text-matrix-muted">
              // [ sin publicaciones para mostrar ]
            </p>
          )}
          {!loading && !error && mergedPosts.length > 0 && filteredPosts.length === 0 && (
            <p className="font-mono text-matrix-muted">
              // [ no hay publicaciones con esta etiqueta ]
            </p>
          )}

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDeleted={(deletedPostId) => {
                  setPosts((current) => current.filter((currentPost) => currentPost.id !== deletedPostId))
                  setLocalPosts((current) => current.filter((currentPost) => currentPost.id !== deletedPostId))
                }}
              />
            ))}
          </motion.div>
        </main>

        {suggestedUsers.length > 0 && (
          <aside className="sticky top-24 hidden xl:block">
            <div className="space-y-3 rounded-xl border border-matrix-border bg-matrix-card/70 p-4 backdrop-blur-md">
              <div className="font-mono text-xs text-matrix-accent">
                &gt; SUGERIDOS_RED<span className="animate-pulse">_</span>
              </div>
              <ul className="space-y-3">
                {suggestedUsers.map((suggestedUser) => (
                  <SuggestedUserRow key={suggestedUser.id} suggestedUser={suggestedUser} />
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>
    </section>
  )
}
