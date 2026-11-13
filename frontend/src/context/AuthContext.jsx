import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, getToken, setToken } from '../api/client'
import { AuthContext } from './auth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(getToken()))

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    const handleExpired = () => logout()
    window.addEventListener('auth:expired', handleExpired)
    if (!getToken()) {
      setLoading(false)
      return () => window.removeEventListener('auth:expired', handleExpired)
    }
    api('/auth/me')
      .then(({ data }) => setUser(data))
      .catch(logout)
      .finally(() => setLoading(false))
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [logout])

  const login = useCallback(async (username, password) => {
    const { data } = await api('/auth/login', { method: 'POST', body: { username, password } })
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
