<script setup>
// ========================================================
// 文章分类页面
// ========================================================
// 表格展示分类列表，支持新增/编辑/删除。
// ========================================================

import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCategoryList, deleteCategory } from '@/api/content'
import { formatTime } from '@/utils/format'
import PageContainer from '@/components/PageContainer.vue'
import ChannelEdit from './components/ChannelEdit.vue'

defineOptions({ name: 'ArticleChannel' })

// 分类列表 + 表格 loading
const categoryList = ref([])
const loading = ref(false)

// 分类编辑弹窗的 ref（用它的 open 方法）
const channelEditRef = ref(null)

// 加载分类列表
async function loadCategories() {
  loading.value = true
  try {
    categoryList.value = await getCategoryList()
  } finally {
    loading.value = false
  }
}

// 页面挂载后加载
onMounted(loadCategories)

// 新增：打开弹窗，不传 row（新增模式）
function onAdd() {
  channelEditRef.value.open(null)
}

// 编辑：把当前行数据传给弹窗
function onEdit(row) {
  channelEditRef.value.open(row)
}

// 删除：确认后删除
async function onDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除分类「${row.name}」吗？该分类下的文章会变为未分类。`, '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }

  try {
    await deleteCategory(row.id)
    ElMessage.success('删除成功')
    loadCategories()
  } catch (err) {
    ElMessage.error(err.message || '删除失败')
  }
}
</script>

<template>
  <PageContainer title="文章分类">
    <template #extra>
      <el-button type="primary" @click="onAdd">
        <el-icon><Plus /></el-icon>新增分类
      </el-button>
    </template>

    <!-- 分类表格 -->
    <el-table :data="categoryList" v-loading="loading" border>
      <el-table-column type="index" label="序号" width="70" align="center" />
      <el-table-column prop="name" label="分类名称" min-width="200" />
      <el-table-column label="创建时间" width="200">
        <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="onEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>

      <template #empty>
        <el-empty description="还没有分类，点击右上角新增" />
      </template>
    </el-table>

    <!-- 分类编辑弹窗 -->
    <ChannelEdit ref="channelEditRef" @success="loadCategories" />
  </PageContainer>
</template>
