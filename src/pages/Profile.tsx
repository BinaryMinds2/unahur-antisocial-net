import { useEffect, useState } from 'react'
import { motion, type Variants } from 'motion/react'
import PostCard from '../components/PostCard'
import { useAuth } from '../context/useAuth'
import {
  getApiErrorMessage,
  getCommentsByPost,
  getPostImages,
  getPostsByUser,
} from '../services/api'
import type { Post } from '../types'

interface ProfileStats {
  followers: string[]
  following: string[]
}

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
  const [profileStats, setProfileStats] = useState<ProfileStats>({
    followers: ['@lucas', '@salir', '@maria'],
    following: ['@sofia', '@nicolas', '@ana'],
  })

  useEffect(() => {
    try {
      const storedStats = localStorage.getItem('unahur_profile_stats')
      if (storedStats) {
        const parsed = JSON.parse(storedStats) as Partial<ProfileStats>
        if (parsed.followers || parsed.following) {
          setProfileStats({
            followers: Array.isArray(parsed.followers) ? parsed.followers : profileStats.followers,
            following: Array.isArray(parsed.following) ? parsed.following : profileStats.following,
          })
        }
      }
    } catch {
      // Ignored; fallback to defaults below.
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('unahur_profile_stats', JSON.stringify(profileStats))
  }, [profileStats])

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

  return (
    <section className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden bg-matrix-bg px-4 py-8">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#10b9810a_1px,transparent_1px),linear-gradient(to_bottom,#10b9810a_1px,transparent_1px)] [background-size:3rem_3rem]" />

      <div className="relative z-10 mx-auto max-w-3xl space-y-6">
        <header className="rounded-xl border border-matrix-border bg-matrix-card/60 p-5 shadow-xl backdrop-blur-md">
          <div className="mb-1 font-mono text-xs text-matrix-accent/80">
            &gt; USER_PROFILE
          </div>
          <h1 className="font-mono text-xl font-bold tracking-wide text-matrix-text">
            // publicaciones de @{user.nickName}
          </h1>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-matrix-border bg-matrix-card/60 p-4">
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-matrix-accent/70">
              seguidores
            </p>
            <p className="mb-3 font-mono text-2xl font-bold text-matrix-text">
              {profileStats.followers.length}
            </p>
            <ul className="space-y-1 font-mono text-xs text-matrix-muted">
              {profileStats.followers.map((follower) => (
                <li key={follower}>- {follower}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-matrix-border bg-matrix-card/60 p-4">
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-matrix-accent/70">
              seguidos
            </p>
            <p className="mb-3 font-mono text-2xl font-bold text-matrix-text">
              {profileStats.following.length}
            </p>
            <ul className="space-y-1 font-mono text-xs text-matrix-muted">
              {profileStats.following.map((following) => (
                <li key={following}>- {following}</li>
              ))}
            </ul>
          </div>
        </div>

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
          <p className="font-mono text-matrix-muted">
            // [ todavía no tenés publicaciones ]
          </p>
        )}

        {!loading && !error && posts.length > 0 && (
          <motion.div
            variants={postsVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
