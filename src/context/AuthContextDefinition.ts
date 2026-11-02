import { createContext } from 'react'
import type { User } from '../types'

export interface AuthContextValue {
  user: User | null
  login: (user: User) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)
