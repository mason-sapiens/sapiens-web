import axios from 'axios'

const aiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://3.101.121.64:8000',
  timeout: 60000,
})

export interface AIMessage {
  user_id: string
  message: string
}

export interface AIResponse {
  user_id: string
  response: string
  current_state: string
}

export const aiService = {
  async sendMessage(userId: string, message: string): Promise<AIResponse> {
    const { data } = await aiClient.post<AIResponse>('/api/chat', {
      user_id: userId,
      message,
    })
    return data
  },

  async initializeUser(userId: string): Promise<void> {
    await aiClient.post(`/api/users?user_id=${userId}`)
  },

  async checkHealth(): Promise<boolean> {
    try {
      const { data } = await aiClient.get('/health')
      return data.status === 'healthy'
    } catch {
      return false
    }
  },
}
