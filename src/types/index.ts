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
  PostId: number
  url: string
}

export interface Post {
  id: number
  description: string
  createdAt?: string
  UserId?: number
  User?: User
  Tags?: Tag[]
  PostImages?: PostImage[]
  commentsCount?: number
}

export interface Comment {
  id: number
  PostId: number
  UserId?: number
  content: string
  User?: User
}

export interface UserRegistrationData {
  nickName: string
  email: string
}
