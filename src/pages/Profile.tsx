import { useEffect, useState } from 'react'
import { motion, type Variants } from 'motion/react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AuthRequiredModal from '../components/AuthRequiredModal'
import DatabaseErrorTerminal from '../components/DatabaseErrorTerminal'
import PostCard from '../components/PostCard'
import TerminalIcon from '../components/TerminalIcon'
import { useAuth } from '../context/useAuth'
import ConfirmActionModal from '../components/ConfirmActionModal'
import {
  getApiErrorMessage,
  getCommentsByPost,
  getPostImages,
  getPostsByUser,
  getUserById,
} from '../services/api'
import {
  getProfileStats,
  isFollowingUser,
  PROFILE_STATS_UPDATED,
  updateFollowing,
  type ProfileStats,
} from '../services/profileStats'
import type { Post, User } from '../types'

type ProfileList = 'followers' | 'following'

const postsVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
}
const POSTS_PAGE_SIZE = 6

function getPostSortValue(post: Post): number {
  if (post.createdAt) {
    return new Date(post.createdAt).getTime()
  }

  return Number(post.id)
}

export default function Profile() {
  const { user: authenticatedUser, logout } = useAuth()
  const { userId: routeUserId } = useParams()
  const navigate = useNavigate()
  const profileId =
    routeUserId === undefined ? authenticatedUser?.id : Number(routeUserId)
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [postDetails, setPostDetails] = useState<Record<number, Post>>({})
  const [visiblePostCount, setVisiblePostCount] = useState(POSTS_PAGE_SIZE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileLoadErrorId, setProfileLoadErrorId] = useState<number>()
  const [retryCount, setRetryCount] = useState(0)
  const [activeList, setActiveList] = useState<ProfileList | null>(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showAuthRequired, setShowAuthRequired] = useState(false)
  const [isFollowingProfile, setIsFollowingProfile] = useState(false)
  const [followError, setFollowError] = useState('')
  const [profileStats, setProfileStats] = useState<ProfileStats>(() =>
    getProfileStats(authenticatedUser?.id),
  )
  const isOwnProfile = profileUser?.id === authenticatedUser?.id

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
    const syncProfileStats = () =>
      setProfileStats(getProfileStats(authenticatedUser?.id))

    window.addEventListener(PROFILE_STATS_UPDATED, syncProfileStats)
    window.addEventListener('storage', syncProfileStats)
    return () => {
      window.removeEventListener(PROFILE_STATS_UPDATED, syncProfileStats)
      window.removeEventListener('storage', syncProfileStats)
    }
  }, [authenticatedUser?.id])

  useEffect(() => {
    let active = true
    if (profileId === undefined || !Number.isInteger(profileId) || profileId <= 0) {
      return () => {
        active = false
      }
    }

    const syncPosts = async () => {
      try {
        const [loadedUser, loadedPosts] = await Promise.all([
          authenticatedUser?.id === profileId
            ? Promise.resolve(authenticatedUser)
            : getUserById(profileId),
          getPostsByUser(profileId),
        ])

        if (!active) return

        const sortedPosts = loadedPosts.sort(
          (first, second) =>
            getPostSortValue(second) - getPostSortValue(first),
        )

        setError(null)
        setProfileLoadErrorId(undefined)
        setProfileUser(loadedUser)
        setPosts(sortedPosts)
        setPostDetails({})
        setVisiblePostCount(POSTS_PAGE_SIZE)
      } catch (requestError: unknown) {
        if (!active) return
        setProfileLoadErrorId(profileId)
        setError(
          getApiErrorMessage(
            requestError,
            'No se pudo cargar el perfil solicitado.',
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
  }, [authenticatedUser, profileId, retryCount])

  useEffect(() => {
    const syncFollowing = () =>
      setIsFollowingProfile(
        Boolean(
          authenticatedUser &&
            profileUser &&
            isFollowingUser(profileUser.nickName, authenticatedUser.id),
        ),
      )

    syncFollowing()
    window.addEventListener(PROFILE_STATS_UPDATED, syncFollowing)
    window.addEventListener('storage', syncFollowing)
    return () => {
      window.removeEventListener(PROFILE_STATS_UPDATED, syncFollowing)
      window.removeEventListener('storage', syncFollowing)
    }
  }, [authenticatedUser, profileUser])

  const handleProfileFollow = () => {
    if (!authenticatedUser) {
      setShowAuthRequired(true)
      return
    }
    if (!profileUser) return

    try {
      updateFollowing(
        profileUser.nickName,
        !isFollowingProfile,
        authenticatedUser.id,
      )
      setIsFollowingProfile(!isFollowingProfile)
      setFollowError('')
    } catch (requestError: unknown) {
      setFollowError(
        getApiErrorMessage(requestError, 'No se pudo actualizar el seguimiento.'),
      )
    }
  }

  const visiblePosts = posts.slice(0, visiblePostCount)
  const visiblePostIds = visiblePosts.map((post) => post.id).join(',')

  useEffect(() => {
    if (!visiblePostIds || profileUser?.id !== profileId) return

    let active = true
    const postsToLoad = visiblePosts.filter((post) => !postDetails[post.id])

    if (postsToLoad.length === 0) return

    Promise.all(
      postsToLoad.map(async (post) => {
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
      .then((loadedDetails) => {
        if (!active) return
        setPostDetails((currentDetails) => ({
          ...currentDetails,
          ...Object.fromEntries(
            loadedDetails.map((post) => [post.id, post]),
          ),
        }))
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            getApiErrorMessage(
              requestError,
              'No se pudieron cargar los detalles de las publicaciones.',
            ),
          )
        }
      })

    return () => {
      active = false
    }
  }, [postDetails, profileId, profileUser, retryCount, visiblePostIds, visiblePosts])

  if (profileId === undefined || !Number.isInteger(profileId) || profileId <= 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-8">
        <p role="alert" className="font-mono text-sm text-red-400">
          // [ el_perfil_solicitado_no_es_válido ]
        </p>
        <Link to="/" className="mt-4 inline-block font-mono text-sm text-matrix-accent">
          [ volver_al_inicio ]
        </Link>
      </section>
    )
  }

  if (!profileUser || profileUser.id !== profileId) {
    if (error && profileLoadErrorId === profileId) {
      return (
        <section className="mx-auto max-w-3xl px-4 py-8">
          <DatabaseErrorTerminal
            error={error}
            onRetry={() => {
              setError(null)
              setLoading(true)
              setRetryCount((count) => count + 1)
            }}
          />
        </section>
      )
    }

    return (
      <section
        className="mx-auto max-w-3xl px-4 py-12 font-mono text-sm text-matrix-muted"
        aria-live="polite"
      >
        // [ cargando_perfil... ]
      </section>
    )
  }

  const activeListTitle =
    activeList === 'followers' ? 'seguidores' : 'seguidos'
  const activeListUsers =
    activeList === 'followers'
      ? profileStats.followers
      : profileStats.following

  return (
    <>
      <AuthRequiredModal
        open={showAuthRequired}
        onClose={() => setShowAuthRequired(false)}
      />
      <ConfirmActionModal
        open={showLogoutModal}
        title="¿Estás seguro que deseas salir?"
        onConfirm={() => {
          setShowLogoutModal(false)
          logout()
          navigate('/')
        }}
        onCancel={() => setShowLogoutModal(false)}
      />
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
            className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-matrix-border bg-matrix-card/95 shadow-[0_0_30px_rgba(16,185,129,0.18)] backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-matrix-border bg-black/70 px-4 py-2.5">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              <span className="font-mono text-xs text-matrix-muted">
                bash -- {activeListTitle}.sh
              </span>
              <button
                type="button"
                onClick={() => setActiveList(null)}
                className="rounded border border-matrix-border px-2.5 py-0.5 font-mono text-xs text-matrix-muted transition hover:border-matrix-accent hover:text-matrix-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent"
                aria-label="Cerrar listado"
              >
                [ X ]
              </button>
            </div>

            <div className="p-5">
              <header className="mb-4 border-b border-matrix-border/70 pb-3">
                <div className="flex items-center gap-1 font-mono text-xs text-matrix-accent">
                  <span>&gt; USER_NETWORK</span>
                  <span className="animate-pulse font-bold">_</span>
                </div>
                <h2
                  id="profile-list-title"
                  className="mt-1 font-mono text-lg font-bold text-matrix-text"
                >
                  // {activeListTitle} de @{profileUser.nickName}
                </h2>
              </header>

              {activeListUsers.length > 0 ? (
                <ul className="max-h-[50vh] space-y-2 overflow-y-auto">
                  {activeListUsers.map((nickName) => (
                    <li
                      key={nickName}
                      className="flex items-center gap-3 rounded-lg border border-matrix-border/70 bg-matrix-bg/80 px-3 py-2.5 font-mono text-sm text-matrix-text"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-matrix-accent/40 bg-matrix-bg text-matrix-accent">
                        <TerminalIcon className="h-4 w-4" />
                      </span>
                      <span className="truncate">
                        {nickName.startsWith('@') ? nickName : `@${nickName}`}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-6 text-center font-mono text-sm text-matrix-muted">
                  // [ todavía no hay {activeListTitle} ]
                </p>
              )}
            </div>
          </motion.section>
        </motion.div>
      )}

      <section className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden bg-matrix-bg px-4 py-8">
        <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#10b9810a_1px,transparent_1px),linear-gradient(to_bottom,#10b9810a_1px,transparent_1px)] [background-size:3rem_3rem]" />
        <div className="pointer-events-none absolute left-1/2 top-1/3 z-0 h-[450px] w-[800px] -translate-x-1/2 rounded-full bg-matrix-accent/5 blur-[180px]" />

        <div className="relative z-10 mx-auto max-w-3xl space-y-6">
          <motion.header
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-xl border border-matrix-border bg-matrix-card/80 shadow-[0_0_30px_rgba(16,185,129,0.08)] backdrop-blur-md transition-all duration-300 hover:border-matrix-accent/50"
          >
            <div className="flex items-center justify-between border-b border-matrix-border bg-black/70 px-4 py-2.5">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              <span className="font-mono text-xs text-matrix-muted">
                bash -- user_profile.sh
              </span>
              <div className="hidden items-center gap-1.5 rounded border border-matrix-border/60 bg-black/50 px-2.5 py-0.5 font-mono text-xs text-matrix-muted sm:flex">
                <span className="h-2 w-2 animate-pulse rounded-full bg-matrix-accent" />
                <span>status: online</span>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {isOwnProfile ? (
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="mb-4 rounded border border-matrix-border px-3 py-1.5 font-mono text-xs text-matrix-muted transition hover:border-matrix-accent hover:text-matrix-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent"
                >
                  [ /cerrar_sesión ]
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleProfileFollow}
                  className={`mb-4 rounded border px-3 py-1.5 font-mono text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent ${
                    isFollowingProfile
                      ? 'border-orange-400/70 bg-orange-500/10 text-orange-300 hover:border-orange-300'
                      : 'border-matrix-accent/60 bg-matrix-accent/10 text-matrix-accent hover:border-matrix-accent'
                  }`}
                >
                  {isFollowingProfile ? '[ dejar de seguir ]' : '[ +seguir ]'}
                </button>
              )}
              {followError && (
                <p role="alert" className="mb-3 font-mono text-xs text-red-400">
                  ! {followError}
                </p>
              )}
              <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(300px,auto)] md:items-center">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-matrix-accent bg-matrix-bg text-matrix-accent shadow-[0_0_18px_rgba(16,185,129,0.25)] sm:h-20 sm:w-20">
                    <TerminalIcon className="h-8 w-8 sm:h-10 sm:w-10" />
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <div className="flex items-center gap-1 font-mono text-xs text-matrix-accent">
                      <span>&gt; USER_PROFILE</span>
                      <span className="animate-pulse font-bold">_</span>
                    </div>
                    <h1 className="truncate font-mono text-xl font-bold tracking-wide text-matrix-text sm:text-2xl">
                      // @{profileUser.nickName}
                    </h1>
                  </div>
                </div>

                <div className={`grid ${isOwnProfile ? 'grid-cols-3 md:min-w-[300px]' : 'grid-cols-1'} items-center gap-2 border-t border-matrix-border/60 pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0`}>
                  <div className="min-w-0 text-center">
                    <div className="font-mono text-2xl font-bold leading-none text-matrix-accent sm:text-3xl">
                      {posts.length}
                    </div>
                    <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-matrix-muted sm:text-[10px] sm:tracking-[0.18em]">
                      publicaciones
                    </div>
                  </div>

                  {isOwnProfile && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveList('followers')}
                        className="min-w-0 cursor-pointer rounded-lg border border-transparent px-1 py-2 text-center transition hover:border-matrix-accent/40 hover:bg-matrix-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent"
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
                        className="min-w-0 cursor-pointer rounded-lg border border-transparent px-1 py-2 text-center transition hover:border-matrix-accent/40 hover:bg-matrix-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent"
                        aria-label={`Ver ${profileStats.following.length} seguidos`}
                      >
                        <div className="font-mono text-2xl font-bold leading-none text-matrix-text sm:text-3xl">
                          {profileStats.following.length}
                        </div>
                        <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-matrix-muted sm:text-[10px] sm:tracking-[0.18em]">
                          seguidos
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.header>

          <div className="flex items-center justify-between gap-3 border-b border-matrix-border pb-3">
            <h2 className="font-mono text-sm text-matrix-accent">
              [ &gt; publicaciones_archivadas ]
            </h2>
            <span className="font-mono text-xs text-matrix-muted">
              [{posts.length}]
            </span>
          </div>

          {loading && (
            <div
              className="space-y-4"
              aria-label="Cargando publicaciones"
              aria-busy="true"
            >
              {[1, 2].map((skeleton) => (
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

          {!loading && !error && posts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden rounded-xl border border-dashed border-matrix-accent/40 bg-matrix-card/80 p-8 text-center shadow-[0_0_30px_rgba(16,185,129,0.08)] backdrop-blur-md sm:p-10"
            >
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-matrix-accent/10 blur-[80px]" />

              <div className="relative z-10 flex flex-col items-center space-y-4 font-mono">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
                  className="rounded-xl border border-matrix-accent/40 bg-matrix-bg/90 p-4 text-matrix-accent shadow-[0_0_25px_rgba(16,185,129,0.2)]"
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
                    className="h-12 w-12 text-matrix-accent drop-shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                    aria-hidden="true"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M10 9h.01" />
                    <path d="M14 9h.01" />
                    <path d="M12 3a7 7 0 0 1 7 7v1l1 0a2 2 0 1 1 0 4l-1 0v3l2 3h-10a6 6 0 0 1 -6 -5.775l0 -.226l-1 0a2 2 0 0 1 0 -4l1 0v-1a7 7 0 0 1 7 -7l0 .001" />
                    <path d="M11 14h2a1 1 0 0 0 -2 0" />
                  </svg>
                </motion.div>

                <div className="flex items-center gap-1 text-xs text-matrix-accent">
                  <span>&gt; EMPTY_POSTS_LOG</span>
                  <span className="animate-pulse font-bold">_</span>
                </div>

                <p className="max-w-md text-sm leading-relaxed text-matrix-text sm:text-base">
                  {isOwnProfile
                    ? 'Ups, no encontramos ninguna publicación hecha por vos.'
                    : `@${profileUser.nickName} todavía no tiene publicaciones.`}
                  {isOwnProfile && (
                    <span className="block text-matrix-muted sm:inline">
                      {' '}Subí algo, no seas aguafiestas.
                    </span>
                  )}
                </p>

                {isOwnProfile && (
                  <Link
                    to="/create-post"
                    className="mt-2 inline-flex items-center gap-2 rounded border border-matrix-accent/60 bg-matrix-accent/10 px-4 py-2 text-xs font-bold text-matrix-accent transition hover:border-matrix-accent hover:bg-matrix-accent/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.18)]"
                  >
                    <span>[ + crear_primera_publicacion ]</span>
                  </Link>
                )}
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
              {visiblePosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={postDetails[post.id] ?? post}
                />
              ))}
            </motion.div>
          )}
          {!loading &&
            !error &&
            visiblePosts.length < posts.length && (
              <button
                type="button"
                onClick={() =>
                  setVisiblePostCount((count) => count + POSTS_PAGE_SIZE)
                }
                className="mx-auto block rounded border border-matrix-accent bg-matrix-accent/20 px-4 py-2 font-mono text-xs font-bold text-matrix-accent transition hover:bg-matrix-accent hover:text-black"
              >
                [ cargar_más ]
              </button>
            )}
        </div>
      </section>
    </>
  )
}