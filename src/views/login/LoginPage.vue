<script setup>
// ========================================================
// 登录 / 注册页
// ========================================================
// 登录和注册共用这一个页面，用 isRegister 切换。
// ========================================================

import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores'

defineOptions({ name: 'LoginPage' })

const router = useRouter()
const userStore = useUserStore()

// 是否处于「注册」模式（false = 登录）
const isRegister = ref(false)

// 表单数据：登录/注册共用一个表单，注册时才多填确认密码
const formRef = ref(null)
const form = reactive({
  username: '',
  password: '',
  repassword: ''
})

// 表单校验规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度 3~20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度 6~20 个字符', trigger: 'blur' },
    // 只能是英文、数字、常见符号：内部用 btoa() 存密码（只认 Latin-1 字符），
    // 中文或 Emoji 会直接抛错，这里提前在表单拦下并给出人话提示
    {
      validator: (rule, value, callback) => {
        // ^[\x21-\x7e]+$ = 全部是可见 ASCII 字符（不含空格）
        if (value && !/^[\x21-\x7e]+$/.test(value)) {
          callback(new Error('密码只能包含英文、数字和常见符号'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  // 确认密码只在注册时生效，用自定义校验函数判断是否和密码一致
  repassword: [
    {
      validator: (rule, value, callback) => {
        if (isRegister.value && value !== form.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 提交按钮 loading（防止重复点击）
const loading = ref(false)

// 登录或注册
async function onSubmit() {
  // 先做表单预校验，不通过就停下
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    if (isRegister.value) {
      // 注册：注册成功提示，自动切回登录模式
      await userStore.register({ username: form.username, password: form.password })
      ElMessage.success('注册成功，请登录')
      isRegister.value = false
      form.password = ''
      form.repassword = ''
    } else {
      // 登录：成功后跳去数据概览首页
      await userStore.login({ username: form.username, password: form.password })
      ElMessage.success('登录成功')
      router.push('/')
    }
  } catch (err) {
    // 接口抛出的错误信息（如「密码错误」）直接展示给用户
    ElMessage.error(err.message || '操作失败')
  } finally {
    loading.value = false
  }
}

// 切换 登录/注册 模式时，清空表单和校验状态
function switchMode() {
  isRegister.value = !isRegister.value
  formRef.value?.resetFields()
}
</script>

<template>
  <div class="login-page">
    <!-- 左侧品牌区：深色，放品牌名 + slogan + 演示账号提示 -->
    <div class="brand-side">
      <div class="brand-logo">
        <span class="logo-dot"></span>
        <span>OmniPulse</span>
      </div>
      <h1 class="brand-title">全媒体智能发布<br />运营中台</h1>
      <p class="brand-slogan">一次创作 · 多端分发 · 全程追踪</p>

      <div class="demo-hint">
        <p>👋 演示账号</p>
        <p>用户名：admin　密码：admin123</p>
      </div>
    </div>

    <!-- 右侧表单区：白底 -->
    <div class="form-side">
      <el-card class="form-card" shadow="never">
        <div class="form-tabs">
          <button
            class="tab-btn"
            :class="{ active: !isRegister }"
            @click="switchMode()"
          >
            登录
          </button>
          <button
            class="tab-btn"
            :class="{ active: isRegister }"
            @click="switchMode()"
          >
            注册
          </button>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          size="large"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名" />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              show-password
              placeholder="请输入密码"
            />
          </el-form-item>

          <el-form-item v-if="isRegister" label="确认密码" prop="repassword">
            <el-input
              v-model="form.repassword"
              type="password"
              show-password
              placeholder="请再次输入密码"
            />
          </el-form-item>

          <el-button
            type="primary"
            class="submit-btn"
            :loading="loading"
            @click="onSubmit"
          >
            {{ isRegister ? '注册' : '登录' }}
          </el-button>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  height: 100vh;
  width: 100%;
}

/* 左侧品牌区：深蓝黑背景 */
.brand-side {
  flex: 1.2;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #fff;
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 24px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* 品牌名字旁的小圆点：代表「内容流动的信号」 */
.logo-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--brand-primary);
  box-shadow: 0 0 12px rgba(37, 99, 235, 0.8);
}

.brand-title {
  font-size: 36px;
  line-height: 1.4;
  font-weight: 700;
}

.brand-slogan {
  color: #94a3b8;
  font-size: 15px;
  letter-spacing: 1px;
}

/* 演示账号提示框：半透明卡片 */
.demo-hint {
  margin-top: 24px;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  font-size: 13px;
  color: #cbd5e1;
  line-height: 1.8;
}

/* 右侧表单区 */
.form-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.form-card {
  width: 380px;
  border-radius: 12px;
}

/* 登录 / 注册 切换标签 */
.form-tabs {
  display: flex;
  margin-bottom: 28px;
  border-bottom: 1px solid #e2e8f0;
}

.tab-btn {
  flex: 1;
  padding: 12px 0;
  border: none;
  background: none;
  font-size: 16px;
  color: #94a3b8;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn.active {
  color: var(--brand-primary);
  border-bottom-color: var(--brand-primary);
  font-weight: 600;
}

.submit-btn {
  width: 100%;
  margin-top: 8px;
}
</style>
