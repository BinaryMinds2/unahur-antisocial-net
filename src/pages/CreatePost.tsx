import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
      <div className="relative z-10 mx-auto max-w-3xl rounded-2xl border border-matrix-border bg-matrix-card/80 p-6 shadow-[0_0_25px_rgba(16,185,129,0.12)] backdrop-blur-md sm:p-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-matrix-accent/80">
              [ nueva_publicación ]
            </p>
            <h1 className="font-mono text-3xl font-bold text-matrix-text">
              crear publicación
            </h1>
          </div>
          <div className="hidden items-center gap-2 rounded border border-matrix-border/60 bg-black/30 px-3 py-1.5 font-mono text-[10px] text-matrix-muted sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-matrix-accent" />
            <span>status: ready</span>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="content" className="font-mono text-sm text-matrix-text">
              descripción
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={6}
              placeholder="¿Qué está pasando en la red?"
              className="w-full rounded-xl border border-matrix-border bg-matrix-bg/80 px-4 py-3 font-sans text-base text-matrix-text placeholder:text-matrix-muted/70 focus:border-matrix-accent focus:outline-none focus:ring-2 focus:ring-matrix-accent/30"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="tags" className="font-mono text-sm text-matrix-text">
                etiquetas
              </label>
              <input
                id="tags"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="#viajes, #arte, #cine"
                className="w-full rounded-xl border border-matrix-border bg-matrix-bg/80 px-4 py-3 font-mono text-sm text-matrix-text placeholder:text-matrix-muted/70 focus:border-matrix-accent focus:outline-none focus:ring-2 focus:ring-matrix-accent/30"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="imageUrl" className="font-mono text-sm text-matrix-text">
                imagen (URL)
              </label>
              <input
                id="imageUrl"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-matrix-border bg-matrix-bg/80 px-4 py-3 font-mono text-sm text-matrix-text placeholder:text-matrix-muted/70 focus:border-matrix-accent focus:outline-none focus:ring-2 focus:ring-matrix-accent/30"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-matrix-border bg-matrix-bg/60 px-4 py-3 font-mono text-sm text-matrix-text">
            <input
              type="checkbox"
              checked={useSuggestedImage}
              onChange={(event) => setUseSuggestedImage(event.target.checked)}
              className="h-4 w-4 accent-matrix-accent"
            />
            usar imagen sugerida si no tengo URL
          </label>

          <div className="flex flex-col gap-4 border-t border-matrix-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="font-mono text-xs text-matrix-muted" role={status ? 'alert' : undefined}>
              {status ?? 'sin datos enviados aún'}
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
              className="rounded border border-matrix-accent/60 bg-matrix-accent/10 px-5 py-2.5 font-mono text-sm font-bold uppercase tracking-wide text-matrix-accent transition hover:border-matrix-accent hover:bg-matrix-accent/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? '[ guardando... ]' : '[ publicar ]'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

