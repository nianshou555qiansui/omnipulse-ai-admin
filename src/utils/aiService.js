// ========================================================
// AI 服务层（降级版）
// ========================================================
// 原来 nova-admin 里 AI 用的是原生 fetch + ReadableStream 流式请求（复杂、超纲）。
// 本项目按「严格知识点」原则降级为：用 axios 发一次性请求，等完整回复再显示。
// 这样代码用到的全是已学的 axios / Promise / async-await，能独立看懂。
//
// ⚠️ 说明：这里请求的是用户自己配置的「中转站」（OpenAI 兼容接口）。
//  真实生产项目应走后端转发，前端不直接带 key 调第三方。
// ========================================================

import axios from 'axios'
import { useAIStore } from '@/stores'

// 去掉 HTML 标签，只留纯文本（用于给 AI 输入文章正文）
export function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// 发送一次对话请求，拿到完整回复后调用 onDone(回复文本)。
// configOverride 用于「测试连通」时传临时配置，不污染 store。
export async function sendChat({ prompt, systemPrompt = '', configOverride = null, onDone }) {
  const aiStore = useAIStore()
  // 优先用临时配置，否则用 store 里保存的配置
  const cfg = configOverride || aiStore.config

  // 校验配置是否齐全
  if (!cfg.baseUrl || !cfg.apiKey) {
    throw new Error('请先在 AI 设置里填写中转站地址和 Key')
  }

  // 组装请求地址：中转站 baseUrl 后面接 OpenAI 兼容的 chat/completions
  // （去掉 baseUrl 末尾多余的斜杠）
  const baseUrl = cfg.baseUrl.replace(/\/+$/, '')
  const url = `${baseUrl}/v1/chat/completions`

  // 构造请求体：messages 里 systemPrompt 是角色设定，prompt 是用户消息
  const messages = []
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }
  messages.push({ role: 'user', content: prompt })

  const response = await axios.post(
    url,
    {
      model: cfg.model,
      messages,
      // 非流式：等完整回复一起返回
      stream: false
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey}`
      },
      timeout: 60000
    }
  )

  // OpenAI 兼容接口的返回结构：choices[0].message.content 是完整回复
  const text = response.data?.choices?.[0]?.message?.content || ''
  if (onDone) {
    onDone(text)
  }
  return text
}

// 从中转站拉取可用模型列表（用于 AI 设置弹窗里「获取模型」按钮）
export async function fetchModels(configOverride) {
  const cfg = configOverride
  if (!cfg.baseUrl || !cfg.apiKey) {
    throw new Error('请先填写中转站地址和 Key')
  }

  const baseUrl = cfg.baseUrl.replace(/\/+$/, '')
  const url = `${baseUrl}/v1/models`

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`
    },
    timeout: 20000
  })

  // OpenAI 兼容接口的返回结构：data 数组里每个元素有 id 字段
  const models = response.data?.data?.map((m) => m.id) || []
  if (models.length === 0) {
    throw new Error('没有获取到模型列表，请检查中转站地址')
  }
  return models
}
