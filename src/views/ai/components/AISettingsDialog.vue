<script setup>
// ========================================================
// AI 设置弹窗：配置中转站地址 / Key / 模型
// ========================================================
// 被 AI 工作台复用。用户填自己的中转站配置，不硬编码任何密钥。
// 知识点来源：axios + Pinia + Element Plus 表单（已学）
// ========================================================

import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useAIStore } from '@/stores'
import { sendChat, fetchModels } from '@/utils/aiService'

defineOptions({ name: 'AISettingsDialog' })

const aiStore = useAIStore()

// 弹窗显示状态
const dialogVisible = ref(false)

// 表单数据（打开时从 store 拷贝，保存时才写回 store）
const formRef = ref(null)
const form = reactive({
  endpointType: 'openai',
  baseUrl: '',
  apiKey: '',
  model: ''
})

// 拉取到的模型列表
const modelOptions = ref([])
const fetchingModels = ref(false)

// 打开弹窗
function open() {
  // 用 store 里的配置回填表单
  Object.assign(form, {
    endpointType: aiStore.config.endpointType,
    baseUrl: aiStore.config.baseUrl,
    apiKey: aiStore.config.apiKey,
    model: aiStore.config.model
  })
  dialogVisible.value = true
}

// 拉取可用模型
async function onFetchModels() {
  // 校验必填项
  if (!form.baseUrl || !form.apiKey) {
    ElMessage.warning('请先填写中转站地址和 Key')
    return
  }

  fetchingModels.value = true
  try {
    modelOptions.value = await fetchModels({ baseUrl: form.baseUrl, apiKey: form.apiKey, model: '' })
    // 默认选中第一个模型
    if (modelOptions.value.length > 0) {
      form.model = modelOptions.value[0]
    }
    ElMessage.success(`获取到 ${modelOptions.value.length} 个模型`)
  } catch (err) {
    ElMessage.error(err.message || '获取模型失败')
  } finally {
    fetchingModels.value = false
  }
}

// 测试连通性：发一条最简单的消息
async function onTestConnection() {
  if (!form.baseUrl || !form.apiKey) {
    ElMessage.warning('请先填写中转站地址和 Key')
    return
  }
  try {
    await sendChat({
      prompt: '请只回复两个字：正常',
      configOverride: { ...form }
    })
    ElMessage.success('连接成功，配置可用')
  } catch (err) {
    ElMessage.error(err.message || '连接失败')
  }
}

// 保存配置到 store（会自动持久化）
function onSave() {
  aiStore.setConfig({
    endpointType: form.endpointType,
    baseUrl: form.baseUrl,
    apiKey: form.apiKey,
    model: form.model
  })
  dialogVisible.value = false
  ElMessage.success('配置已保存')
}

defineExpose({ open })
</script>

<template>
  <el-dialog v-model="dialogVisible" title="AI 设置" width="520px">
    <el-form label-width="90px">
      <el-form-item label="协议类型">
        <el-radio-group v-model="form.endpointType">
          <el-radio value="openai">OpenAI 兼容</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="中转站地址">
        <el-input v-model="form.baseUrl" placeholder="https://api.example.com" />
      </el-form-item>

      <el-form-item label="API Key">
        <el-input
          v-model="form.apiKey"
          type="password"
          show-password
          placeholder="sk-xxxx"
        />
      </el-form-item>

      <el-form-item label="模型">
        <div class="model-row">
          <el-select v-model="form.model" placeholder="选择或输入模型" filterable allow-create style="flex: 1">
            <el-option v-for="m in modelOptions" :key="m" :label="m" :value="m" />
          </el-select>
          <el-button :loading="fetchingModels" @click="onFetchModels">获取模型</el-button>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="onTestConnection">测试连接</el-button>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="onSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.model-row {
  display: flex;
  gap: 8px;
  width: 100%;
}
</style>
