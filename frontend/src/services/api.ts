import axios from 'axios'
import { ApiResponse } from '@shared/types'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.response.use(
  (response) => {
    const apiResponse: ApiResponse = response.data
    if (apiResponse.success) {
      return { ...response, data: apiResponse.data }
    } else {
      throw new Error(apiResponse.error || 'API request failed')
    }
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export { api }