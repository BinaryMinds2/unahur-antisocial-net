export interface User {
  id: number
  nickName: string
  email?: string
  createdAt?: string
  updatedAt?: string
}

export interface UserRecord extends User {
  password?: string
}

export interface UserRegistrationData {
  nickName: string
}

export interface Post {
  id: number
  description: string
  userId: number
  createdAt?: string
  updatedAt?: string
  author?: Pick<User, 'id' | 'nickName'>
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
