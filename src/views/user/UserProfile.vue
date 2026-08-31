<script setup>
// ========================================================
// 个人中心：基本资料
// ========================================================
// 知识点来源：大事件笔记「个人中心项目实战 - 基本资料」章
// 展示并编辑昵称 / 邮箱，保存后同步到 store（顶栏头像昵称跟着变）。
// ========================================================

import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores'
import PageContainer from '@/components/PageContainer.vue'

defineOptions({ name: 'UserProfile' })

const userStore = useUserStore()

// 表单数据（初始值从 store 取）
const formRef = ref(null)
const form = reactive({
  username: userStore.user?.username || '',
  nickname: userStore.user?.nickname || '',
  email: userStore.user?.email || ''
})

// 用户名不可改（演示项目简化）
// 校验昵称和邮箱
const rules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 12, message: '昵称长度 2~12 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}

const loading = ref(false)

// 保存资料
async function onSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await userStore.updateProfile({
      nickname: form.nickname,
      email: form.email
    })
    ElMessage.success('保存成功')
  } catch (err) {
    ElMessage.error(err.message || '保存失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <PageContainer title="基本资料">
    <div class="profile-wrap">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        style="max-width: 480px"
      >
        <el-form-item label="用户名">
          <el-input :model-value="form.username" disabled />
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="onSave">保存</el-button>
        </el-form-item>
      </el-form>
    </div>
  </PageContainer>
</template>

<style scoped>
.profile-wrap {
  padding: 8px 0;
}
</style>
