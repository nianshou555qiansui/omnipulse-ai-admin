// ========================================================
// Pinia 初始化 + 统一出口
// ========================================================
// 所有 store 都从 '@/stores' 统一引入，业务代码不用关心 store 文件具体在哪。
// 知识点来源：大事件笔记「配置仓库统一管理」章
// ========================================================

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// 创建 pinia 实例并注册持久化插件
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export default pinia

// 统一导出所有 store，业务代码写法：import { useUserStore } from '@/stores'
export * from './modules/user'
export * from './modules/ai'
