// ========================================================
// 路由配置 + 登录守卫
// ========================================================
// 知识点来源：大事件笔记「VueRouter4 路由代码解析」「首页整体路由设计」「登录访问拦截」章
// 用 hash 模式（带 # 的地址），静态托管刷新不 404，免服务端配置。
// ========================================================

import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/stores'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      // 登录页：独立于主布局之外
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/LoginPage.vue')
    },
    {
      // 主布局：登录后所有页面都在这个布局下
      path: '/',
      name: 'layout',
      component: () => import('@/views/layout/LayoutContainer.vue'),
      redirect: '/dashboard',
      children: [
        {
          // 数据概览首页
          path: '/dashboard',
          name: 'dashboard',
          component: () => import('@/views/dashboard/DashboardPage.vue')
        },
        {
          // 文章分类
          path: '/article/channel',
          name: 'article-channel',
          component: () => import('@/views/article/ArticleChannel.vue')
        },
        {
          // 文章管理
          path: '/article/manage',
          name: 'article-manage',
          component: () => import('@/views/article/ArticleManage.vue')
        },
        {
          // AI 工作台
          path: '/ai/assistant',
          name: 'ai-assistant',
          component: () => import('@/views/ai/AIAssistant.vue')
        },
        {
          // 个人中心：基本资料
          path: '/user/profile',
          name: 'user-profile',
          component: () => import('@/views/user/UserProfile.vue')
        },
        {
          // 个人中心：更换头像
          path: '/user/avatar',
          name: 'user-avatar',
          component: () => import('@/views/user/UserAvatar.vue')
        },
        {
          // 个人中心：重置密码
          path: '/user/password',
          name: 'user-password',
          component: () => import('@/views/user/UserPassword.vue')
        }
      ]
    }
  ]
})

// 全局前置守卫：没登录就跳去登录页
// 知识点来源：大事件笔记「登录访问拦截」章
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isLoggedIn = !!userStore.user

  if (!isLoggedIn && to.path !== '/login') {
    // 没登录，去登录页
    next('/login')
  } else if (isLoggedIn && to.path === '/login') {
    // 已登录还访问登录页，回首页
    next('/')
  } else {
    next()
  }
})

export default router
