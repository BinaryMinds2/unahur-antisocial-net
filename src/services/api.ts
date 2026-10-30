import type { Comment, Image, Post, Tag, User } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

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
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

export const fetchUsers = (): Promise<User[]> => request<User[]>('/users')

export const fetchPosts = (): Promise<Post[]> => request<Post[]>('/posts')

export const fetchComments = (): Promise<Comment[]> =>
  request<Comment[]>('/comments')

export const fetchTags = (): Promise<Tag[]> => request<Tag[]>('/tags')

export const fetchPostImages = (): Promise<Image[]> =>
  request<Image[]>('/postimages')
