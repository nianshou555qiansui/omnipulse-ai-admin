// ========================================================
// 内容接口（模拟后端）：分类 + 文章
// ========================================================
// 同上，用 localStorage 模拟后端，接口返回 Promise。
// 分类和文章是「一对多」关系：一篇文章属于一个分类（cateId 关联分类 id）。
// ========================================================

import { DB_KEYS, readTable, writeTable, genId } from '@/db/database'

function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---------------- 分类相关 ----------------

// 获取全部分类（按创建时间倒序，新的在前）
export async function getCategoryList() {
  await delay()
  const list = readTable(DB_KEYS.CATEGORIES)
  return list.slice().sort((a, b) => b.createTime.localeCompare(a.createTime))
}

// 新增分类
export async function addCategory({ name }) {
  await delay()
  const list = readTable(DB_KEYS.CATEGORIES)

  // 分类名不能重复
  const existed = list.find((c) => c.name === name)
  if (existed) {
    throw new Error('分类名称已存在')
  }

  const newCategory = {
    id: genId('c_'),
    name,
    createTime: now()
  }
  list.push(newCategory)
  writeTable(DB_KEYS.CATEGORIES, list)
  return newCategory
}

// 编辑分类
export async function updateCategory({ id, name }) {
  await delay()
  const list = readTable(DB_KEYS.CATEGORIES)
  const idx = list.findIndex((c) => c.id === id)
  if (idx === -1) {
    throw new Error('分类不存在')
  }
  // 名称查重（排除自己）
  const existed = list.find((c) => c.name === name && c.id !== id)
  if (existed) {
    throw new Error('分类名称已存在')
  }

  list[idx].name = name
  writeTable(DB_KEYS.CATEGORIES, list)
  return list[idx]
}

// 删除分类（同时把属于它的文章移到「未分类」，避免留下悬空数据）
export async function deleteCategory(id) {
  await delay()
  const list = readTable(DB_KEYS.CATEGORIES)
  const next = list.filter((c) => c.id !== id)
  writeTable(DB_KEYS.CATEGORIES, next)

  // 把该分类下的文章的 cateId 置空
  const articles = readTable(DB_KEYS.ARTICLES)
  const nextArticles = articles.map((a) =>
    a.cateId === id ? { ...a, cateId: '' } : a
  )
  writeTable(DB_KEYS.ARTICLES, nextArticles)

  return { message: '删除成功' }
}

// ---------------- 文章相关 ----------------

// 文章列表（支持分页 + 关键字搜索 + 分类筛选 + 状态筛选）
export async function getArticleList({ pagenum = 1, pagesize = 10, keyword = '', cateId = '', state = '' } = {}) {
  await delay()

  let list = readTable(DB_KEYS.ARTICLES)

  // 关键字搜索：标题包含关键字（忽略大小写）
  if (keyword) {
    list = list.filter((a) => a.title.toLowerCase().includes(keyword.toLowerCase()))
  }
  // 分类筛选
  if (cateId) {
    list = list.filter((a) => a.cateId === cateId)
  }
  // 状态筛选
  if (state) {
    list = list.filter((a) => a.state === state)
  }

  // 按创建时间倒序
  list = list.slice().sort((a, b) => b.createTime.localeCompare(a.createTime))

  // 分页
  const total = list.length
  const start = (pagenum - 1) * pagesize
  const pageList = list.slice(start, start + pagesize)

  return { total, list: pageList }
}

// 获取单篇文章详情
export async function getArticleDetail(id) {
  await delay(100)
  const list = readTable(DB_KEYS.ARTICLES)
  return list.find((a) => a.id === id) || null
}

// 新增文章
export async function addArticle(articleData) {
  await delay()
  const list = readTable(DB_KEYS.ARTICLES)
  const article = {
    id: genId('a_'),
    ...articleData,
    createTime: now(),
    author: articleData.author || '内容运营'
  }
  list.push(article)
  writeTable(DB_KEYS.ARTICLES, list)
  return article
}

// 编辑文章
export async function updateArticle(id, patch) {
  await delay()
  const list = readTable(DB_KEYS.ARTICLES)
  const idx = list.findIndex((a) => a.id === id)
  if (idx === -1) {
    throw new Error('文章不存在')
  }
  list[idx] = { ...list[idx], ...patch }
  writeTable(DB_KEYS.ARTICLES, list)
  return list[idx]
}

// 删除文章
export async function deleteArticle(id) {
  await delay()
  const list = readTable(DB_KEYS.ARTICLES)
  const next = list.filter((a) => a.id !== id)
  writeTable(DB_KEYS.ARTICLES, next)
  return { message: '删除成功' }
}

// 获取当前登录用户信息，供文章作者字段用
// （从 localStorage 里读，供组件直接调用）
export function getCurrentAuthor() {
  const users = readTable(DB_KEYS.USERS)
  const currentId = readTable(DB_KEYS.CURRENT_USER, null)
  const user = users.find((u) => u.id === currentId)
  return user ? user.nickname : '内容运营'
}

// 当前时间格式：YYYY-MM-DD HH:mm:ss
function now() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
