<script setup>
// ========================================================
// 数据概览首页（工作台）
// ========================================================
// 登录后的第一个页面，用统计卡片展示运营概览。
// 数据来自 localStorage（通过 api 层读取），用 computed 计算统计值。
// 只用 Element Plus 的 el-card / el-statistic / el-progress（无第三方图表库）。
// ========================================================

import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores'
import { getArticleList, getCategoryList } from '@/api/content'
import { formatDate } from '@/utils/format'

defineOptions({ name: 'DashboardPage' })

const userStore = useUserStore()

// 统计用的原始数据
const articles = ref([])
const categories = ref([])

// 页面挂载后加载数据
onMounted(async () => {
  const [art, cate] = await Promise.all([
    getArticleList({ pagesize: 999 }),
    getCategoryList()
  ])
  articles.value = art.list
  categories.value = cate
})

// ---------- 用 computed 计算各项统计 ----------

// 文章总数
const articleCount = computed(() => articles.value.length)
// 分类总数
const categoryCount = computed(() => categories.value.length)
// 已发布数量
const publishedCount = computed(() => articles.value.filter((a) => a.state === '已发布').length)
// 草稿数量
const draftCount = computed(() => articles.value.filter((a) => a.state === '草稿').length)
// 待审核数量
const pendingCount = computed(() => articles.value.filter((a) => a.state === '待审核').length)
// 已发布占比（用于进度条）
const publishedRate = computed(() =>
  articleCount.value === 0 ? 0 : Math.round((publishedCount.value / articleCount.value) * 100)
)

// 最近发布的 5 篇文章
const recentArticles = computed(() => articles.value.slice(0, 5))

// 欢迎语：按时间段问候
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})
</script>

<template>
  <div class="page-container">
    <!-- 欢迎区 -->
    <el-card shadow="never" class="welcome-card">
      <h2>{{ greeting }}，{{ userStore.nickname }} 👋</h2>
      <p>欢迎回到 OmniPulse 运营中台，今天也要高效产出内容哦。</p>
    </el-card>

    <!-- 统计卡片区 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-info">
              <div class="stat-label">文章总数</div>
              <el-statistic :value="articleCount" />
            </div>
            <div class="stat-icon blue"><el-icon><Document /></el-icon></div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-info">
              <div class="stat-label">分类总数</div>
              <el-statistic :value="categoryCount" />
            </div>
            <div class="stat-icon purple"><el-icon><Folder /></el-icon></div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-info">
              <div class="stat-label">草稿箱</div>
              <el-statistic :value="draftCount" />
            </div>
            <div class="stat-icon amber"><el-icon><EditPen /></el-icon></div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-info">
              <div class="stat-label">待审核</div>
              <el-statistic :value="pendingCount" />
            </div>
            <div class="stat-icon gray"><el-icon><Timer /></el-icon></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 下方两栏：发布进度 + 最近文章 -->
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>发布进度</template>
          <div class="progress-wrap">
            <div class="progress-label">已发布 {{ publishedCount }} / {{ articleCount }} 篇</div>
            <el-progress
              :percentage="publishedRate"
              :stroke-width="16"
              striped
            />
            <p class="progress-tip">已发布文章占全部内容的比例</p>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card shadow="never">
          <template #header>最近发布</template>
          <el-table :data="recentArticles" style="width: 100%">
            <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.state === '已发布' ? 'success' : row.state === '草稿' ? 'info' : 'warning'" size="small">
                  {{ row.state }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="发布时间" width="150">
              <template #default="{ row }">{{ formatDate(row.createTime) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.welcome-card {
  margin-bottom: 20px;
}

.welcome-card h2 {
  font-size: 22px;
  margin-bottom: 8px;
}

.welcome-card p {
  color: #64748b;
}

.stat-row {
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-label {
  color: #64748b;
  font-size: 13px;
  margin-bottom: 6px;
}

/* 统计图标的不同颜色 */
.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
}

.stat-icon.blue { background: rgba(37, 99, 235, 0.12); color: var(--brand-primary); }
.stat-icon.purple { background: rgba(124, 58, 237, 0.12); color: var(--brand-secondary); }
.stat-icon.amber { background: rgba(245, 158, 11, 0.12); color: var(--brand-warning); }
.stat-icon.gray { background: rgba(100, 116, 139, 0.12); color: #64748b; }

.progress-wrap {
  padding: 8px 0;
}

.progress-label {
  margin-bottom: 12px;
  color: #334155;
  font-size: 14px;
}

.progress-tip {
  margin-top: 12px;
  color: #94a3b8;
  font-size: 13px;
}
</style>
