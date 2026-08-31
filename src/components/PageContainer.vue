<script setup>
// ========================================================
// 通用页面容器：给每个页面提供统一的「标题 + 内容区」白底卡片
// ========================================================
// 知识点来源：大事件笔记「基本架子 - PageContainer」章
// title：页面标题；#extra 具名插槽放右上角按钮；默认插槽放正文内容
// ========================================================

defineProps({
  title: {
    type: String,
    default: ''
  }
})

defineOptions({ name: 'PageContainer' })
</script>

<template>
  <el-card shadow="never" class="page-container-card">
    <template #header>
      <div class="card-header">
        <span class="card-title">{{ title }}</span>
        <!-- 右上角：放「新增」等操作按钮 -->
        <div class="card-extra">
          <slot name="extra" />
        </div>
      </div>
    </template>

    <!-- 正文内容区 -->
    <slot />
  </el-card>
</template>

<style scoped>
.page-container-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}
</style>
