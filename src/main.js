import { createApp } from 'vue'
import App from './App.vue'

// 引入全局样式（含 Element Plus 的基础样式覆盖）
import '@/assets/main.scss'

// 首次启动时写入演示数据（localStorage 为空才写）
import { initSeedData } from '@/db/seed'
initSeedData()

const app = createApp(App)

// 挂载状态管理 Pinia
// 注意：必须用 stores/index.js 里导出的 pinia 实例（它注册了持久化插件），
// 不能在这里 createPinia() 新建，否则持久化不生效
import pinia from '@/stores'
app.use(pinia)

// 挂载路由（路由表在 src/router/index.js）
import router from '@/router'
app.use(router)

// 全局注册 Element Plus 图标
// 说明：自动导入插件只处理 el-xxx 组件，不认识 @element-plus/icons-vue 里的
// 图标组件（如 <Plus />、<Search />），不注册的话图标会渲染成空标签。
import * as ElementPlusIcons from '@element-plus/icons-vue'
for (const [name, component] of Object.entries(ElementPlusIcons)) {
  app.component(name, component)
}

// 把整个应用挂载到 index.html 里的 #app 上
app.mount('#app')
