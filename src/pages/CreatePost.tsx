import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAuth } from '../context/useAuth'
import {
  createPost,
  createPostImage,
  getApiErrorMessage,
  getTags,
} from '../services/api'

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=80',
]

function buildDefaultImage(tagsText: string) {
  const text = tagsText.trim().toLowerCase()
  const index = text.length === 0 ? 0 : [...text].reduce((hash, char) => hash + char.charCodeAt(0), 0) % DEFAULT_IMAGES.length
  return DEFAULT_IMAGES[index]
}

function isValidImageUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export default function CreatePost() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [useSuggestedImage, setUseSuggestedImage] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [savedPostId, setSavedPostId] = useState<number | null>(null)
  const parsedTags = tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
  const previewImageUrl = imageUrl.trim() || (useSuggestedImage ? buildDefaultImage(tags) : '')
  const canPreviewImage =
    useSuggestedImage || isValidImageUrl(imageUrl.trim())

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting || savedPostId !== null) return

    if (!user) {
      setStatus('Debés iniciar sesión para publicar.')
      return
    }

    const trimmedContent = content.trim()
    if (!trimmedContent) {
      setStatus('La descripción no puede estar vacía.')
      return
    }

    const normalizedTags = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => tag.replace(/^#/, ''))

    const resolvedImageUrl = imageUrl.trim() || (useSuggestedImage ? buildDefaultImage(tags) : '')
    setIsSubmitting(true)
    setStatus(null)

    try {
      const availableTags = normalizedTags.length > 0 ? await getTags() : []
      const matchedTags = normalizedTags.map((tagName) =>
        availableTags.find(
          (tag) => tag.name.toLowerCase() === tagName.toLowerCase(),
        ),
      )
      const unknownTags = normalizedTags.filter(
        (_, index) => !matchedTags[index],
      )

      if (unknownTags.length > 0) {
        setStatus(
          `Estas etiquetas no existen en el servidor: ${unknownTags.map((tag) => `#${tag}`).join(', ')}.`,
        )
        return
      }

      const createdPost = await createPost({
        description: trimmedContent,
        userId: user.id,
        tagIds: matchedTags.flatMap((tag) => (tag ? [tag.id] : [])),
      })

      if (resolvedImageUrl) {
        try {
          await createPostImage({
            postId: createdPost.id,
            url: resolvedImageUrl,
          })
        } catch (imageError: unknown) {
          setSavedPostId(createdPost.id)
          setStatus(
            `La publicación se guardó, pero no se pudo guardar la imagen: ${getApiErrorMessage(imageError, 'error desconocido')}`,
          )
          return
        }
      }

      navigate('/')
    } catch (requestError: unknown) {
      setStatus(
        getApiErrorMessage(
          requestError,
          'No se pudo guardar la publicación en el servidor.',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden bg-matrix-bg px-4 py-8">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#10b9810a_1px,transparent_1px),linear-gradient(to_bottom,#10b9810a_1px,transparent_1px)] [background-size:3rem_3rem]" />
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mx-auto max-w-3xl overflow-hidden rounded-xl border border-matrix-border bg-matrix-card/80 shadow-[0_0_30px_rgba(16,185,129,0.08)] backdrop-blur-md transition-all duration-300 hover:border-matrix-accent/50"
      >
        <div className="flex items-center justify-between border-b border-matrix-border bg-black/70 px-4 py-2.5">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <span className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <span className="font-mono text-xs text-matrix-muted">bash -- create_post.sh</span>
          <div className="hidden items-center gap-1.5 rounded border border-matrix-border/60 bg-black/50 px-2.5 py-0.5 font-mono text-xs text-matrix-muted sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-matrix-accent" />
            <span>status: ready</span>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <div className="mb-1 flex items-center gap-1 font-mono text-xs text-matrix-accent">
              <span>&gt; NEW_POST_PROTOCOL</span>
              <span className="animate-pulse font-bold">_</span>
            </div>
            <h1 className="font-mono text-xl font-bold tracking-wide text-matrix-text sm:text-2xl">
              // crear publicación
            </h1>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="content" className="font-mono text-sm text-matrix-text">
                  descripción
                </label>
                <span className="font-mono text-xs text-matrix-muted">
                  {content.length}/500
                </span>
              </div>
              <textarea
                id="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                maxLength={500}
                rows={6}
                placeholder="¿Qué está pasando en la red?"
                className="min-h-[120px] w-full resize-y rounded-lg border border-matrix-border bg-matrix-bg/90 p-3.5 font-mono text-sm text-matrix-text outline-none transition-all placeholder:text-matrix-muted/50 focus:border-matrix-accent focus:ring-1 focus:ring-matrix-accent focus:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="tags" className="font-mono text-sm text-matrix-text">
                  etiquetas
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-matrix-accent">
                    #
                  </span>
                  <input
                    id="tags"
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    placeholder="viajes, arte, cine"
                    className="w-full rounded-lg border border-matrix-border bg-matrix-bg/90 py-3 pl-9 pr-3 font-mono text-sm text-matrix-text outline-none transition-all placeholder:text-matrix-muted/50 focus:border-matrix-accent focus:ring-1 focus:ring-matrix-accent"
                  />
                </div>
                {parsedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {parsedTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded border border-matrix-accent/30 bg-matrix-accent/10 px-2 py-0.5 font-mono text-[11px] text-matrix-accent"
                      >
                        {tag.startsWith('#') ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="imageUrl" className="font-mono text-sm text-matrix-text">
                  imagen (URL)
                </label>
                <div className="relative">
                  <svg
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-matrix-accent"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                  <input
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(event) => setImageUrl(event.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-matrix-border bg-matrix-bg/90 py-3 pl-9 pr-3 font-mono text-sm text-matrix-text outline-none transition-all placeholder:text-matrix-muted/50 focus:border-matrix-accent focus:ring-1 focus:ring-matrix-accent"
                  />
                </div>
                {canPreviewImage && previewImageUrl && (
                  <img
                    src={previewImageUrl}
                    alt="Vista previa de la publicación"
                    className="mt-2 h-28 w-full rounded-lg border border-matrix-border/80 object-cover"
                    onError={(event) => {
                      event.currentTarget.src = DEFAULT_IMAGES[0]
                    }}
                  />
                )}
              </div>
            </div>

            <label
              className={`flex cursor-pointer select-none items-center gap-3 rounded-lg border px-4 py-3 font-mono text-sm transition-colors ${
                useSuggestedImage
                  ? 'border-matrix-accent/60 bg-matrix-accent/10 text-matrix-text'
                  : 'border-matrix-border/70 bg-black/40 text-matrix-muted hover:border-matrix-border'
              }`}
            >
              <input
                type="checkbox"
                checked={useSuggestedImage}
                onChange={(event) => setUseSuggestedImage(event.target.checked)}
                className="sr-only"
              />
              <span
                className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                  useSuggestedImage
                    ? 'border-matrix-accent bg-matrix-accent text-black'
                    : 'border-matrix-border bg-transparent'
                }`}
                aria-hidden="true"
              >
                {useSuggestedImage && (
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                )}
              </span>
              usar imagen sugerida si no tengo URL
            </label>

            <div className="flex flex-col gap-4 border-t border-matrix-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div
                className={`font-mono text-xs ${
                  status
                    ? 'text-red-400'
                    : isSubmitting
                      ? 'animate-pulse text-matrix-accent'
                      : content.trim()
                        ? 'text-matrix-accent/90'
                        : 'text-matrix-muted'
                }`}
                role={status ? 'alert' : undefined}
              >
                {status ??
                  (isSubmitting
                    ? '> [TRANSMITTING] Subiendo paquete a la red...'
                    : content.trim()
                      ? '> [READY] Payload listo para transmitir'
                      : '> [IDLE] Esperando entrada de datos...')}
                {savedPostId !== null && (
                  <Link
                    to={`/post/${savedPostId}`}
                    className="ml-2 text-matrix-accent underline"
                  >
                    [ ver publicación ]
                  </Link>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || savedPostId !== null}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-matrix-accent bg-matrix-accent/20 px-5 py-2.5 font-mono text-sm font-bold text-matrix-accent shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all duration-200 hover:bg-matrix-accent hover:text-black hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 16V4" />
                  <path d="m7 9 5-5 5 5" />
                  <path d="M5 20h14" />
                </svg>
                <span>{isSubmitting ? '[ TRANSMITIENDO ]' : '[ PUBLICAR ]'}</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </section>
  )
}
