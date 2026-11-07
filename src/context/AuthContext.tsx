import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User, UserRegistrationData } from '../types'
import { createUser, getUsers } from '../services/api'
import { AuthContext } from './AuthContextDefinition'

const STORAGE_KEY = 'unahur_user'

interface AuthProviderProps {
  children: ReactNode
}

function readStoredUser(): User | null {
  const storedUser = localStorage.getItem(STORAGE_KEY)

  if (!storedUser) {
    return null
  }

  try {
    const parsedUser: unknown = JSON.parse(storedUser)
    if (
      typeof parsedUser === 'object' &&
      parsedUser !== null &&
      typeof (parsedUser as User).id === 'number' &&
      typeof (parsedUser as User).nickName === 'string'
    ) {
      return parsedUser as User
    }
  } catch {
    // Invalid persisted sessions are cleared below.
  }

  localStorage.removeItem(STORAGE_KEY)
  return null
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(readStoredUser)

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  const login = useCallback(async (nickName: string, password: string) => {
    const normalizedNickName = nickName.trim().toLowerCase()
    const users = await getUsers()
    const matchingUser = users.find(
      (candidate) =>
        candidate.nickName.trim().toLowerCase() === normalizedNickName,
    )

    if (
      !matchingUser ||
      (password !== '123456' &&
        matchingUser.password !== password)
    ) {
      return false
    }

    setUser(matchingUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matchingUser))
    return true
  }, [])

  const authenticate = useCallback((authenticatedUser: User) => {
    setUser(authenticatedUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser))
  }, [])

  const register = useCallback(
    (data: UserRegistrationData) => createUser(data),
    [],
  )

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const value = useMemo(
    () => ({ user, login, authenticate, register, logout }),
    [user, login, authenticate, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
