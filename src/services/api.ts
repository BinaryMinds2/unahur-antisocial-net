import type {
  Comment,
  Image,
  Post,
  Tag,
  User,
  UserRecord,
  UserRegistrationData,
} from '../types'

const API_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
).replace(/\/$/, '')

async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`

    try {
      const body = (await response.json()) as { error?: string; message?: string }
      message = body.error ?? body.message ?? message
    } catch {
      // The response may not contain JSON.
    }

    throw new Error(message)
  }

  return response.json() as Promise<T>
}

interface ApiDataResponse<T> {
  data: T
}

export async function fetchUsers(): Promise<UserRecord[]> {
  const response = await request<ApiDataResponse<UserRecord[]>>('/users')

  if (!Array.isArray(response.data)) {
    throw new Error('La respuesta de usuarios de la API no es válida.')
  }

  return response.data
}

export const fetchPosts = (): Promise<Post[]> => request<Post[]>('/posts')

export const fetchComments = (postId?: number): Promise<Comment[]> =>
  request<Comment[]>(postId ? `/comments?postId=${postId}` : '/comments')

export const fetchTags = (): Promise<Tag[]> => request<Tag[]>('/tags')

export const fetchPostImages = (postId: number): Promise<Image[]> =>
  request<Image[]>(`/posts/${postId}/images`)

export async function createUser(
  user: UserRegistrationData,
): Promise<User> {
  const response = await request<ApiDataResponse<User>>('/users', {
    method: 'POST',
    body: JSON.stringify({ nickName: user.nickName }),
  })

  return response.data
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const errorRecord = error as Record<string, unknown>
    const response = errorRecord.response
    if (typeof response === 'object' && response !== null) {
      const data = (response as Record<string, unknown>).data
      if (typeof data === 'object' && data !== null) {
        const dataRecord = data as Record<string, unknown>
        const responseMessage = dataRecord.message ?? dataRecord.error
        if (typeof responseMessage === 'string' && responseMessage.length > 0) {
          return responseMessage
        }
      }
    }

    if (error instanceof Error && error.message) {
      return error.message
    }

    const message = errorRecord.message
    if (typeof message === 'string' && message.length > 0) {
      return message
    }
  }

  return fallback
}

export const createPost = (description: string, userId: number): Promise<Post> =>
  request<Post>('/posts', {
    method: 'POST',
    body: JSON.stringify({ description, userId }),
  })

export const createComment = (
  message: string,
  userId: number,
  postId: number,
): Promise<Comment> =>
  request<Comment>('/comments', {
    method: 'POST',
    body: JSON.stringify({ message, userId, postId }),
  })

export const createTag = (name: string): Promise<Tag> =>
  request<Tag>('/tags', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
