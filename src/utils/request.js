/**
 * HTTP请求工具类
 * 封装Axios，统一处理API请求
 */
import axios from 'axios'

// 创建axios实例
const service = axios.create({
  baseURL: '/api', // API基础URL
  timeout: 15000 // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    
    // 如果有token，添加到请求头
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 如果返回的状态码不是200，说明请求出错
    if (response.status !== 200) {
      console.error('请求失败:', res.message || '未知错误')
      
      // 401: 未登录或token过期
      if (response.status === 401) {
        // 清除本地存储的token和用户信息
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        
        // 重定向到登录页
        window.location.href = '/login'
      }
      
      return Promise.reject(new Error(res.message || '未知错误'))
    } else {
      return res
    }
  },
  error => {
    console.error('响应错误:', error)
    
    // 处理网络错误或服务器错误
    const { response } = error
    if (response && response.status) {
      switch (response.status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          window.location.href = '/login'
          break
        case 403:
          // 禁止访问
          console.error('没有权限访问该资源')
          break
        case 404:
          // 资源不存在
          console.error('请求的资源不存在')
          break
        case 500:
          // 服务器错误
          console.error('服务器错误')
          break
        default:
          console.error(`未知错误: ${response.status}`)
      }
    } else {
      // 网络错误或请求被取消
      console.error('网络错误或请求被取消')
    }
    
    return Promise.reject(error)
  }
)

export default service