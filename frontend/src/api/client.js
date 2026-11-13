const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '')
const TOKEN_KEY = 'camp_access_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY)

export async function api(path, options = {}) {
  const headers = new Headers(options.headers)
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      body: options.body && !(options.body instanceof FormData) && typeof options.body !== 'string'
        ? JSON.stringify(options.body)
        : options.body,
    })
  } catch {
    throw new Error('Cannot connect to the API. Check that the backend is running.')
  }

  if (response.status === 204) return null
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (response.status === 401 && token) window.dispatchEvent(new Event('auth:expired'))
    const error = new Error(payload.error?.message || `Request failed (${response.status})`)
    error.status = response.status
    error.details = payload.error?.details
    throw error
  }
  return payload
}

export function queryString(values) {
  const params = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, value)
  })
  const query = params.toString()
  return query ? `?${query}` : ''
}
