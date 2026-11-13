import axios from 'axios'
import type {
  Comment,
  Post,
  PostImage,
  Tag,
  User,
  UserRegistrationData,
} from '../types'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const apiClient = axios.create({
  baseURL: API_URL.replace(/\/$/, ''),
  headers: {
    'Content-Type': 'application/json',
  },
})

function unwrapApiResponse<T>(body: unknown): T {
  if (typeof body === 'object' && body !== null && 'data' in body) {
    return (body as { data: T }).data
  }

  return body as T
}

function getAxiosError(error: unknown): Error {
  if (!axios.isAxiosError(error) || !error.response) {
    return error instanceof Error ? error : new Error(String(error))
  }

  const body: unknown = error.response.data
  if (typeof body === 'object' && body !== null) {
    const message = body as { error?: unknown; message?: unknown }
    if (typeof message.error === 'string') {
      return new Error(message.error)
    }
    if (typeof message.message === 'string') {
      return new Error(message.message)
    }
  }

  return new Error(
    `La solicitud falló (${error.response.status} ${error.response.statusText})`,
  )
}

async function requestApi<T>(
  request: () => Promise<{ data: unknown }>,
): Promise<T> {
  try {
    const response = await request()
    return unwrapApiResponse<T>(response.data)
  } catch (error) {
    throw getAxiosError(error)
  }
}

export const getPosts = (): Promise<Post[]> =>
  requestApi(() => apiClient.get<unknown>('/posts'))

export const getPostsByUser = (userId: number): Promise<Post[]> =>
  requestApi(() =>
    apiClient.get<unknown>(`/posts?userId=${encodeURIComponent(userId)}`),
  )

export const getPostById = (id: string | number): Promise<Post> =>
  requestApi(() => apiClient.get<unknown>(`/posts/${id}`))

export const getUsers = (): Promise<User[]> =>
  requestApi(() => apiClient.get<unknown>('/users'))

export const getTags = (): Promise<Tag[]> =>
  requestApi(() => apiClient.get<unknown>('/tags'))

export const getCommentsByPost = (postId: number): Promise<Comment[]> =>
  requestApi(() => apiClient.get<unknown>(`/comments/post/${postId}`))

export const getPostImages = (postId: number): Promise<PostImage[]> =>
  requestApi(() => apiClient.get<unknown>(`/postimages/post/${postId}`))

export const createPost = (data: {
  description: string
  userId: number
  tagIds?: number[]
}): Promise<Post> =>
  requestApi(() => apiClient.post<unknown>('/posts', data))

export const deletePost = (
  id: number,
  userId: number,
): Promise<{ message: string }> =>
  requestApi(() =>
    apiClient.delete<unknown>(
      `/posts/${id}?userId=${encodeURIComponent(userId)}`,
    ),
  )

export const createUser = (data: UserRegistrationData): Promise<User> =>
  requestApi(() => apiClient.post<unknown>('/users', data))

export const createComment = (data: {
  postId: number
  userId: number
  content: string
}): Promise<Comment> =>
  requestApi(() => apiClient.post<unknown>('/comments', data))

export const createPostImage = (data: {
  postId: number
  url: string
}): Promise<PostImage> =>
  requestApi(() => apiClient.post<unknown>('/postimages', data))

// Compatibility aliases for existing screens.
export const fetchPosts = getPosts
export const fetchUsers = getUsers
export const fetchTags = getTags
export const fetchComments = (postId?: number): Promise<Comment[]> =>
  postId === undefined
    ? requestApi(() => apiClient.get<unknown>('/comments'))
    : getCommentsByPost(postId)
export const fetchPostImages = getPostImages

export function getApiErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}
