<script setup>
// ========================================================
// 主布局：登录后所有页面的「壳」
// ========================================================
// 深色侧边栏 + 顶栏 + 内容区三块结构。
// 知识点来源：大事件笔记「首页 layout 架子 [element-plus 菜单]」章
// ========================================================

import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores'

defineOptions({ name: 'LayoutContainer' })

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 侧边栏菜单数据：index 是跳转的路由路径
const menus = [
  { index: '/dashboard', icon: 'Odometer', title: '数据概览' },
  { index: '/article/channel', icon: 'Folder', title: '文章分类' },
  { index: '/article/manage', icon: 'Document', title: '文章管理' },
  { index: '/ai/assistant', icon: 'MagicStick', title: 'AI 工作台' },
  { index: '/user/profile', icon: 'User', title: '个人中心' }
]

// 当前用户昵称和头像（从 store 取）
const nickname = computed(() => userStore.nickname)
const avatar = computed(() => userStore.avatar)

// 页面挂载后拉取最新用户信息（比如头像更新后同步顶栏）
onMounted(() => {
  userStore.fetchUser().catch(() => {})
})

// 顶栏下拉菜单：退出登录
async function onCommand(command) {
  if (command !== 'logout') return
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '退出',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    // 用户点了取消，什么都不做
    return
  }
  await userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<template>
  <el-container class="layout">
    <!-- 侧边栏 -->
    <el-aside width="220px" class="sidebar">
      <!-- 品牌区 -->
      <div class="sidebar-logo">
        <span class="logo-dot"></span>
        <span>OmniPulse</span>
      </div>

      <!-- 菜单：router 模式点击自动跳转 -->
      <el-menu
        class="sidebar-menu"
        background-color="#0f172a"
        text-color="#cbd5e1"
        active-text-color="#2563eb"
        :default-active="route.path"
        router
      >
        <el-menu-item v-for="menu in menus" :key="menu.index" :index="menu.index">
          <el-icon><component :is="menu.icon" /></el-icon>
          <span>{{ menu.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 顶栏 -->
      <el-header class="header">
        <div class="header-title">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>OmniPulse</el-breadcrumb-item>
            <el-breadcrumb-item>{{ menus.find((m) => m.index === route.path)?.title || '' }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <!-- 用户区：下拉菜单 -->
        <el-dropdown @command="onCommand">
          <div class="user-area">
            <el-avatar :size="34" :src="avatar || undefined" class="user-avatar">
              {{ avatar ? '' : nickname.slice(0, 1) }}
            </el-avatar>
            <span class="user-name">{{ nickname }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile" @click="router.push('/user/profile')">基本资料</el-dropdown-item>
              <el-dropdown-item command="password" @click="router.push('/user/password')">重置密码</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>

      <!-- 内容区：当前路由页面渲染在这 -->
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout {
  height: 100vh;
}

/* 侧边栏：深蓝黑 */
.sidebar {
  background-color: #0f172a;
  display: flex;
  flex-direction: column;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.logo-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--brand-primary);
  box-shadow: 0 0 10px rgba(37, 99, 235, 0.8);
}

/* 去掉 el-menu 默认右边框 */
.sidebar-menu {
  border-right: none;
  flex: 1;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: rgba(37, 99, 235, 0.15);
}

/* 顶栏 */
.header {
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.user-avatar {
  background: var(--brand-primary);
  color: #fff;
  font-weight: 600;
}

.user-name {
  font-size: 14px;
  color: #334155;
}

/* 内容区 */
.main {
  background-color: var(--bg-page);
  padding: 20px;
  overflow-y: auto;
}
</style>
