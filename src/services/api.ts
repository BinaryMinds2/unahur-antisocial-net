import type { Comment, Image, Post, Tag, User } from '../types'

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

export const fetchUsers = (): Promise<User[]> => request<User[]>('/users')

export const fetchPosts = (): Promise<Post[]> => request<Post[]>('/posts')

export const fetchComments = (postId?: number): Promise<Comment[]> =>
  request<Comment[]>(postId ? `/comments?postId=${postId}` : '/comments')

export const fetchTags = (): Promise<Tag[]> => request<Tag[]>('/tags')

export const fetchPostImages = (postId: number): Promise<Image[]> =>
  request<Image[]>(`/posts/${postId}/images`)

export const createUser = (nickName: string): Promise<User> =>
  request<User>('/users', {
    method: 'POST',
    body: JSON.stringify({ nickName }),
  })

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
