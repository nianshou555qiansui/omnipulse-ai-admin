// ========================================================
// 用户状态管理（Pinia store）
// ========================================================
// 用 Pinia 管理「当前登录用户」和「登录态」，全局共享。
// persist: true 会把 state 自动存进 localStorage，刷新页面登录态不丢。
// 知识点来源：大事件笔记「构建用户仓库和持久化」「配置仓库统一管理」章
// ========================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as userApi from '@/api/user'

export const useUserStore = defineStore('user', () => {
  // ---------- state（响应式数据） ----------

  // 当前登录用户信息（未登录时是 null）
  const user = ref(null)

  // ---------- getters（根据 state 计算出的数据） ----------

  // 是否已登录
  const isLoggedIn = computed(() => !!user.value)
  // 登录用户的昵称（用于顶栏展示）
  const nickname = computed(() => user.value?.nickname || '未登录')
  // 登录用户的头像
  const avatar = computed(() => user.value?.avatar || '')

  // ---------- actions（方法：改 state + 调接口） ----------

  // 登录：调接口，成功后把用户信息存进 state
  async function login(form) {
    const userInfo = await userApi.login(form)
    user.value = userInfo
    return userInfo
  }

  // 注册：调接口
  async function register(form) {
    return userApi.register(form)
  }

  // 拉取当前登录用户（页面刷新后恢复登录态）
  async function fetchUser() {
    const userInfo = await userApi.getCurrentUser()
    user.value = userInfo
    return userInfo
  }

  // 更新用户资料
  async function updateProfile(patch) {
    const userInfo = await userApi.updateUserProfile(patch)
    user.value = userInfo
    return userInfo
  }

  // 修改密码
  async function changePassword(form) {
    return userApi.updatePassword(form)
  }

  // 退出登录
  async function logout() {
    await userApi.logout()
    user.value = null
  }

  return {
    // state
    user,
    // getters
    isLoggedIn,
    nickname,
    avatar,
    // actions
    login,
    register,
    fetchUser,
    updateProfile,
    changePassword,
    logout
  }
}, {
  // 持久化：自动把 state 存进 localStorage，key 前缀是 user
  persist: true
})
