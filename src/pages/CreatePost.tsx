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

export default function CreatePost() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [imageUrls, setImageUrls] = useState([''])
  const [tagsLoading, setTagsLoading] = useState(true)
  const [tagsError, setTagsError] = useState('')
  const [tagsRetryCount, setTagsRetryCount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [createdPostId, setCreatedPostId] = useState<number | null>(null)
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!user) {
      setError('Debés iniciar sesión para publicar.')
      return
    }

    const trimmedContent = content.trim()
    if (!trimmedContent) {
      setError('La descripción no puede estar vacía.')
      return
    }

    if (tagsLoading || tagsError) {
      setError('Esperá a que se carguen las etiquetas antes de publicar.')
      return
    }

    const urls = imageUrls.map((url) => url.trim()).filter(Boolean)
    setSubmitting(true)

    try {
      const post = await createPost({
        description: trimmedContent,
        userId: user.id,
        tagIds: selectedTagIds,
      })

      const failedImages: string[] = []
      for (const url of urls) {
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
  }

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((currentTagIds) =>
      currentTagIds.includes(tagId)
        ? currentTagIds.filter((currentTagId) => currentTagId !== tagId)
        : [...currentTagIds, tagId],
    )
  }

  const publicationCreated = createdPostId !== null

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

        {error && (
          <p
            role="alert"
            className="mb-5 rounded border border-red-500/50 bg-red-950/30 p-3 font-mono text-xs text-red-400"
          >
            ! {error}
          </p>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="content" className="font-mono text-sm text-matrix-text">
                descripción
              </label>
              <span className="font-mono text-xs text-matrix-muted">
                {content.length} caracteres
              </span>
            </div>
            <textarea
              id="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={6}
              placeholder="¿Qué está pasando en la red?"
              required
              disabled={publicationCreated || submitting}
              className="min-h-[120px] w-full resize-y rounded-lg border border-matrix-border bg-matrix-bg/90 p-3.5 font-mono text-sm text-matrix-text outline-none transition-all placeholder:text-matrix-muted/50 focus:border-matrix-accent focus:ring-1 focus:ring-matrix-accent focus:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            />
          </div>

          <fieldset
            className="space-y-3 rounded-lg border border-matrix-border/70 bg-black/30 p-3"
            disabled={publicationCreated || submitting}
          >
            <legend className="px-1 font-mono text-sm text-matrix-text">
              etiquetas (opcional)
            </legend>
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
                {availableTags.map((tag) => (
                  <label
                    key={tag.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs transition-colors focus-within:ring-2 focus-within:ring-matrix-accent ${
                      selectedTagIds.includes(tag.id)
                        ? 'border-matrix-accent bg-matrix-accent/15 text-matrix-accent'
                        : 'border-matrix-border bg-matrix-bg/70 text-matrix-muted hover:border-matrix-accent/60 hover:text-matrix-text'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTagIds.includes(tag.id)}
                      onChange={() => toggleTag(tag.id)}
                      className="h-3.5 w-3.5 accent-matrix-accent"
                    />
                    #{tag.name}
                  </label>
                ))}
              </div>
            ) : (
              <p className="font-mono text-xs text-matrix-muted">
                // [ no hay etiquetas disponibles ]
              </p>
            )}
          </fieldset>

          <fieldset
            className="space-y-3 rounded-lg border border-matrix-border/70 bg-black/30 p-3"
            disabled={publicationCreated || submitting}
          >
            <legend className="px-1 font-mono text-sm text-matrix-text">
              imágenes (URLs opcionales)
            </legend>
            {imageUrls.map((url, index) => (
              <div key={index} className="flex items-center gap-2">
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
                  onChange={(event) => updateImageUrl(index, event.target.value)}
                  placeholder="https://..."
                  aria-label={`URL de imagen ${index + 1}`}
                  className="min-w-0 flex-1 rounded-lg border border-matrix-border bg-matrix-bg/90 px-3 py-3 font-mono text-sm text-matrix-text outline-none transition-all placeholder:text-matrix-muted/50 focus:border-matrix-accent focus:ring-1 focus:ring-matrix-accent"
                />
                {imageUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setImageUrls((currentUrls) =>
                        currentUrls.filter(
                          (_, currentIndex) => currentIndex !== index,
                        ),
                      )
                    }
                    className="rounded border border-red-500/40 px-3 py-2 font-mono text-xs text-red-400 transition-colors hover:border-red-400"
                    aria-label={`Eliminar URL de imagen ${index + 1}`}
                  >
                    [ quitar ]
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setImageUrls((currentUrls) => [...currentUrls, ''])}
              className="rounded border border-matrix-border px-3 py-1.5 font-mono text-xs text-matrix-accent hover:border-matrix-accent"
            >
              [ + agregar imagen ]
            </button>
          </fieldset>

          <div className="flex flex-col gap-4 border-t border-matrix-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="font-mono text-xs text-matrix-muted" aria-live="polite">
              {publicationCreated
                ? `publicación #${createdPostId} creada`
                : submitting
                  ? '[ enviando_publicación... ]'
                  : 'sin datos enviados aún'}
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
                disabled={
                  submitting ||
                  tagsLoading ||
                  Boolean(tagsError)
                }
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
