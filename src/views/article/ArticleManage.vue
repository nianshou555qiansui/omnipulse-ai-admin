<script setup>
// ========================================================
// 文章管理页面
// ========================================================
// 知识点来源：大事件笔记「文章管理页面」章
// 列表 + 分页 + 搜索（关键字/分类/状态筛选）+ 发布/编辑抽屉 + 删除
// ========================================================

import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getArticleList, deleteArticle } from '@/api/content'
import { getCategoryList } from '@/api/content'
import { formatTime } from '@/utils/format'
import PageContainer from '@/components/PageContainer.vue'
import ChannelSelect from './components/ChannelSelect.vue'
import ArticleEdit from './components/ArticleEdit.vue'

defineOptions({ name: 'ArticleManage' })

// ---------- 搜索条件 ----------
const query = reactive({
  keyword: '',
  cateId: '',
  state: ''
})

// ---------- 分页 ----------
const pagination = reactive({
  pagenum: 1,
  pagesize: 10,
  total: 0
})

// 列表数据 + loading
const articleList = ref([])
const loading = ref(false)

// 状态选项（用于筛选和表格展示）
const stateOptions = ['草稿', '待审核', '已发布']

// 文章编辑抽屉 ref
const articleEditRef = ref(null)

// 分类列表（用于表格里显示分类名）
const categoryList = ref([])

// 根据分类 id 找分类名
function categoryName(id) {
  return categoryList.value.find((c) => c.id === id)?.name || '未分类'
}

// 加载文章列表
async function loadArticles() {
  loading.value = true
  try {
    const result = await getArticleList({
      pagenum: pagination.pagenum,
      pagesize: pagination.pagesize,
      keyword: query.keyword,
      cateId: query.cateId,
      state: query.state
    })
    articleList.value = result.list
    pagination.total = result.total
  } finally {
    loading.value = false
  }
}

// 页面挂载后加载
onMounted(async () => {
  categoryList.value = await getCategoryList()
  loadArticles()
})

// 搜索
function onSearch() {
  pagination.pagenum = 1 // 搜索时回到第一页
  loadArticles()
}

// 重置搜索条件
function onReset() {
  query.keyword = ''
  query.cateId = ''
  query.state = ''
  onSearch()
}

// 分页切换
function onPageChange() {
  loadArticles()
}

// 新增：打开抽屉，不传 row
function onAdd() {
  articleEditRef.value.open(null)
}

// 编辑
function onEdit(row) {
  articleEditRef.value.open(row)
}

// 删除
async function onDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除文章「${row.title}」吗？`, '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }

  try {
    await deleteArticle(row.id)
    ElMessage.success('删除成功')
    // 删除后如果当前页没数据了，回退一页
    if (articleList.value.length === 1 && pagination.pagenum > 1) {
      pagination.pagenum--
    }
    loadArticles()
  } catch (err) {
    ElMessage.error(err.message || '删除失败')
  }
}
</script>

<template>
  <PageContainer title="文章管理">
    <template #extra>
      <el-button type="primary" @click="onAdd">
        <el-icon><Plus /></el-icon>发布文章
      </el-button>
    </template>

    <!-- 搜索区 -->
    <el-form inline class="search-form">
      <el-form-item label="关键字">
        <el-input
          v-model="query.keyword"
          placeholder="搜索文章标题"
          clearable
          style="width: 200px"
          @keyup.enter="onSearch"
        />
      </el-form-item>

      <el-form-item label="分类">
        <ChannelSelect v-model="query.cateId" @change="onSearch" width="160px" />
      </el-form-item>

      <el-form-item label="状态">
        <el-select v-model="query.state" placeholder="全部" clearable style="width: 140px" @change="onSearch">
          <el-option v-for="s in stateOptions" :key="s" :label="s" :value="s" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSearch">
          <el-icon><Search /></el-icon>搜索
        </el-button>
        <el-button @click="onReset">
          <el-icon><Refresh /></el-icon>重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 文章表格 -->
    <el-table :data="articleList" v-loading="loading" border>
      <el-table-column prop="title" label="标题" min-width="220" show-overflow-tooltip />
      <el-table-column label="分类" width="110">
        <template #default="{ row }">
          <el-tag size="small" effect="plain">{{ categoryName(row.cateId) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag
            size="small"
            :type="row.state === '已发布' ? 'success' : row.state === '草稿' ? 'info' : 'warning'"
          >
            {{ row.state }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="author" label="作者" width="110" />
      <el-table-column label="发布时间" width="170">
        <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="onEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>

      <template #empty>
        <el-empty description="暂无文章，点击右上角发布" />
      </template>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="pagination.pagenum"
        v-model:page-size="pagination.pagesize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="onPageChange"
        @size-change="onPageChange"
      />
    </div>

    <!-- 发布/编辑抽屉 -->
    <ArticleEdit ref="articleEditRef" @success="loadArticles" />
  </PageContainer>
</template>

<style scoped>
.search-form {
  margin-bottom: 16px;
}

.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
