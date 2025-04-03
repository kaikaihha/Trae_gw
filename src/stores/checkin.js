import { defineStore } from 'pinia'
import { useUserStore } from './user'

export const useCheckinStore = defineStore('checkin', {
  state: () => ({
    checkinRecords: JSON.parse(localStorage.getItem('checkinRecords') || '[]'),
    checkinAreas: JSON.parse(localStorage.getItem('checkinAreas') || '[]'),
    locationPoints: JSON.parse(localStorage.getItem('locationPoints') || '[]'),
    infoForms: JSON.parse(localStorage.getItem('infoForms') || '[]'),
    tasks: JSON.parse(localStorage.getItem('tasks') || '[]')
  }),
  getters: {
    userCheckins: (state) => {
      const userStore = useUserStore()
      return state.checkinRecords.filter(record => record.userId === userStore.userId)
    },
    todayCheckins: (state) => {
      const today = new Date().toISOString().split('T')[0]
      return state.checkinRecords.filter(record => record.date.startsWith(today))
    },
    userTasks: (state) => {
      const userStore = useUserStore()
      return state.tasks.filter(task => 
        task.assignedTo === userStore.userId || 
        task.assignedTo === userStore.department || 
        task.assignedTo === 'all'
      )
    }
  },
  actions: {
    // 范围内打卡
    addCheckin(checkinData) {
      const userStore = useUserStore()
      const newCheckin = {
        id: Date.now().toString(),
        userId: userStore.userId,
        username: userStore.username,
        department: userStore.department,
        date: new Date().toISOString(),
        ...checkinData
      }
      
      this.checkinRecords.push(newCheckin)
      localStorage.setItem('checkinRecords', JSON.stringify(this.checkinRecords))
      return newCheckin
    },
    
    // 添加打卡区域
    addCheckinArea(areaData) {
      const newArea = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...areaData
      }
      
      this.checkinAreas.push(newArea)
      localStorage.setItem('checkinAreas', JSON.stringify(this.checkinAreas))
      return newArea
    },
    
    // 更新打卡区域
    updateCheckinArea(id, areaData) {
      const index = this.checkinAreas.findIndex(area => area.id === id)
      if (index !== -1) {
        this.checkinAreas[index] = { ...this.checkinAreas[index], ...areaData }
        localStorage.setItem('checkinAreas', JSON.stringify(this.checkinAreas))
        return this.checkinAreas[index]
      }
      return null
    },
    
    // 删除打卡区域
    deleteCheckinArea(id) {
      this.checkinAreas = this.checkinAreas.filter(area => area.id !== id)
      localStorage.setItem('checkinAreas', JSON.stringify(this.checkinAreas))
    },
    
    // 添加具体位置点
    addLocationPoint(pointData) {
      const newPoint = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...pointData
      }
      
      this.locationPoints.push(newPoint)
      localStorage.setItem('locationPoints', JSON.stringify(this.locationPoints))
      return newPoint
    },
    
    // 更新位置点
    updateLocationPoint(id, pointData) {
      const index = this.locationPoints.findIndex(point => point.id === id)
      if (index !== -1) {
        this.locationPoints[index] = { ...this.locationPoints[index], ...pointData }
        localStorage.setItem('locationPoints', JSON.stringify(this.locationPoints))
        return this.locationPoints[index]
      }
      return null
    },
    
    // 删除位置点
    deleteLocationPoint(id) {
      this.locationPoints = this.locationPoints.filter(point => point.id !== id)
      localStorage.setItem('locationPoints', JSON.stringify(this.locationPoints))
    },
    
    // 添加摸排信息
    addInfoForm(formData) {
      const userStore = useUserStore()
      const newForm = {
        id: Date.now().toString(),
        userId: userStore.userId,
        username: userStore.username,
        department: userStore.department,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...formData
      }
      
      this.infoForms.push(newForm)
      localStorage.setItem('infoForms', JSON.stringify(this.infoForms))
      return newForm
    },
    
    // 更新摸排信息
    updateInfoForm(id, formData) {
      const index = this.infoForms.findIndex(form => form.id === id)
      if (index !== -1) {
        this.infoForms[index] = { 
          ...this.infoForms[index], 
          ...formData,
          updatedAt: new Date().toISOString()
        }
        localStorage.setItem('infoForms', JSON.stringify(this.infoForms))
        return this.infoForms[index]
      }
      return null
    },
    
    // 删除摸排信息
    deleteInfoForm(id) {
      this.infoForms = this.infoForms.filter(form => form.id !== id)
      localStorage.setItem('infoForms', JSON.stringify(this.infoForms))
    },
    
    // 添加任务
    addTask(taskData) {
      const newTask = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: 'pending',
        ...taskData
      }
      
      this.tasks.push(newTask)
      localStorage.setItem('tasks', JSON.stringify(this.tasks))
      return newTask
    },
    
    // 更新任务
    updateTask(id, taskData) {
      const index = this.tasks.findIndex(task => task.id === id)
      if (index !== -1) {
        this.tasks[index] = { ...this.tasks[index], ...taskData }
        localStorage.setItem('tasks', JSON.stringify(this.tasks))
        return this.tasks[index]
      }
      return null
    },
    
    // 删除任务
    deleteTask(id) {
      this.tasks = this.tasks.filter(task => task.id !== id)
      localStorage.setItem('tasks', JSON.stringify(this.tasks))
    },
    
    // 清除所有数据（仅用于测试）
    clearAllData() {
      this.checkinRecords = []
      this.checkinAreas = []
      this.locationPoints = []
      this.infoForms = []
      this.tasks = []
      
      localStorage.removeItem('checkinRecords')
      localStorage.removeItem('checkinAreas')
      localStorage.removeItem('locationPoints')
      localStorage.removeItem('infoForms')
      localStorage.removeItem('tasks')
    }
  }
})