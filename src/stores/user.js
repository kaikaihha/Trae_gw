import { defineStore } from 'pinia'
import axios from 'axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}')
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.userInfo.role === 'admin',
    userId: (state) => state.userInfo.id,
    username: (state) => state.userInfo.username,
    department: (state) => state.userInfo.department
  },
  actions: {
    async login(username, password) {
      try {
        // 实际项目中应该调用后端API
        // const response = await axios.post('/api/auth/login', { username, password })
        
        // 模拟登录成功的响应
        const response = {
          data: {
            token: 'mock-token-' + Date.now(),
            user: {
              id: 1,
              username,
              role: username === 'admin' ? 'admin' : 'user',
              department: '销售部'
            }
          }
        }
        
        this.setUserData(response.data)
        return Promise.resolve(response.data)
      } catch (error) {
        return Promise.reject(error)
      }
    },
    
    async register(username, password) {
      try {
        // 实际项目中应该调用后端API
        // const response = await axios.post('/api/auth/register', { username, password })
        
        // 模拟注册成功的响应
        if (!username || !password) {
          throw new Error('用户名和密码不能为空')
        }
        
        // 模拟检查用户名是否已存在
        if (username === 'admin') {
          throw new Error('用户名已存在')
        }
        
        const response = {
          data: {
            message: '注册成功'
          }
        }
        
        return Promise.resolve(response.data)
      } catch (error) {
        return Promise.reject(error)
      }
    },
    
    async logout() {
      // 实际项目中可能需要调用登出API
      // await axios.post('/api/auth/logout')
      
      this.clearUserData()
    },
    
    setUserData(data) {
      this.token = data.token
      this.userInfo = data.user
      
      localStorage.setItem('token', data.token)
      localStorage.setItem('userInfo', JSON.stringify(data.user))
    },
    
    clearUserData() {
      this.token = ''
      this.userInfo = {}
      
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    },
    
    async updateProfile(profileData) {
      try {
        // 实际项目中应该调用后端API
        // const response = await axios.put('/api/user/profile', profileData)
        
        // 模拟更新成功的响应
        const updatedUser = { ...this.userInfo, ...profileData }
        
        this.userInfo = updatedUser
        localStorage.setItem('userInfo', JSON.stringify(updatedUser))
        
        return Promise.resolve({ message: '个人信息更新成功' })
      } catch (error) {
        return Promise.reject(error)
      }
    }
  }
})