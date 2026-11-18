import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User, UserRegistrationData } from '../types'
import { DEFAULT_PASSWORD } from '../constants'
import { createUser, getUserById, getUsers } from '../services/api'
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
  const [welcomeUser, setWelcomeUser] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  const dismissWelcomeToast = useCallback(() => {
    setWelcomeUser(null)
  }, [])

  useEffect(() => {
    if (!welcomeUser) return

    const timer = window.setTimeout(() => {
      setWelcomeUser(null)
    }, 3500)

    return () => window.clearTimeout(timer)
  }, [welcomeUser])

  const login = useCallback(async (nickName: string, password: string) => {
    const normalizedNickName = nickName.trim().toLowerCase()
    const users = await getUsers()
    const matchingUser = users.find(
      (candidate) =>
        candidate.nickName.trim().toLowerCase() === normalizedNickName,
    )

    if (!matchingUser || password !== DEFAULT_PASSWORD) {
      return false
    }

    setUser(matchingUser)
    setWelcomeUser(matchingUser.nickName)
    return true
  }, [])

  const register = useCallback(
    (data: UserRegistrationData) => createUser(data),
    [],
  )

  const logout = useCallback(() => {
    setUser(null)
    setWelcomeUser(null)
  }, [])

  useEffect(() => {
    if (!user) return

    let active = true

    getUserById(user.id).catch((error: unknown) => {
      if (
        active &&
        error instanceof Error &&
        (error as Error & { status?: number }).status === 404
      ) {
        logout()
      }
    })

    return () => {
      active = false
    }
  }, [logout, user])

  const value = useMemo(
    () => ({
      user,
      welcomeUser,
      login,
      register,
      logout,
      dismissWelcomeToast,
    }),
    [user, welcomeUser, login, register, logout, dismissWelcomeToast],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}