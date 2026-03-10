const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

const buildHeaders = (token, isFormData) => {
  const headers = {
    Accept: 'application/json',
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, token, isFormData = false } = options

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders(token, isFormData),
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const details = payload.errors
      ? Object.values(payload.errors).flat().join(' ')
      : payload.message || 'Request failed.'

    throw new Error(details)
  }

  return payload
}

export { API_BASE_URL }
