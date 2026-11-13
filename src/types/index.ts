export interface User {
  id: number
  nickName: string
  email?: string
}

export interface Tag {
  id: number
  name: string
}

export interface PostImage {
  id: number
  postId: number
  url: string
}

export interface Post {
  id: number
  description: string
  createdAt?: string
  userId?: number
  UserId?: number
  User?: User
  Tags?: Tag[]
  PostImages?: PostImage[]
  commentsCount?: number
  user?: User
  comments?: Comment[]
  // Legacy response aliases kept for existing cards and API consumers.
  author?: Pick<User, 'id' | 'nickName'>
  tags?: Tag[]
  images?: PostImage[]
}

export interface Comment {
  id: number
  postId: number
  userId?: number
  UserId?: number
  content: string
  User?: User
}

export interface UserRegistrationData {
  nickName: string
  email: string
}

export type Image = PostImage
