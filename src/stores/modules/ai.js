// ========================================================
// AI 状态管理（Pinia store）
// ========================================================
// 管理 AI 中转站配置 + 技能工坊（预设的技能/提示词）。
// persist: true 把配置和技能都存进 localStorage。
//
// ⚠️ 安全说明：apiKey 由用户自己填写，不硬编码任何密钥。
// 演示项目 apiKey 会存进 localStorage（明文），真实项目应走后端代理，绝不暴露到前端。
// ========================================================

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAIStore = defineStore('ai', () => {
  // ---------- state ----------

  // AI 中转站配置：用户填写的 baseUrl / apiKey / model
  const config = ref({
    // 接口协议类型：openai / gemini
    endpointType: 'openai',
    // 中转站地址（示例，用户自己填）
    baseUrl: '',
    // 用户自己的 key（不硬编码，默认空）
    apiKey: '',
    // 默认模型
    model: 'gpt-4o-mini'
  })

  // 技能工坊：预设的技能列表，每个技能带 systemPrompt（给 AI 的角色设定）和预设问题
  const skills = ref([
    {
      id: 's1',
      icon: '✍️',
      name: '爆款标题生成',
      description: '根据文章内容，生成 3 个吸引点击的标题',
      systemPrompt: '你是一位资深新媒体编辑，擅长生成爆款标题。请根据用户提供的内容，生成 3 个不同的标题，每个标题一行。',
      presetPrompts: []
    },
    {
      id: 's2',
      icon: '✨',
      name: '文案润色',
      description: '把平淡的文案改得更有感染力',
      systemPrompt: '你是一位文字编辑，请润色用户提供的文案，使其更有感染力，但保持原意不变。',
      presetPrompts: []
    },
    {
      id: 's3',
      icon: '📝',
      name: '内容摘要',
      description: '把长文章压缩成 3 句话摘要',
      systemPrompt: '你是一位内容编辑，请把用户提供的文章压缩成 3 句话摘要，保留核心信息。',
      presetPrompts: []
    },
    {
      id: 's4',
      icon: '🔍',
      name: '合规审查',
      description: '检查文案是否含违规词，给出修改建议',
      systemPrompt: '你是一位内容安全审查员，请检查用户提供的文案是否存在违规内容，并给出修改建议。',
      presetPrompts: []
    }
  ])

  // ---------- actions ----------

  // 更新中转站配置
  function setConfig(newConfig) {
    config.value = { ...config.value, ...newConfig }
  }

  // 新增技能
  function addSkill(skill) {
    skills.value.push({ id: Date.now().toString(), ...skill })
  }

  // 更新技能
  function updateSkill(id, patch) {
    const idx = skills.value.findIndex((s) => s.id === id)
    if (idx !== -1) {
      skills.value[idx] = { ...skills.value[idx], ...patch }
    }
  }

  // 删除技能
  function deleteSkill(id) {
    skills.value = skills.value.filter((s) => s.id !== id)
  }

  return {
    // state
    config,
    skills,
    // actions
    setConfig,
    addSkill,
    updateSkill,
    deleteSkill
  }
}, {
  persist: true
})
