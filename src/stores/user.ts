import { defineStore } from 'pinia'
import type { User } from '../../typings'
import { getUserInfo, LoginPassword, LoginEmail, registerUser } from '@/api/user'
import type { RegisterPayload, LoginPasswordPayload, LoginEmailPayload } from '@/api/user'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<Partial<User>>({ email: '', nickname: '', avatar: '' })
  const isLoggedIn = ref(false)

  // 获取用户信息
  const getInfo = async () => {
    try {
      const res = await getUserInfo()
      userInfo.value = res.data
      isLoggedIn.value = true
    } catch (error) {
      isLoggedIn.value = false
      throw error
    }
  }

  // 注册
  const register = async (payload: RegisterPayload) => {
    try {
      const res = await registerUser(payload)
      if (res.code === 200) {
        // 修改前：res.data.refresh_token
        // 修改后：res.data.data.refresh_token
        localStorage.setItem('refresh_token', res.data.refresh_token)
        userInfo.value = res.data.data
        isLoggedIn.value = true
        // 跳转到首页
        router.push('/')
        return true
      }
      ElMessage.error(res.message)
      return false
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '注册失败')
      return false
    }
  }

  // 密码登录
  const loginbypassword = async (payload: LoginPasswordPayload) => {
    try {
      const res = await LoginPassword(payload)
      if (res.code === 200) {
        localStorage.setItem('refresh_token', res.data.refresh_token)
        userInfo.value = res.data.data
        isLoggedIn.value = true
        // 跳转到首页
        router.push('/')
        return true
      }
      throw new Error(res.message || '登录失败')
    } catch (error) {
      throw error // 抛出错误由组件处理
    }
  }

  // 邮箱登录
  const loginbyemail = async (payload: LoginEmailPayload) => {
    try {
      const res = await LoginEmail(payload)
      if (res.code === 200) {
        // 修改前：res.data.refresh_token
        // 修改后：res.data.data.refresh_token
        localStorage.setItem('refresh_token', res.data.refresh_token)
        userInfo.value = res.data.data
        isLoggedIn.value = true
        // 跳转到首页
        router.push('/')
        return true
      }
      ElMessage.error(res.message)
      return false
    } catch (error) {
      ElMessage.error(error.response?.data?.message || '登录失败')
      return false
    }
  }

  return { userInfo, getInfo, register, loginbypassword, loginbyemail }
})
