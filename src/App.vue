<script setup>
// 根组件：包一层 Element Plus 的语言配置，让组件显示中文（如分页器的「上一页/下一页」）
// el-config-provider 是 Element Plus 的全局配置组件，笔记「中英国际化处理」章讲过
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

defineOptions({ name: 'App' })
</script>

<template>
  <el-config-provider :locale="zhCn">
    <!-- 路由出口：当前路由的组件会渲染在这里 -->
    <router-view />
  </el-config-provider>
</template>
