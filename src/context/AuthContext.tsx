import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User, UserRegistrationData } from '../types'
import { AuthContext } from './AuthContextDefinition'
import { createUser } from '../services/api'

const STORAGE_KEY = 'user'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY)

    if (!storedUser) {
      return null
    }

    try {
      return JSON.parse(storedUser) as User
    } catch {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  const value = useMemo(
    () => ({
      user,
      authenticate: (authenticatedUser: User) => setUser(authenticatedUser),
      register: (data: UserRegistrationData) => createUser(data),
      logout: () => setUser(null),
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
