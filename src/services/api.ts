import type {
  Comment,
  Post,
  PostImage,
  Tag,
  User,
  UserRegistrationData,
} from '../types'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function getRequestUrl(endpoint: string): string {
  const baseUrl = API_URL.replace(/\/$/, '')
  const apiBaseUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`
  return `${apiBaseUrl}${endpoint}`
}

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(getRequestUrl(endpoint), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    let message = `La solicitud falló (${response.status} ${response.statusText})`

    try {
      const body = (await response.json()) as {
        error?: string
        message?: string
      }
      message = body.error ?? body.message ?? message
    } catch {
      // Some error responses do not contain JSON.
    }

    throw new Error(message)
  }

  const body: unknown = await response.json()

  if (
    typeof body === 'object' &&
    body !== null &&
    'data' in body
  ) {
    return (body as { data: T }).data
  }

  return body as T
}

export const getPosts = (): Promise<Post[]> => fetchApi<Post[]>('/posts')

export const getPostById = (id: string | number): Promise<Post> =>
  fetchApi<Post>(`/posts/${id}`)

export const getUsers = (): Promise<User[]> => fetchApi<User[]>('/users')

export const getTags = (): Promise<Tag[]> => fetchApi<Tag[]>('/tags')

export const getCommentsByPost = (postId: number): Promise<Comment[]> =>
  fetchApi<Comment[]>(`/comments/post/${postId}`)

export const getPostImages = (postId: number): Promise<PostImage[]> =>
  fetchApi<PostImage[]>(`/postimages/post/${postId}`)

export const createPost = (data: {
  description: string
  userId: number
  tags?: number[]
}): Promise<Post> =>
  fetchApi<Post>('/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const createUser = (data: UserRegistrationData): Promise<User> =>
  fetchApi<User>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const createComment = (data: {
  postId: number
  userId: number
  text: string
}): Promise<Comment> =>
  fetchApi<Comment>('/comments', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const createPostImage = (data: {
  postId: number
  url: string
}): Promise<PostImage> =>
  fetchApi<PostImage>('/postimages', {
    method: 'POST',
    body: JSON.stringify(data),
  })

// Compatibility aliases for existing screens.
export const fetchPosts = getPosts
export const fetchUsers = getUsers
export const fetchTags = getTags
export const fetchComments = (postId?: number): Promise<Comment[]> =>
  postId === undefined
    ? fetchApi<Comment[]>('/comments')
    : getCommentsByPost(postId)
export const fetchPostImages = getPostImages

export function getApiErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}
