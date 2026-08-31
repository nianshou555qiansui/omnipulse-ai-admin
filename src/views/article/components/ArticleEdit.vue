<script setup>
// ========================================================
// 文章「发布/编辑」抽屉
// ========================================================
// 知识点来源：大事件笔记「文章发布&修改」章
// 父组件用 ref.open(row) 打开：row 有 id = 编辑回显，无 id = 新增。
// 保存成功 emit('success')，父组件刷新列表。
// 封面处理：预置图是静态资源引用（刷新不丢）；新上传的图以 base64 存 localStorage（会占容量，提示刷新后可能丢失）。
// ========================================================

import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { getArticleDetail, addArticle, updateArticle } from '@/api/content'
import { getCurrentAuthor } from '@/api/content'
import ChannelSelect from './ChannelSelect.vue'

defineOptions({ name: 'ArticleEdit' })

// 抽屉显示状态 + 当前编辑的文章 id（null = 新增）
const drawerVisible = ref(false)
const editId = ref(null)

// 预置封面图（静态资源，刷新不丢）
const presetCovers = [
  { url: '/covers/cover1.jpg', name: '封面一' },
  { url: '/covers/cover2.jpg', name: '封面二' }
]

// 表单数据 + 校验
const formRef = ref(null)
const form = reactive({
  title: '',
  cateId: '',
  state: '草稿', // 草稿 / 待审核 / 已发布
  cover: '', // 封面图片地址（预置图路径 或 base64）
  content: '' // 富文本内容（HTML）
})

const rules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 2, max: 60, message: '标题长度 2~60 个字符', trigger: 'blur' }
  ],
  cateId: [{ required: true, message: '请选择文章分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入文章内容', trigger: 'blur' }]
}

// 富文本编辑器 ref（用于重置内容）
const editorRef = ref(null)
const loading = ref(false)

// 打开抽屉：父组件调用
async function open(row) {
  drawerVisible.value = true
  if (row && row.id) {
    // 编辑模式：拉详情回显
    editId.value = row.id
    const detail = await getArticleDetail(row.id)
    Object.assign(form, {
      title: detail.title,
      cateId: detail.cateId,
      state: detail.state,
      cover: detail.cover || '',
      content: detail.content || ''
    })
  } else {
    // 新增模式：重置表单
    editId.value = null
    Object.assign(form, {
      title: '',
      cateId: '',
      state: '草稿',
      cover: presetCovers[0].url,
      content: ''
    })
    // 清空富文本
    editorRef.value?.setHTML('')
  }
}

// 关闭抽屉
function onClose() {
  drawerVisible.value = false
  formRef.value?.resetFields()
}

// 选择预置封面
function selectPresetCover(url) {
  form.cover = url
}

// 上传新封面：el-upload 不自动上传，把选中的文件转成 base64 预览
// 知识点来源：大事件笔记「上传文件」章（FileReader 转 base64）
function onUploadCover(file) {
  // file.raw 是原始文件对象（el-upload 封装过）
  const reader = new FileReader()
  reader.onload = () => {
    form.cover = reader.result // base64 字符串
    ElMessage.warning('新上传的封面存在浏览器里，清除缓存后可能丢失')
  }
  reader.readAsDataURL(file.raw)
}

// 保存（新增/编辑）
async function onSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    if (editId.value) {
      await updateArticle(editId.value, {
        title: form.title,
        cateId: form.cateId,
        state: form.state,
        cover: form.cover,
        content: form.content
      })
      ElMessage.success('修改成功')
    } else {
      await addArticle({
        title: form.title,
        cateId: form.cateId,
        state: form.state,
        cover: form.cover,
        content: form.content,
        author: getCurrentAuthor()
      })
      ElMessage.success('发布成功')
    }
    drawerVisible.value = false
    emit('success')
  } catch (err) {
    ElMessage.error(err.message || '保存失败')
  } finally {
    loading.value = false
  }
}

const emit = defineEmits(['success'])
defineExpose({ open })
</script>

<template>
  <el-drawer
    v-model="drawerVisible"
    :title="editId ? '编辑文章' : '发布文章'"
    size="720px"
    @close="onClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="文章标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入文章标题" />
      </el-form-item>

      <el-form-item label="文章分类" prop="cateId">
        <ChannelSelect v-model="form.cateId" width="100%" placeholder="请选择分类" />
      </el-form-item>

      <el-form-item label="发布状态" prop="state">
        <el-radio-group v-model="form.state">
          <el-radio value="草稿">草稿</el-radio>
          <el-radio value="待审核">待审核</el-radio>
          <el-radio value="已发布">已发布</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="文章封面">
        <div class="cover-wrap">
          <!-- 预置封面选择 -->
          <div class="preset-covers">
            <div
              v-for="cover in presetCovers"
              :key="cover.url"
              class="cover-item"
              :class="{ active: form.cover === cover.url }"
              @click="selectPresetCover(cover.url)"
            >
              <img :src="cover.url" :alt="cover.name" />
              <span>{{ cover.name }}</span>
            </div>
          </div>

          <!-- 上传新封面 -->
          <el-upload
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*"
            :on-change="onUploadCover"
          >
            <el-button size="small">上传新封面</el-button>
          </el-upload>

          <!-- 当前选中的封面预览 -->
          <div v-if="form.cover" class="cover-preview">
            <img :src="form.cover" alt="封面预览" />
          </div>
        </div>
      </el-form-item>

      <el-form-item label="文章内容" prop="content">
        <div class="editor-wrap">
          <!-- 富文本编辑器：v-model:content 绑定 HTML 内容 -->
          <QuillEditor
            ref="editorRef"
            v-model:content="form.content"
            contentType="html"
            theme="snow"
            placeholder="请输入文章正文…"
          />
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="onSave">保存</el-button>
    </template>
  </el-drawer>
</template>

<style scoped>
.cover-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preset-covers {
  display: flex;
  gap: 12px;
}

.cover-item {
  width: 96px;
  text-align: center;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 6px;
  padding: 4px;
  transition: all 0.2s;
}

.cover-item img {
  width: 100%;
  height: 54px;
  object-fit: cover;
  border-radius: 4px;
}

.cover-item span {
  font-size: 12px;
  color: #64748b;
}

.cover-item.active {
  border-color: var(--brand-primary);
}

.cover-item.active span {
  color: var(--brand-primary);
}

.cover-preview img {
  max-width: 100%;
  max-height: 120px;
  border-radius: 4px;
}

.editor-wrap {
  width: 100%;
}

/* 富文本编辑器高度 */
.editor-wrap :deep(.ql-editor) {
  min-height: 220px;
}
</style>
