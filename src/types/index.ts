export interface User {
  id: number
  nickName: string
  createdAt?: string
  updatedAt?: string
}

export interface Post {
  id: number
  description: string
  userId: number
  createdAt?: string
  updatedAt?: string
  tags?: Tag[]
  images?: Image[]
}

export interface Comment {
  id: number
  postId: number
  userId: number
  message: string
  createdAt?: string
  updatedAt?: string
}

export interface Tag {
  id: number
  name: string
  createdAt?: string
  updatedAt?: string
}

export interface Image {
  id: number
  postId: number
  url: string
  createdAt?: string
  updatedAt?: string
}
