// ========================================================
// 数据服务层：模拟「数据库表」
// ========================================================
// 项目没有真实后端，用 localStorage 充当数据库。
// 这个文件封装了 localStorage 的读写，让业务代码不用直接碰 localStorage，
// 结构上模仿「数据库表」：每一张「表」对应一个 localStorage key。
//
// 约定：所有数据都以 JSON 字符串存进 localStorage，读写时做 JSON 序列化/反序列化。
// ========================================================

// 表名统一放这里管理，避免拼错字符串
export const DB_KEYS = {
  // 用户表：存注册过的用户（数组）
  USERS: 'op_users',
  // 当前登录用户 id（单独一个 key，方便读取）
  CURRENT_USER: 'op_current_user',
  // 分类表：文章分类（数组）
  CATEGORIES: 'op_categories',
  // 文章表：所有文章（数组）
  ARTICLES: 'op_articles'
}

// ---------- 通用读写方法 ----------

// 读取一张表。表里没数据时返回 defaultValue（空数组 / 空对象）
export function readTable(key, defaultValue = []) {
  const raw = localStorage.getItem(key)
  if (raw === null) {
    return defaultValue
  }
  try {
    return JSON.parse(raw)
  } catch (e) {
    // 数据损坏时兜底：返回默认值，避免整个应用崩掉
    console.error(`读取 localStorage 表 ${key} 失败，已重置`, e)
    return defaultValue
  }
}

// 写入一张表：把数据转成 JSON 字符串存进去
export function writeTable(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

// 生成一个简单唯一的 id（时间戳 + 随机数），替代真实后端的自增 id
export function genId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}
