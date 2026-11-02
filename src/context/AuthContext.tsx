import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User, UserRecord, UserRegistrationData } from '../types'
import { AuthContext } from './AuthContextDefinition'
import { createUser, fetchUsers } from '../services/api'

const STORAGE_KEY = 'unahur-auth-user'

interface AuthProviderProps {
  children: ReactNode
}

function getSessionUser(user: UserRecord): User {
  return {
    id: user.id,
    nickName: user.nickName,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
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
      login: async (identifier: string, password: string) => {
        const users = await fetchUsers()
        const normalizedIdentifier = identifier.trim().toLocaleLowerCase()
        const matchingUser = users.find(
          (candidate) =>
            candidate.nickName.trim().toLocaleLowerCase() ===
            normalizedIdentifier,
        )

        if (!matchingUser) {
          throw new Error('No existe un usuario con ese email o nombre de usuario.')
        }

        if ((matchingUser.password ?? '123456') !== password) {
          throw new Error('La contraseña ingresada es incorrecta.')
        }

        const sessionUser = getSessionUser(matchingUser)
        setUser(sessionUser)
        return sessionUser
      },
      register: (data: UserRegistrationData) => createUser(data),
      logout: () => setUser(null),
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
