import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    
    if (error.response?.status === 404) {
      throw new Error('Resource not found')
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.')
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Invalid request')
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.')
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection.')
    }
    
    throw new Error(error.response?.data?.message || error.message || 'An error occurred')
  }
)

/**
 * Search for people using Torre API
 */
export const searchPeople = async (query, options = {}) => {
  try {
    const response = await apiClient.post('/api/torre/search', {
      query,
      ...options
    })
    
    return response.results || []
  } catch (error) {
    console.error('Search people error:', error)
    throw error
  }
}

/**
 * Get user genome information
 */
export const getUserGenome = async (username) => {
  try {
    const response = await apiClient.get(`/api/torre/genome/${username}`)
    return response.genome
  } catch (error) {
    console.error('Get user genome error:', error)
    throw error
  }
}

/**
 * Get analyzed user profile
 */
export const getUserProfile = async (username) => {
  try {
    const response = await apiClient.get(`/api/torre/profile/${username}`)
    return response.analysis
  } catch (error) {
    console.error('Get user profile error:', error)
    throw error
  }
}

/**
 * Analyze team composition
 */
export const analyzeTeam = async (usernames, requirements = {}) => {
  try {
    const response = await apiClient.post('/api/analysis/build-team', {
      usernames,
      requirements
    })
    
    return response.teamAnalysis
  } catch (error) {
    console.error('Analyze team error:', error)
    throw error
  }
}

/**
 * Get Torre API analysis
 */
export const getAPIAnalysis = async () => {
  try {
    const response = await apiClient.get('/api/analysis/torre-api')
    return response.analysis
  } catch (error) {
    console.error('Get API analysis error:', error)
    throw error
  }
}

/**
 * Health check
 */
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health')
    return response
  } catch (error) {
    console.error('Health check error:', error)
    throw error
  }
}

export default {
  searchPeople,
  getUserGenome,
  getUserProfile,
  analyzeTeam,
  getAPIAnalysis,
  healthCheck
}