<script setup>
// ========================================================
// AI 工作台：AI 对话 + 技能工坊
// ========================================================
// 降级版说明：原来用 fetch + 流式打字机（超纲），这里用 axios 一次性请求，
// 拿到完整回复再显示。技能工坊用 Pinia 管理，可增删改。
// ========================================================

import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAIStore } from '@/stores'
import { sendChat } from '@/utils/aiService'
import AISettingsDialog from './components/AISettingsDialog.vue'

defineOptions({ name: 'AIAssistant' })

const aiStore = useAIStore()

// ========== 1. 对话区状态 ==========

// 当前选中的技能
const activeSkill = ref(null)

// 消息列表：{ role: 'user' | 'assistant', content: string }
const messageList = ref([])

// 发送中（loading）
const sending = ref(false)

// 输入框内容
const inputText = ref('')

// AI 设置弹窗 ref
const settingsRef = ref(null)

// 消息区滚动到最底部（新消息出现时）
const chatBodyRef = ref(null)

// ========== 2. 技能工坊状态 ==========

// 技能编辑弹窗显示状态
const skillDialogVisible = ref(false)

// 正在编辑的技能（null = 新增）
const editingSkill = ref(null)

// 技能表单数据
const skillForm = reactive({
  name: '',
  description: '',
  systemPrompt: ''
})

// 消息区滚动到最底部（新消息出现时）
function scrollToBottom() {
  nextTick(() => {
    if (chatBodyRef.value) {
      chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
    }
  })
}

// 选中技能
function onSelectSkill(skill) {
  activeSkill.value = skill
}

// 发送消息
async function onSend() {
  const text = inputText.value.trim()
  if (!text) return

  // 把用户消息加进列表
  messageList.value.push({ role: 'user', content: text })
  inputText.value = ''
  scrollToBottom()

  // 校验 AI 配置，没配就弹设置
  if (!aiStore.config.baseUrl || !aiStore.config.apiKey) {
    ElMessage.warning('请先在 AI 设置里填写中转站地址和 Key')
    settingsRef.value.open()
    return
  }

  sending.value = true
  // 先加一条空的 assistant 消息，拿到结果后填进去
  messageList.value.push({ role: 'assistant', content: '' })
  scrollToBottom()

  try {
    await sendChat({
      prompt: text,
      // 选中的技能带 systemPrompt（角色设定）
      systemPrompt: activeSkill.value?.systemPrompt || '',
      onDone: (reply) => {
        // 把最后一条 assistant 消息替换成完整回复
        messageList.value[messageList.value.length - 1].content = reply
      }
    })
  } catch (err) {
    ElMessage.error(err.message || '请求失败')
    // 失败时给一条提示消息
    messageList.value[messageList.value.length - 1].content = '（请求失败：' + (err.message || '未知错误') + '）'
  } finally {
    sending.value = false
    scrollToBottom()
  }
}

// 点击预设问题（技能工坊里配置了 presetPrompts 时）
function onUsePreset(preset) {
  inputText.value = preset
  onSend()
}

// ---------- 技能工坊 CRUD ----------

// 打开新增技能
function onAddSkill() {
  editingSkill.value = null
  skillForm.name = ''
  skillForm.description = ''
  skillForm.systemPrompt = ''
  skillDialogVisible.value = true
}

// 打开编辑技能
function onEditSkill(skill) {
  editingSkill.value = skill
  skillForm.name = skill.name
  skillForm.description = skill.description
  skillForm.systemPrompt = skill.systemPrompt
  skillDialogVisible.value = true
}

// 保存技能
function onSaveSkill() {
  if (!skillForm.name) {
    ElMessage.warning('请输入技能名称')
    return
  }
  if (editingSkill.value) {
    aiStore.updateSkill(editingSkill.value.id, { ...skillForm })
  } else {
    aiStore.addSkill({ ...skillForm })
  }
  skillDialogVisible.value = false
  ElMessage.success('保存成功')
}

// 删除技能
async function onDeleteSkill(skill) {
  try {
    await ElMessageBox.confirm(`确定删除技能「${skill.name}」吗？`, '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }
  aiStore.deleteSkill(skill.id)
  // 如果删的是当前选中的，清空选中
  if (activeSkill.value?.id === skill.id) {
    activeSkill.value = null
  }
  ElMessage.success('已删除')
}

// 清空对话
function onClearChat() {
  messageList.value = []
}
</script>

<template>
  <div class="ai-page">
    <!-- 左栏：技能工坊 -->
    <div class="skill-panel">
      <div class="panel-header">
        <span>技能工坊</span>
        <el-button size="small" type="primary" text @click="onAddSkill">
          <el-icon><Plus /></el-icon>新增
        </el-button>
      </div>

      <div class="skill-list">
        <div
          v-for="skill in aiStore.skills"
          :key="skill.id"
          class="skill-item"
          :class="{ active: activeSkill?.id === skill.id }"
          @click="onSelectSkill(skill)"
        >
          <div class="skill-name">
            <span class="skill-icon">{{ skill.icon }}</span>
            {{ skill.name }}
          </div>
          <div class="skill-desc">{{ skill.description }}</div>
          <div class="skill-actions">
            <el-button link size="small" type="primary" @click.stop="onEditSkill(skill)">编辑</el-button>
            <el-button link size="small" type="danger" @click.stop="onDeleteSkill(skill)">删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 右栏：对话区 -->
    <div class="chat-panel">
      <div class="panel-header">
        <span>AI 助手</span>
        <div class="panel-actions">
          <el-button size="small" text @click="onClearChat">清空对话</el-button>
          <el-button size="small" text type="primary" @click="settingsRef.open()">
            <el-icon><Setting /></el-icon>AI 设置
          </el-button>
        </div>
      </div>

      <!-- 消息区 -->
      <div ref="chatBodyRef" class="chat-body">
        <div v-if="messageList.length === 0" class="chat-empty">
          <div class="empty-icon">💬</div>
          <p>和 OmniPulse AI 聊聊</p>
          <p class="empty-tip">选择一个技能，或直接输入内容让 AI 帮你创作</p>
        </div>

        <div
          v-for="(msg, i) in messageList"
          :key="i"
          class="msg"
          :class="msg.role"
        >
          <div class="msg-avatar">
            {{ msg.role === 'user' ? '👤' : '🤖' }}
          </div>
          <div class="msg-bubble">
            <div v-if="msg.content" class="msg-text">{{ msg.content }}</div>
            <div v-else class="msg-loading">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区 -->
      <div class="chat-input">
        <!-- 选中技能提示 -->
        <div v-if="activeSkill" class="active-skill-tip">
          当前技能：{{ activeSkill.name }}（{{ activeSkill.systemPrompt }}）
        </div>

        <el-input
          v-model="inputText"
          type="textarea"
          :rows="3"
          placeholder="输入内容，或选个技能让 AI 帮你创作…"
          @keydown.enter.exact.prevent="onSend"
        />
        <div class="input-actions">
          <el-button type="primary" :loading="sending" @click="onSend">
            发送
          </el-button>
        </div>
      </div>
    </div>

    <!-- 技能编辑弹窗 -->
    <el-dialog
      v-model="skillDialogVisible"
      :title="editingSkill ? '编辑技能' : '新增技能'"
      width="520px"
    >
      <el-form label-width="90px">
        <el-form-item label="技能名称">
          <el-input v-model="skillForm.name" placeholder="如：爆款标题生成" />
        </el-form-item>
        <el-form-item label="技能描述">
          <el-input v-model="skillForm.description" placeholder="一句话说明这个技能做什么" />
        </el-form-item>
        <el-form-item label="角色设定">
          <el-input
            v-model="skillForm.systemPrompt"
            type="textarea"
            :rows="4"
            placeholder="告诉 AI 它扮演什么角色、怎么回答（systemPrompt）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="skillDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSaveSkill">保存</el-button>
      </template>
    </el-dialog>

    <!-- AI 设置弹窗 -->
    <AISettingsDialog ref="settingsRef" />
  </div>
</template>

<style scoped>
.ai-page {
  display: flex;
  gap: 16px;
  height: calc(100vh - 140px);
}

/* 左栏技能 */
.skill-panel {
  width: 260px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  margin-bottom: 12px;
}

.skill-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skill-item {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.skill-item:hover {
  border-color: var(--brand-primary);
}

.skill-item.active {
  border-color: var(--brand-primary);
  background: rgba(37, 99, 235, 0.06);
}

.skill-name {
  font-weight: 600;
  font-size: 14px;
}

.skill-icon {
  margin-right: 6px;
}

.skill-desc {
  color: #64748b;
  font-size: 12px;
  margin: 6px 0;
}

.skill-actions {
  text-align: right;
}

/* 右栏对话 */
.chat-panel {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 16px;
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 0;
}

.chat-empty {
  margin: auto;
  text-align: center;
  color: #94a3b8;
}

.empty-icon {
  font-size: 42px;
  margin-bottom: 8px;
}

.empty-tip {
  font-size: 13px;
}

/* 消息气泡 */
.msg {
  display: flex;
  gap: 10px;
  max-width: 85%;
}

.msg.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.msg.user .msg-avatar {
  background: rgba(37, 99, 235, 0.12);
}

.msg-bubble {
  padding: 10px 14px;
  border-radius: 10px;
  background: #f1f5f9;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.msg.user .msg-bubble {
  background: var(--brand-primary);
  color: #fff;
}

/* 加载动画（三个小圆点） */
.msg-loading {
  display: flex;
  gap: 4px;
  padding: 4px 2px;
}

.msg-loading span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #94a3b8;
  animation: blink 1.2s infinite;
}

.msg-loading span:nth-child(2) { animation-delay: 0.2s; }
.msg-loading span:nth-child(3) { animation-delay: 0.4s; }

@keyframes blink {
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
}

/* 输入区 */
.chat-input {
  border-top: 1px solid #e2e8f0;
  padding-top: 12px;
}

.active-skill-tip {
  font-size: 12px;
  color: var(--brand-primary);
  background: rgba(37, 99, 235, 0.06);
  border-radius: 6px;
  padding: 6px 10px;
  margin-bottom: 8px;
}

.input-actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}
</style>
