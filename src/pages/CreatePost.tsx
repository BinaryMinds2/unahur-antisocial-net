import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAuth } from '../context/useAuth'
import type { Tag } from '../types'
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
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [tagsLoading, setTagsLoading] = useState(true)
  const [tagsError, setTagsError] = useState<string | null>(null)
  const [tagLoadAttempt, setTagLoadAttempt] = useState(0)
  const [imageUrls, setImageUrls] = useState([''])
  const [useSuggestedImage, setUseSuggestedImage] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [savedPostId, setSavedPostId] = useState<number | null>(null)
  const selectedTagNames = availableTags
    .filter((tag) => selectedTagIds.includes(tag.id))
    .map((tag) => tag.name)

  useEffect(() => {
    let active = true

    getTags()
      .then((tags) => {
        if (active) {
          setAvailableTags(tags)
          setSelectedTagIds((current) =>
            current.filter((id) => tags.some((tag) => tag.id === id)),
          )
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setTagsError(
            getApiErrorMessage(error, 'No se pudieron cargar las etiquetas.'),
          )
        }
      })
      .finally(() => {
        if (active) setTagsLoading(false)
      })

    return () => {
      active = false
    }
  }, [tagLoadAttempt])

  const enteredImageUrls = imageUrls
    .map((url) => url.trim())
    .filter(Boolean)
  const previewImageUrls =
    enteredImageUrls.length > 0
      ? enteredImageUrls.filter(isValidImageUrl)
      : useSuggestedImage
        ? [buildDefaultImage(selectedTagNames.join(','))]
        : []

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

    const resolvedImageUrls = imageUrls
      .map((url) => url.trim())
      .filter(Boolean)

    if (resolvedImageUrls.some((url) => !isValidImageUrl(url))) {
      setStatus('Cada imagen debe tener una URL válida que comience con http:// o https://.')
      return
    }

    if (resolvedImageUrls.length === 0 && useSuggestedImage) {
      resolvedImageUrls.push(buildDefaultImage(selectedTagNames.join(',')))
    }

    setIsSubmitting(true)
    setStatus(null)

    try {
      const createdPost = await createPost({
        description: trimmedContent,
        userId: user.id,
        tagIds: selectedTagIds,
      })

      for (const [index, url] of resolvedImageUrls.entries()) {
        try {
          await createPostImage({
            postId: createdPost.id,
            url,
          })
        } catch (imageError: unknown) {
          setSavedPostId(createdPost.id)
          setStatus(
            `La publicación se guardó, pero no se pudo guardar la imagen ${index + 1}: ${getApiErrorMessage(imageError, 'error desconocido')}`,
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
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm text-matrix-text">
                    etiquetas (opcional)
                  </span>
                  <span className="font-mono text-[11px] text-matrix-muted">
                    {selectedTagIds.length} seleccionada
                    {selectedTagIds.length === 1 ? '' : 's'}
                  </span>
                </div>

                {tagsLoading ? (
                  <p
                    role="status"
                    className="rounded-lg border border-matrix-border bg-matrix-bg/70 px-3 py-3 font-mono text-xs text-matrix-muted"
                  >
                    [ cargando_etiquetas... ]
                  </p>
                ) : tagsError ? (
                  <div
                    role="alert"
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-500/40 bg-red-950/20 px-3 py-3"
                  >
                    <span className="font-mono text-xs text-red-400">
                      {tagsError}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setTagsLoading(true)
                        setTagsError(null)
                        setTagLoadAttempt((attempt) => attempt + 1)
                      }}
                      className="rounded border border-red-500/50 px-2 py-1 font-mono text-xs text-red-300 transition-colors hover:bg-red-500/10"
                    >
                      [ reintentar ]
                    </button>
                  </div>
                ) : availableTags.length === 0 ? (
                  <p className="rounded-lg border border-matrix-border bg-matrix-bg/70 px-3 py-3 font-mono text-xs text-matrix-muted">
                    No hay etiquetas disponibles en el servidor.
                  </p>
                ) : (
                  <div
                    role="group"
                    aria-label="Seleccionar etiquetas"
                    className="flex flex-wrap gap-2 rounded-lg border border-matrix-border/70 bg-black/30 p-3"
                  >
                    {availableTags.map((tag) => {
                      const isSelected = selectedTagIds.includes(tag.id)

                      return (
                        <button
                          key={tag.id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() =>
                            setSelectedTagIds((current) =>
                              isSelected
                                ? current.filter((id) => id !== tag.id)
                                : [...current, tag.id],
                            )
                          }
                          className={`rounded-full border px-3 py-1.5 font-mono text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-accent ${
                            isSelected
                              ? 'border-matrix-accent bg-matrix-accent/15 text-matrix-accent shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                              : 'border-matrix-border bg-matrix-bg/70 text-matrix-muted hover:border-matrix-accent/60 hover:text-matrix-text'
                          }`}
                        >
                          <span aria-hidden="true">
                            {isSelected ? '[x]' : '[+]'}
                          </span>{' '}
                          #{tag.name}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm text-matrix-text">
                    imágenes (URLs)
                  </span>
                  <button
                    type="button"
                    onClick={() => setImageUrls((current) => [...current, ''])}
                    className="rounded border border-matrix-border px-3 py-1.5 font-mono text-xs text-matrix-accent transition-colors hover:border-matrix-accent"
                  >
                    [ + agregar imagen ]
                  </button>
                </div>
                <div className="space-y-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <label
                        htmlFor={`imageUrl-${index}`}
                        className="sr-only"
                      >
                        URL de la imagen {index + 1}
                      </label>
                      <div className="relative min-w-0 flex-1">
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
                          id={`imageUrl-${index}`}
                          type="url"
                          value={url}
                          onChange={(event) =>
                            setImageUrls((current) =>
                              current.map((currentUrl, currentIndex) =>
                                currentIndex === index
                                  ? event.target.value
                                  : currentUrl,
                              ),
                            )
                          }
                          placeholder="https://..."
                          className="w-full rounded-lg border border-matrix-border bg-matrix-bg/90 py-3 pl-9 pr-3 font-mono text-sm text-matrix-text outline-none transition-all placeholder:text-matrix-muted/50 focus:border-matrix-accent focus:ring-1 focus:ring-matrix-accent"
                        />
                      </div>
                      {imageUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setImageUrls((current) =>
                              current.filter(
                                (_, currentIndex) => currentIndex !== index,
                              ),
                            )
                          }
                          aria-label={`Quitar imagen ${index + 1}`}
                          className="rounded border border-red-500/40 px-3 py-2 font-mono text-xs text-red-400 transition-colors hover:border-red-400"
                        >
                          [ x ]
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {previewImageUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-2 sm:grid-cols-3">
                    {previewImageUrls.map((previewUrl, index) => (
                      <img
                        key={`${previewUrl}-${index}`}
                        src={previewUrl}
                        alt={`Vista previa de imagen ${index + 1}`}
                        className="h-28 w-full rounded-lg border border-matrix-border/80 object-cover"
                        onError={(event) => {
                          event.currentTarget.src = DEFAULT_IMAGES[0]
                        }}
                      />
                    ))}
                  </div>
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
