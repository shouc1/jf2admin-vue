import { defineStore } from 'pinia'
import { adminApi } from '../api'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: JSON.parse(localStorage.getItem('loginInfo') || 'null'),
    accessToken: localStorage.getItem('accessToken') || '',
    isLoggedIn: !!localStorage.getItem('accessToken')
  }),
  
  getters: {
    // 提供用户信息的getter，方便组件使用
    userRealName: (state) => state.userInfo?.realName || '',
    userDeptName: (state) => state.userInfo?.deptFullName || ''
  },
  
  actions: {
    async login(loginData) {
      const res = await adminApi.login(loginData)
      if (res.status === 200) {
        this.userInfo = res.data
        this.accessToken = res.data.accessToken
        this.isLoggedIn = true
        this.saveToLocalStorage()
      }
      return res
    },
    
    logout() {
      adminApi.logout()
      this.userInfo = null
      this.accessToken = ''
      this.isLoggedIn = false
      this.clearLocalStorage()
    },
    
    async checkToken() {
      try {
        const res = await adminApi.token()
        if (res.status === 200) {
          // 确保用户信息已加载
          if (!this.userInfo) {
            this.loadFromLocalStorage()
          }
          return true
        }
        return false
      } catch (error) {
        this.logout()
        return false
      }
    },
    
    // 从localStorage加载数据
    loadFromLocalStorage() {
      const loginInfo = localStorage.getItem('loginInfo')
      const accessToken = localStorage.getItem('accessToken')
      
      if (loginInfo) {
        this.userInfo = JSON.parse(loginInfo)
      }
      
      if (accessToken) {
        this.accessToken = accessToken
        this.isLoggedIn = true
      }
    },
    
    // 保存数据到localStorage
    saveToLocalStorage() {
      if (this.userInfo) {
        localStorage.setItem('loginInfo', JSON.stringify(this.userInfo))
      }
      
      if (this.accessToken) {
        localStorage.setItem('accessToken', this.accessToken)
      }
    },
    
    // 清除localStorage
    clearLocalStorage() {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('loginInfo')
    },
    
    // 更新用户信息（例如修改登录名或密码后）
    updateUserInfo(newInfo) {
      this.userInfo = { ...this.userInfo, ...newInfo }
      this.saveToLocalStorage()
    }
  }
})