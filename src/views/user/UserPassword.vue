<script setup>
// ========================================================
// 个人中心：重置密码
// ========================================================
// 知识点来源：大事件笔记「个人中心项目实战 - 重置密码」章
// 三个密码框，自定义校验：新密码≠原密码、确认密码=新密码
// 修改成功后退出登录，跳回登录页。
// ========================================================

import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores'
import PageContainer from '@/components/PageContainer.vue'

defineOptions({ name: 'UserPassword' })

const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const form = reactive({
  oldPassword: '',
  newPassword: '',
  repassword: ''
})

// 校验规则（自定义 validator）
const rules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度 6~20 个字符', trigger: 'blur' },
    // 新密码不能和原密码一样
    {
      validator: (rule, value, callback) => {
        if (value && value === form.oldPassword) {
          callback(new Error('新密码不能与原密码相同'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  repassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value && value !== form.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const loading = ref(false)

// 修改密码
async function onChangePassword() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await userStore.changePassword({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword
    })
    ElMessage.success('密码修改成功，请重新登录')
    // 修改密码后退出登录，回登录页
    await userStore.logout()
    router.push('/login')
  } catch (err) {
    ElMessage.error(err.message || '修改失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <PageContainer title="重置密码">
    <div class="password-wrap">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="90px"
        style="max-width: 480px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="form.oldPassword"
            type="password"
            show-password
            placeholder="请输入原密码"
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="form.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码（6~20位）"
          />
        </el-form-item>

        <el-form-item label="确认新密码" prop="repassword">
          <el-input
            v-model="form.repassword"
            type="password"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="onChangePassword">
            修改密码
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </PageContainer>
</template>

<style scoped>
.password-wrap {
  padding: 8px 0;
}
</style>
