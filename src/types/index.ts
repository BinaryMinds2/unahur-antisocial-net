export interface User {
  id: number
  nickName: string
  password?: string
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
  userId: number
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
  userId: number
  text: string
  User?: User
  // Legacy response alias kept for existing consumers.
  message?: string
}

export interface UserRegistrationData {
  nickName: string
  password?: string
}

export type Image = PostImage
