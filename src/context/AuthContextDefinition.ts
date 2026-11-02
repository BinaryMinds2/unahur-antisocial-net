import { createContext } from 'react'
import type { User, UserRegistrationData } from '../types'

export interface AuthContextValue {
  user: User | null
  login: (identifier: string, password: string) => Promise<User>
  register: (data: UserRegistrationData) => Promise<User>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)
