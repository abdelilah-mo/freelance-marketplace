import { createContext, useContext, useEffect, useState } from 'react'
import { apiRequest } from '../lib/api.js'

const AuthContext = createContext(null)
const STORAGE_KEY = 'freelance-marketplace-auth'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored).token : null
  })
  const [user, setUser] = useState(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored).user : null
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token || user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }))
      return
    }

    window.localStorage.removeItem(STORAGE_KEY)
  }, [token, user])

  useEffect(() => {
    if (!token || user) {
      return
    }

    apiRequest('/auth/me', { token })
      .then((payload) => setUser(payload.user))
      .catch(() => {
        setToken(null)
        setUser(null)
      })
  }, [token, user])

  const login = async (credentials) => {
    setLoading(true)

    try {
      const payload = await apiRequest('/auth/login', {
        method: 'POST',
        body: credentials,
      })

      setToken(payload.token)
      setUser(payload.user)

      return payload.user
    } finally {
      setLoading(false)
    }
  }

  const register = async (formData) => {
    setLoading(true)

    try {
      const payload = await apiRequest('/auth/register', {
        method: 'POST',
        body: formData,
      })

      setToken(payload.token)
      setUser(payload.user)

      return payload.user
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    if (token) {
      try {
        await apiRequest('/auth/logout', {
          method: 'POST',
          token,
        })
      } catch {
        // Ignore logout errors and clear local state.
      }
    }

    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
