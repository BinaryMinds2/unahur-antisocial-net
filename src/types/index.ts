export interface User {
  id: string
  username: string
  email: string
  name?: string
  avatarUrl?: string
}

export interface Post {
  id: string
  authorId: string
  content: string
  createdAt: string
  tags?: Tag[]
  imageUrl?: string
}

export interface Comment {
  id: string
  postId: string
  authorId: string
  content: string
  createdAt: string
}

export interface Tag {
  id: string
  name: string
}

export interface Image {
  id: string
  postId: string
  url: string
  alt?: string
}
