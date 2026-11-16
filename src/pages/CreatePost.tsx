import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import {
  createPost,
  createPostImage,
  getApiErrorMessage,
  getTags,
} from '../services/api'
import type { Tag } from '../types'

const MIN_DESCRIPTION_LENGTH = 10
const MAX_DESCRIPTION_LENGTH = 500
const MAX_IMAGES = 4

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
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
  const [imageUrls, setImageUrls] = useState([''])
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({})
  const [tagsLoading, setTagsLoading] = useState(true)
  const [tagsError, setTagsError] = useState('')
  const [tagsRetryCount, setTagsRetryCount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [createdPostId, setCreatedPostId] = useState<number | null>(null)
  const [submittedAttempt, setSubmittedAttempt] = useState(false)
  const [contentTouched, setContentTouched] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    getTags()
      .then((loadedTags) => {
        if (active) {
          setAvailableTags(loadedTags)
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setTagsError(
            getApiErrorMessage(
              requestError,
              'No se pudieron cargar las etiquetas.',
            ),
          )
        }
      })
      .finally(() => {
        if (active) {
          setTagsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [tagsRetryCount])

  const trimmedContent = content.trim()
  const validUrls = imageUrls.map((url) => url.trim()).filter(Boolean)

  const getDescriptionError = (): string | null => {
    if (!trimmedContent) {
      return 'La descripción no puede estar vacía.'
    }
    if (trimmedContent.length < MIN_DESCRIPTION_LENGTH) {
      const remaining = MIN_DESCRIPTION_LENGTH - trimmedContent.length
      return `Escribí al menos ${MIN_DESCRIPTION_LENGTH} caracteres (faltan ${remaining}).`
    }
    if (trimmedContent.length > MAX_DESCRIPTION_LENGTH) {
      return `Superaste el límite de ${MAX_DESCRIPTION_LENGTH} caracteres.`
    }
    return null
  }

  const getImageRowErrors = (): Record<number, string> => {
    const errors: Record<number, string> = {}
    const seen = new Set<string>()

    imageUrls.forEach((rawUrl, index) => {
      const url = rawUrl.trim()
      if (!url) {
        if (submittedAttempt && imageUrls.length > 1) {
          errors[index] = 'Completá esta URL o quitá el campo vacío.'
        }
        return
      }

      if (!isValidHttpUrl(url)) {
        errors[index] = 'Ingresá una URL válida que empiece con http:// o https://.'
        return
      }

      const normalized = url.toLowerCase()
      if (seen.has(normalized)) {
        errors[index] = 'Esta URL ya está agregada en otra fila.'
        return
      }
      seen.add(normalized)
    })

    return errors
  }

  const descriptionError = getDescriptionError()
  const imageRowErrors = getImageRowErrors()
  const showDescriptionError =
    Boolean(descriptionError) && (contentTouched || submittedAttempt)
  const hasImageErrors = Object.keys(imageRowErrors).length > 0
  const isFormReady = !descriptionError && !hasImageErrors && !tagsLoading && !tagsError

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmittedAttempt(true)
    setError('')

    if (!user) {
      setError('Debés iniciar sesión para publicar.')
      return
    }

    if (tagsLoading || tagsError) {
      setError('Esperá a que se carguen las etiquetas antes de publicar.')
      return
    }

    if (descriptionError) {
      document.getElementById('content')?.focus()
      return
    }

    const firstInvalidImageIndex = Object.keys(imageRowErrors)[0]
    if (firstInvalidImageIndex !== undefined) {
      document.getElementById(`imageUrl-${firstInvalidImageIndex}`)?.focus()
      return
    }

    setSubmitting(true)

    try {
      const post = await createPost({
        description: trimmedContent,
        userId: user.id,
        tagIds: selectedTagIds,
      })

      const failedImages: string[] = []
      for (const url of validUrls) {
        try {
          await createPostImage({ url, postId: post.id })
        } catch (requestError: unknown) {
          failedImages.push(
            `${url}: ${getApiErrorMessage(requestError, 'Error al asociar la imagen.')}`,
          )
        }
      }

      if (failedImages.length > 0) {
        setCreatedPostId(post.id)
        setError(
          `La publicación #${post.id} se creó, pero no se pudieron asociar estas imágenes: ${failedImages.join('; ')}. No vuelvas a enviar el formulario para evitar duplicarla.`,
        )
        return
      }

      navigate('/profile')
    } catch (requestError: unknown) {
      setError(
        getApiErrorMessage(
          requestError,
          'No se pudo crear la publicación. Intentá nuevamente.',
        ),
      )
    } finally {
      setSubmitting(false)
    }
  }

  const updateImageUrl = (index: number, value: string) => {
    setImageUrls((currentUrls) =>
      currentUrls.map((url, currentIndex) =>
        currentIndex === index ? value : url,
      ),
    )
    setBrokenImages((current) => {
      if (!current[index]) return current
      const next = { ...current }
      delete next[index]
      return next
    })
  }

  const removeImageRow = (index: number) => {
    setImageUrls((currentUrls) =>
      currentUrls.filter((_, currentIndex) => currentIndex !== index),
    )
    setBrokenImages({})
  }

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((currentTagIds) =>
      currentTagIds.includes(tagId)
        ? currentTagIds.filter((currentTagId) => currentTagId !== tagId)
        : [...currentTagIds, tagId],
    )
  }

  const publicationCreated = createdPostId !== null
  const progressPercentage = Math.min(
    100,
    Math.round((trimmedContent.length / MIN_DESCRIPTION_LENGTH) * 100),
  )

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
          <span className="font-mono text-xs text-matrix-muted">
            bash -- create_post.sh
          </span>
          <div className="hidden items-center gap-1.5 rounded border border-matrix-border/60 bg-black/50 px-2.5 py-0.5 font-mono text-xs text-matrix-muted sm:flex">
            <span
              className={`h-2 w-2 rounded-full ${
                isFormReady ? 'animate-pulse bg-matrix-accent' : 'bg-amber-400'
              }`}
            />
            <span>{isFormReady ? 'status: ready' : 'status: pending'}</span>
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

          {error && (
            <p
              role="alert"
              className="mb-5 rounded border border-red-500/50 bg-red-950/30 p-3 font-mono text-xs text-red-400"
            >
              ! {error}
            </p>
          )}

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="content" className="font-mono text-sm text-matrix-text">
                  descripción <span className="text-matrix-accent">*</span>
                </label>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span
                    className={
                      trimmedContent.length >= MIN_DESCRIPTION_LENGTH
                        ? 'text-matrix-accent'
                        : 'text-matrix-muted'
                    }
                  >
                    mín. {MIN_DESCRIPTION_LENGTH}
                  </span>
                  <span className="text-matrix-border">|</span>
                  <span
                    className={
                      trimmedContent.length > MAX_DESCRIPTION_LENGTH
                        ? 'font-bold text-red-400'
                        : 'text-matrix-muted'
                    }
                  >
                    {trimmedContent.length} / {MAX_DESCRIPTION_LENGTH}
                  </span>
                </div>
              </div>

              <textarea
                id="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                onBlur={() => setContentTouched(true)}
                rows={6}
                placeholder="¿Qué está pasando en la red? (mínimo 10 caracteres)"
                aria-invalid={showDescriptionError}
                aria-describedby={showDescriptionError ? 'content-error' : undefined}
                disabled={publicationCreated || submitting}
                className={`min-h-[120px] w-full resize-y rounded-lg border bg-matrix-bg/90 p-3.5 font-mono text-sm text-matrix-text outline-none transition-all placeholder:text-matrix-muted/50 ${
                  showDescriptionError
                    ? 'border-red-500/80 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                    : 'border-matrix-border focus:border-matrix-accent focus:ring-1 focus:ring-matrix-accent focus:shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                }`}
              />

              <div className="h-1 w-full overflow-hidden rounded-full bg-black/60">
                <div
                  className={`h-full transition-all duration-300 ${
                    trimmedContent.length > MAX_DESCRIPTION_LENGTH
                      ? 'bg-red-500'
                      : trimmedContent.length >= MIN_DESCRIPTION_LENGTH
                        ? 'bg-matrix-accent'
                        : 'bg-amber-400/80'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              {showDescriptionError && (
                <p
                  id="content-error"
                  role="alert"
                  className="font-mono text-xs text-red-400"
                >
                  ! {descriptionError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span id="tags-label" className="font-mono text-sm text-matrix-text">
                  etiquetas (opcional)
                </span>
                {selectedTagIds.length > 0 && (
                  <span className="font-mono text-xs text-matrix-accent">
                    {selectedTagIds.length}{' '}
                    {selectedTagIds.length === 1 ? 'seleccionada' : 'seleccionadas'}
                  </span>
                )}
              </div>
              <fieldset
                aria-labelledby="tags-label"
                className="rounded-lg border border-matrix-border/70 bg-black/30 p-3.5"
                disabled={publicationCreated || submitting}
              >
                {tagsLoading ? (
                  <p className="font-mono text-xs text-matrix-muted">
                    [ cargando_etiquetas... ]
                  </p>
                ) : tagsError ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <p role="alert" className="font-mono text-xs text-red-400">
                      ! {tagsError}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setTagsError('')
                        setTagsLoading(true)
                        setTagsRetryCount((count) => count + 1)
                      }}
                      className="rounded border border-matrix-border px-3 py-1 font-mono text-xs text-matrix-accent hover:border-matrix-accent"
                    >
                      [ reintentar ]
                    </button>
                  </div>
                ) : availableTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => {
                      const isSelected = selectedTagIds.includes(tag.id)
                      return (
                        <label key={tag.id} className="cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleTag(tag.id)}
                            className="peer sr-only"
                          />
                          <span
                            className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-xs transition-all duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-matrix-accent peer-disabled:cursor-not-allowed peer-disabled:opacity-50 ${
                              isSelected
                                ? 'border-matrix-accent bg-matrix-accent/15 text-matrix-accent shadow-[0_0_12px_rgba(16,185,129,0.18)]'
                                : 'border-matrix-border bg-matrix-bg/80 text-matrix-muted hover:border-matrix-accent/50 hover:text-matrix-text'
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border transition-colors ${
                                isSelected
                                  ? 'border-matrix-accent bg-matrix-accent text-black'
                                  : 'border-matrix-muted/50 bg-black/50'
                              }`}
                            >
                              {isSelected && (
                                <svg
                                  viewBox="0 0 12 12"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-2.5 w-2.5"
                                >
                                  <path d="M2.5 6.2 5 8.7 9.5 3.5" />
                                </svg>
                              )}
                            </span>
                            <span>#{tag.name}</span>
                          </span>
                        </label>
                      )
                    })}
                  </div>
                ) : (
                  <p className="font-mono text-xs text-matrix-muted">
                    // [ no hay etiquetas disponibles ]
                  </p>
                )}
              </fieldset>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span id="images-label" className="font-mono text-sm text-matrix-text">
                  imágenes (URLs opcionales)
                </span>
                <span className="font-mono text-xs text-matrix-muted">
                  {validUrls.length} / {MAX_IMAGES} URLs
                </span>
              </div>
              <fieldset
                aria-labelledby="images-label"
                className="space-y-3 rounded-lg border border-matrix-border/70 bg-black/30 p-3.5"
                disabled={publicationCreated || submitting}
              >
                {imageUrls.map((url, index) => {
                  const trimmedUrl = url.trim()
                  const rowError = imageRowErrors[index]
                  const canPreview =
                    Boolean(trimmedUrl) &&
                    isValidHttpUrl(trimmedUrl) &&
                    !rowError

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="w-6 shrink-0 text-center font-mono text-xs text-matrix-accent"
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <input
                          id={`imageUrl-${index}`}
                          type="url"
                          value={url}
                          onChange={(event) =>
                            updateImageUrl(index, event.target.value)
                          }
                          placeholder="https://ejemplo.com/imagen.jpg"
                          aria-label={`URL de imagen ${index + 1}`}
                          aria-invalid={Boolean(rowError)}
                          className={`min-w-0 flex-1 rounded-lg border bg-matrix-bg/90 px-3 py-3 font-mono text-sm text-matrix-text outline-none transition-all placeholder:text-matrix-muted/50 ${
                            rowError
                              ? 'border-red-500/80 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                              : 'border-matrix-border focus:border-matrix-accent focus:ring-1 focus:ring-matrix-accent'
                          }`}
                        />
                        {imageUrls.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageRow(index)}
                            className="rounded border border-red-500/40 px-3 py-2 font-mono text-xs text-red-400 transition-colors hover:border-red-400"
                            aria-label={`Eliminar URL de imagen ${index + 1}`}
                          >
                            [ quitar ]
                          </button>
                        )}
                      </div>

                      {rowError && (
                        <p
                          role="alert"
                          className="pl-8 font-mono text-xs text-red-400"
                        >
                          ! {rowError}
                        </p>
                      )}

                      {canPreview && (
                        <div className="ml-8 flex items-center gap-3 rounded-lg border border-matrix-border/60 bg-matrix-bg/70 p-2">
                          {!brokenImages[index] ? (
                            <>
                              <img
                                src={trimmedUrl}
                                alt={`Vista previa ${index + 1}`}
                                onError={() =>
                                  setBrokenImages((current) => ({
                                    ...current,
                                    [index]: true,
                                  }))
                                }
                                className="h-12 w-12 shrink-0 rounded border border-matrix-accent/40 object-cover"
                              />
                              <span className="truncate font-mono text-xs text-matrix-accent">
                                [ ok ] vista previa cargada
                              </span>
                            </>
                          ) : (
                            <span className="font-mono text-xs text-amber-300">
                              ! no se pudo previsualizar la imagen (verificá que el enlace sea directo)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}

                {imageUrls.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() =>
                      setImageUrls((currentUrls) => [...currentUrls, ''])
                    }
                    className="rounded border border-matrix-border px-3 py-1.5 font-mono text-xs text-matrix-accent hover:border-matrix-accent"
                  >
                    [ + agregar imagen ]
                  </button>
                )}
              </fieldset>
            </div>

            <div className="flex flex-col gap-4 border-t border-matrix-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="font-mono text-xs" aria-live="polite">
                {publicationCreated ? (
                  <span className="text-matrix-accent">
                    publicación #{createdPostId} creada
                  </span>
                ) : submitting ? (
                  <span className="text-matrix-accent">
                    [ enviando_publicación... ]
                  </span>
                ) : isFormReady ? (
                  <span className="text-matrix-accent">
                    [ listo_para_publicar ]
                  </span>
                ) : (
                  <span className="text-matrix-muted">
                    // completá los campos requeridos para enviar
                  </span>
                )}
              </div>

              {publicationCreated ? (
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="rounded border border-matrix-accent/60 bg-matrix-accent/10 px-5 py-2.5 font-mono text-sm font-bold uppercase tracking-wide text-matrix-accent transition hover:border-matrix-accent hover:bg-matrix-accent/20"
                >
                  [ ir al perfil ]
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting || tagsLoading || Boolean(tagsError)}
                  className="rounded border border-matrix-accent/60 bg-matrix-accent/10 px-5 py-2.5 font-mono text-sm font-bold uppercase tracking-wide text-matrix-accent transition hover:border-matrix-accent hover:bg-matrix-accent/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? '[ publicando... ]' : '[ publicar ]'}
                </button>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </section>
  )
}