import { createContext } from 'react'
import type { User, UserRegistrationData } from '../types'

export interface AuthContextValue {
  user: User | null
  welcomeUser: string | null
  login: (nickName: string, password: string) => Promise<boolean>
  register: (data: UserRegistrationData) => Promise<User>
  logout: () => void
  dismissWelcomeToast: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)