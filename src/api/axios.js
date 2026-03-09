import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Injecter automatiquement le token à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Gérer les erreurs globalement (401 = déconnexion)
// SAUF pour /login et /register où le 401 est une erreur normale
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = 
      error.config?.url?.includes('/login') ||
      error.config?.url?.includes('/register')

    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default api