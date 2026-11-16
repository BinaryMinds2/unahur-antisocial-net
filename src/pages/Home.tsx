import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, type Variants } from 'motion/react'
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

const WELCOME_DISMISSED_KEY = 'unahur_welcome_dismissed'

type FortuneCategory = 'SLOGAN' | 'DATO_CURIOSO' | 'DEV_LOG'
type FortuneItem = { category: FortuneCategory; text: string }

const FORTUNE_ITEMS: FortuneItem[] = [
  {
    category: 'SLOGAN',
    text: 'Menos scroll infinito; más ideas que valen la pena compartir.',
  },
  {
    category: 'SLOGAN',
    text: 'Una buena interfaz no grita: te ayuda a encontrar lo que buscás.',
  },
  {
    category: 'SLOGAN',
    text: 'Acá el algoritmo sos vos: seguí lo que te interesa.',
  },
  {
    category: 'DEV_LOG',
    text: 'Compiló a la primera. No toques nada y hacé un commit mental.',
  },
  {
    category: 'DEV_LOG',
    text: 'El bug no se fue: ahora está en una rama que nadie mira.',
  },
  {
    category: 'DEV_LOG',
    text: 'Funciona en mi máquina; ya es hora de presentarle a las demás.',
  },
  {
    category: 'DATO_CURIOSO',
    text: 'UNAHUR es la sigla de Universidad Nacional de Hurlingham.',
  },
  {
    category: 'DATO_CURIOSO',
    text: 'La universidad tiene su sede en Hurlingham, al oeste del Gran Buenos Aires.',
  },
]

function getPostSortValue(post: Post): number {
  if (post.createdAt) {
    return new Date(post.createdAt).getTime()
  }

  return Number(post.id)
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
      <li className="flex items-center justify-between gap-2 rounded-lg border border-matrix-border/50 bg-matrix-bg/60 px-2.5 py-2 transition-colors hover:border-matrix-accent/40">
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
              : 'border-matrix-accent/60 bg-matrix-accent/10 text-matrix-accent hover:border-matrix-accent hover:bg-matrix-accent/20'
          }`}
        >
          {following ? '[ siguiendo ]' : '[ +seguir ]'}
        </button>
      </li>
    </>
  )
}

function AboutUsCard({
  postCount,
  userCount,
  tagCount,
  compact = false,
  className = '',
}: {
  postCount: number
  userCount: number
  tagCount: number
  compact?: boolean
  className?: string
}) {
  const metrics = [
    { label: 'posts', value: postCount },
    { label: 'nodos', value: userCount },
    { label: 'tags', value: tagCount },
  ]

  return (
    <section
      className={`overflow-hidden rounded-xl border border-matrix-border bg-matrix-card/80 backdrop-blur-md ${className}`}
    >
      <div className="border-b border-matrix-border/80 bg-black/60 px-3.5 py-2 font-mono text-[11px] text-matrix-accent">
        &gt; cat /etc/about_unahur.md
      </div>
      <p
        className={`font-sans text-[10px] leading-relaxed text-matrix-text ${
          compact ? 'px-3 py-2' : 'p-3.5'
        }`}
      >
        Red abierta de Binary Minds para Construcción de Interfaces de Usuario
        (UNAHUR): avances, recursos y debates sin ruido comercial.
      </p>
      <div className="grid grid-cols-3 divide-x divide-matrix-border/60 border-t border-matrix-border/60">
        {metrics.map(({ label, value }) => (
          <div
            key={label}
            className={`flex flex-col items-center gap-1 ${
              compact ? 'py-2' : 'py-3'
            }`}
          >
            <span className="font-mono text-lg font-bold text-matrix-accent">
              {value}
            </span>
            <span className="font-mono text-[10px] text-matrix-muted">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

function FortuneWidget({
  fortune,
  onNext,
  className = '',
}: {
  fortune: FortuneItem
  onNext: () => void
  className?: string
}) {
  return (
    <section
      className={`overflow-hidden rounded-xl border border-matrix-border bg-matrix-card/80 backdrop-blur-md ${className}`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-matrix-border/80 bg-black/60 px-3.5 py-2">
        <span className="font-mono text-[11px] text-matrix-accent">
          &gt; $ fortune_
        </span>
        <button
          type="button"
          onClick={onNext}
          className="shrink-0 rounded border border-matrix-accent/50 bg-matrix-accent/10 px-2 py-1 font-mono text-[10px] text-matrix-accent transition-colors hover:border-matrix-accent hover:bg-matrix-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent"
        >
          [ $ siguiente ]
        </button>
      </div>
      <div className="space-y-2 p-3.5">
        <span className="inline-flex rounded border border-matrix-accent/40 bg-matrix-accent/10 px-2 py-0.5 font-mono text-[10px] text-matrix-accent">
          [ {fortune.category} ]
        </span>
        <AnimatePresence
          mode="wait"
          initial={false}
        >
          <motion.p
            key={fortune.text}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="min-h-[3rem] font-mono text-xs leading-relaxed text-matrix-text"
          >
            {fortune.text}
          </motion.p>
        </AnimatePresence>
      </div>
    </section>
  )
}

function getTagEntries(posts: Post[]) {
  const tagCounts = new Map<string, { tag: Tag; count: number }>()

  posts.forEach((post) => {
    ;(post.Tags ?? []).forEach((tag) => {
      const current = tagCounts.get(tag.name.toLowerCase())
      tagCounts.set(tag.name.toLowerCase(), {
        tag,
        count: (current?.count ?? 0) + 1,
      })
    })
  })

  return [...tagCounts.values()]
    .sort((first, second) => second.count - first.count)
    .slice(0, 6)
}

export default function Home() {
  const { user } = useAuth()
  const [isWelcomeDismissed, setIsWelcomeDismissed] = useState(
    () => sessionStorage.getItem(WELCOME_DISMISSED_KEY) === 'true',
  )
  const [posts, setPosts] = useState<Post[]>([])
  const [tagQuery, setTagQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([])
  const [totalUsersCount, setTotalUsersCount] = useState(0)
  const [fortuneIndex, setFortuneIndex] = useState(() =>
    Math.floor(Math.random() * FORTUNE_ITEMS.length),
  )
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
        setTotalUsersCount(users.length)
        const availableUsers = users.filter((candidate) => candidate.id !== user?.id)
        const shuffledUsers = [...availableUsers].sort(() => Math.random() - 0.5)
        setSuggestedUsers(shuffledUsers.slice(0, 3))
      })
      .catch(() => {
        if (active) {
          setSuggestedUsers([])
          setTotalUsersCount(0)
        }
      })

    return () => {
      active = false
    }
  }, [user?.id])

  const mergedPosts = useMemo(
    () =>
      [...posts].sort(
        (first, second) => getPostSortValue(second) - getPostSortValue(first),
      ),
    [posts],
  )

  const filteredPosts = useMemo(() => {
    const normalizedQuery = tagQuery.replace('#', '').toLowerCase().trim()
    if (!normalizedQuery) return mergedPosts

    return mergedPosts.filter((post) =>
      (post.Tags ?? []).some((tag) =>
        tag.name.toLowerCase().includes(normalizedQuery),
      ),
    )
  }, [mergedPosts, tagQuery])

  const topTags = useMemo(() => getTagEntries(mergedPosts), [mergedPosts])
  const uniqueTagsCount = useMemo(
    () =>
      new Set(
        mergedPosts.flatMap((post) =>
          (post.Tags ?? []).map((tag) => tag.name.toLowerCase()),
        ),
      ).size,
    [mergedPosts],
  )
  const currentFortune = FORTUNE_ITEMS[fortuneIndex]
  const userPostCount = user
    ? mergedPosts.filter(
        (post) =>
          post.User?.id === user.id ||
          post.UserId === user.id,
      ).length
    : 0

  const dismissWelcome = () => {
    sessionStorage.setItem(WELCOME_DISMISSED_KEY, 'true')
    setIsWelcomeDismissed(true)
  }

  const nextFortune = () => {
    setFortuneIndex((currentIndex) => {
      const offset =
        1 + Math.floor(Math.random() * (FORTUNE_ITEMS.length - 1))
      return (currentIndex + offset) % FORTUNE_ITEMS.length
    })
  }

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
    <section className="relative min-h-[calc(100vh-80px)] w-full overflow-x-clip bg-matrix-bg px-4 py-8">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#10b98114_1px,transparent_1px),linear-gradient(to_bottom,#10b98114_1px,transparent_1px)] [background-size:3rem_3rem]" />
      <div className="pointer-events-none absolute left-1/2 top-28 z-0 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-matrix-accent/15 blur-[150px]" />

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="hidden space-y-4 lg:block">
          <div className="overflow-hidden rounded-xl border border-matrix-border bg-matrix-card/80 shadow-[0_0_25px_rgba(16,185,129,0.07)] backdrop-blur-md transition-colors hover:border-matrix-accent/40">
            <div className="flex items-center justify-between border-b border-matrix-border/80 bg-black/60 px-3.5 py-2 font-mono text-[11px] text-matrix-accent">
              <span>&gt; NODE_IDENTITY_</span>
              <span className="h-2 w-2 animate-pulse rounded-full bg-matrix-accent" />
            </div>

            <div className="space-y-4 p-4">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="group flex items-center gap-3 rounded-lg border border-transparent p-1 transition hover:border-matrix-accent/30 hover:bg-matrix-accent/5"
                  >
                    <div className="rounded-full border border-matrix-accent/50 bg-matrix-bg p-2 text-matrix-accent shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                      <TerminalIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block truncate font-mono text-sm font-bold text-matrix-text group-hover:text-matrix-accent">
                        @{user.nickName}
                      </span>
                      <span className="block font-mono text-[10px] text-matrix-muted">
                        ver_perfil -&gt;
                      </span>
                    </div>
                  </Link>

                  <div className="grid grid-cols-2 gap-2 rounded-lg border border-matrix-border/60 bg-black/40 p-2.5 text-center font-mono">
                    <div>
                      <span className="block text-sm font-bold text-matrix-accent">
                        {userPostCount}
                      </span>
                      <span className="text-[10px] uppercase text-matrix-muted">
                        posts
                      </span>
                    </div>
                    <div className="border-l border-matrix-border/60">
                      <span className="block text-sm font-bold text-matrix-text">
                        {profileStats.following.length}
                      </span>
                      <span className="text-[10px] uppercase text-matrix-muted">
                        seguidos
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/create-post"
                    className="block rounded-lg border border-matrix-accent/70 bg-matrix-accent/15 px-3 py-2 text-center font-mono text-xs font-bold text-matrix-accent shadow-[0_0_15px_rgba(16,185,129,0.15)] transition hover:border-matrix-accent hover:bg-matrix-accent hover:text-black"
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
                    className="block rounded-lg border border-matrix-accent/60 bg-matrix-accent/10 px-3 py-2 text-center font-mono text-xs font-bold text-matrix-accent transition hover:border-matrix-accent hover:bg-matrix-accent/20"
                  >
                    [ /iniciar_sesion ]
                  </Link>
                </>
              )}
            </div>
          </div>

          <AboutUsCard
            postCount={mergedPosts.length}
            userCount={totalUsersCount}
            tagCount={uniqueTagsCount}
          />
          <FortuneWidget
            fortune={currentFortune}
            onNext={nextFortune}
            className="hidden xl:block"
          />

          <div className="space-y-4 lg:sticky lg:top-24">
            {topTags.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-matrix-border bg-matrix-card/80 shadow-[0_0_25px_rgba(16,185,129,0.06)] backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-matrix-border/80 bg-black/60 px-3.5 py-2 font-mono text-[11px] text-matrix-accent">
                  <span>&gt; TOP_TAGS_</span>
                  {tagQuery && (
                    <button
                      type="button"
                      onClick={() => setTagQuery('')}
                      className="text-[10px] text-matrix-muted transition hover:text-matrix-accent"
                    >
                      [ limpiar ]
                    </button>
                  )}
                </div>
                <ul className="space-y-1 p-3">
                  {topTags.map(({ tag, count }) => {
                    const isSelected =
                      tagQuery.replace('#', '').toLowerCase().trim() ===
                      tag.name.toLowerCase()
                    return (
                      <li key={tag.id}>
                        <button
                          type="button"
                          onClick={() =>
                            setTagQuery(isSelected ? '' : `#${tag.name}`)
                          }
                          className={`flex w-full items-center justify-between rounded-lg border px-2.5 py-1.5 font-mono text-xs transition-colors ${
                            isSelected
                              ? 'border-matrix-accent/60 bg-matrix-accent/15 text-matrix-accent'
                              : 'border-transparent text-matrix-text hover:border-matrix-border hover:bg-matrix-accent/10 hover:text-matrix-accent'
                          }`}
                        >
                          <span>#{tag.name}</span>
                          <span className="rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-matrix-muted">
                            {count}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {suggestedUsers.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-matrix-border bg-matrix-card/80 shadow-[0_0_25px_rgba(16,185,129,0.06)] backdrop-blur-md">
                <div className="border-b border-matrix-border/80 bg-black/60 px-3.5 py-2 font-mono text-[11px] text-matrix-accent">
                  &gt; SUGERIDOS_RED<span className="animate-pulse">_</span>
                </div>
                <ul className="space-y-2 p-3">
                  {suggestedUsers.map((suggestedUser) => (
                    <SuggestedUserRow
                      key={suggestedUser.id}
                      suggestedUser={suggestedUser}
                    />
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>

        <main className="min-w-0 space-y-5">
          {!user ? (
            !isWelcomeDismissed && (
              <motion.section
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="overflow-hidden rounded-xl border border-matrix-border bg-matrix-card/80 shadow-[0_0_30px_rgba(16,185,129,0.08)] backdrop-blur-md"
              >
                <div className="flex items-center justify-between border-b border-matrix-border bg-black/70 px-4 py-2.5">
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    <span className="h-3 w-3 rounded-full bg-red-500/80" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <span className="h-3 w-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="font-mono text-xs text-matrix-muted">
                    bash -- welcome_protocol.sh
                  </span>
                  <button
                    type="button"
                    onClick={dismissWelcome}
                    className="rounded border border-matrix-border px-2 py-0.5 font-mono text-xs text-matrix-muted transition-colors hover:border-matrix-accent hover:text-matrix-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent"
                    aria-label="Cerrar bienvenida"
                  >
                    [ × ]
                  </button>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="space-y-2">
                    <h2 className="font-mono text-base font-bold text-matrix-accent sm:text-lg">
                      &gt; UNAHUR // ANTI-SOCIAL_NET
                    </h2>
                    <p className="font-mono text-xs leading-relaxed text-matrix-text sm:text-sm">
                      Una red abierta, sin algoritmos adictivos ni ruido
                      comercial.
                      <br />
                      Compartí ideas, apuntes y código con la comunidad UNAHUR.
                    </p>
                  </div>
                </div>
              </motion.section>
            )
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex flex-col gap-3 rounded-xl border border-matrix-border bg-matrix-card/80 p-4 font-mono shadow-[0_0_25px_rgba(16,185,129,0.06)] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="min-w-0 break-words text-sm text-matrix-accent">
                &gt; ¿Qué estás compilando hoy, @{user.nickName}?
              </p>
              <Link
                to="/create-post"
                className="w-fit shrink-0 rounded border border-matrix-accent bg-matrix-accent/20 px-4 py-2 text-xs font-bold text-matrix-accent transition-colors hover:bg-matrix-accent hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent"
              >
                [ + nueva_publicacion ]
              </Link>
            </motion.div>
          )}

          <header className="overflow-hidden rounded-xl border border-matrix-border bg-matrix-card/80 shadow-[0_0_30px_rgba(16,185,129,0.08)] backdrop-blur-md transition-colors hover:border-matrix-accent/40">
            <div className="flex items-center justify-between border-b border-matrix-border bg-black/70 px-4 py-2.5">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              <span className="font-mono text-xs text-matrix-muted">
                bash -- system_feed.sh
              </span>
              <div className="flex items-center gap-1.5 rounded border border-matrix-accent/30 bg-matrix-accent/10 px-2.5 py-0.5 font-mono text-[11px] text-matrix-accent">
                <span className="h-2 w-2 animate-pulse rounded-full bg-matrix-accent" />
                <span>ONLINE</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <div className="mb-1 flex items-center gap-1 font-mono text-xs text-matrix-accent">
                  <span>&gt; SYSTEM_FEED</span>
                  <span className="animate-pulse font-bold">_</span>
                </div>
                <h1 className="font-mono text-xl font-bold tracking-wide text-matrix-text sm:text-2xl">
                  // publicaciones
                </h1>
              </div>

              {!loading && !error && (
                <div className="rounded-lg border border-matrix-border/70 bg-black/40 px-3 py-1.5 font-mono text-xs text-matrix-muted">
                  registros:{' '}
                  <span className="font-bold text-matrix-accent">
                    {filteredPosts.length}
                  </span>
                </div>
              )}
            </div>
          </header>

          {!loading && !error && (tagQuery || topTags.length > 0) && (
            <div
              className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border border-matrix-border/80 bg-matrix-card/60 px-4 py-2.5 backdrop-blur-md ${
                tagQuery ? '' : 'lg:hidden'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                {tagQuery && (
                  <span className="font-mono text-xs text-matrix-muted">
                    &gt; filtro_activo:{' '}
                    <span className="font-bold text-matrix-accent">
                      {tagQuery}
                    </span>
                  </span>
                )}
                {topTags.map(({ tag }) => {
                  const isSelected =
                    tagQuery.replace('#', '').toLowerCase().trim() ===
                    tag.name.toLowerCase()
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() =>
                        setTagQuery(isSelected ? '' : `#${tag.name}`)
                      }
                      className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] transition lg:hidden ${
                        isSelected
                          ? 'border-matrix-accent bg-matrix-accent/15 text-matrix-accent'
                          : 'border-matrix-border bg-matrix-bg/70 text-matrix-muted hover:border-matrix-accent/50 hover:text-matrix-text'
                      }`}
                    >
                      #{tag.name}
                    </button>
                  )
                })}
              </div>

              {tagQuery && (
                <button
                  type="button"
                  onClick={() => setTagQuery('')}
                  className="ml-auto rounded border border-matrix-accent/50 bg-matrix-accent/10 px-2.5 py-0.5 font-mono text-xs text-matrix-accent transition hover:border-matrix-accent hover:bg-matrix-accent/20"
                >
                  [ × limpiar_filtro ]
                </button>
              )}
            </div>
          )}

          {loading && (
            <div
              className="space-y-4"
              aria-label="Cargando publicaciones"
              aria-busy="true"
            >
              {[1, 2, 3].map((skeleton) => (
                <div
                  key={skeleton}
                  className="h-52 animate-pulse rounded-xl border border-matrix-border/50 bg-matrix-card/40"
                />
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
            <p className="rounded-xl border border-matrix-border bg-matrix-card/60 p-6 text-center font-mono text-sm text-matrix-muted">
              // [ sin publicaciones para mostrar ]
            </p>
          )}
          {!loading &&
            !error &&
            mergedPosts.length > 0 &&
            filteredPosts.length === 0 && (
              <p className="rounded-xl border border-matrix-border bg-matrix-card/60 p-6 text-center font-mono text-sm text-matrix-muted">
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
              />
            ))}
          </motion.div>
          <AboutUsCard
            postCount={mergedPosts.length}
            userCount={totalUsersCount}
            tagCount={uniqueTagsCount}
            compact
            className="lg:hidden"
          />
          <FortuneWidget
            fortune={currentFortune}
            onNext={nextFortune}
            className="xl:hidden"
          />
        </main>
      </div>
    </section>
  )
}