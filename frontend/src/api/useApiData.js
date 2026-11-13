import { useCallback, useEffect, useState } from 'react'
import { api } from './client'

export function useApiData(path, initial = []) {
  const [data, setData] = useState(initial)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { const response = await api(path); setData(response.data) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [path])
  useEffect(() => { load() }, [load])
  return { data, setData, loading, error, load }
}
