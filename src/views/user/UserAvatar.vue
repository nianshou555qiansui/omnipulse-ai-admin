<script setup>
// ========================================================
// 个人中心：更换头像
// ========================================================
// 知识点来源：大事件笔记「个人中心项目实战 - 更换头像」章
// el-upload 选图（不自动上传）→ FileReader 转 base64 预览 → 保存到 store
// ========================================================

import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores'
import PageContainer from '@/components/PageContainer.vue'

defineOptions({ name: 'UserAvatar' })

const userStore = useUserStore()

// 当前头像（预览用，base64 或空）
const preview = ref('')

// 是否上传了图片
const hasUploaded = computed(() => !!preview.value)

// 上传组件 ref（用于点击触发选图）
const uploadRef = ref(null)
const saving = ref(false)

// 选图后：FileReader 转 base64 预览
function onSelect(file) {
  const reader = new FileReader()
  reader.onload = () => {
    preview.value = reader.result
  }
  reader.readAsDataURL(file.raw)
}

// 保存头像
async function onSave() {
  if (!preview.value) {
    ElMessage.warning('请先选择一张图片')
    return
  }
  saving.value = true
  try {
    await userStore.updateProfile({ avatar: preview.value })
    ElMessage.success('头像已更新')
  } catch (err) {
    ElMessage.error(err.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// 触发选择图片（点击头像区域就打开文件选择框）
function onPick() {
  // uploadRef.$el 是 el-upload 的根元素，找到里面的隐藏 input 并点击
  // 知识点来源：大事件笔记「选择预览图片」章
  uploadRef.value.$el.querySelector('input').click()
}
</script>

<template>
  <PageContainer title="更换头像">
    <div class="avatar-wrap">
      <!-- 点击头像触发选图 -->
      <div class="avatar-box" @click="onPick">
        <el-avatar
          :size="120"
          :src="preview || userStore.avatar || undefined"
          class="avatar-img"
        >
          {{ (preview || userStore.avatar) ? '' : (userStore.nickname.slice(0, 1)) }}
        </el-avatar>
        <div class="avatar-mask">点击更换</div>
      </div>

      <!-- 隐藏的选图上传组件 -->
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :show-file-list="false"
        accept="image/*"
        :on-change="onSelect"
        class="hidden-upload"
      />

      <div class="avatar-tip">支持 JPG / PNG，建议 1:1 方形图片</div>

      <el-button type="primary" :loading="saving" :disabled="!hasUploaded" @click="onSave">
        保存头像
      </el-button>
    </div>
  </PageContainer>
</template>

<style scoped>
.avatar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 0;
}

.avatar-box {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-img {
  background: var(--brand-primary);
  color: #fff;
  font-size: 40px;
}

.avatar-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: 50%;
}

.avatar-box:hover .avatar-mask {
  opacity: 1;
}

.avatar-tip {
  color: #94a3b8;
  font-size: 13px;
}

/* 隐藏实际的上传按钮（用点击头像代替） */
.hidden-upload {
  display: none;
}
</style>
