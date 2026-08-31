// ========================================================
// 用户接口（模拟后端）
// ========================================================
// 真实项目里这里是 axios 调后端接口（如 大事件 里的 /api/login），
// 本项目没有后端，改用 localStorage 模拟，但接口签名保持「返回 Promise」，
// 这样业务代码写的 await 调用方式，将来接真后端时不用改业务逻辑。
// ========================================================

import { DB_KEYS, readTable, writeTable, genId } from '@/db/database'

// 模拟网络延迟，让 loading 效果真实一点
function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 注册：用户名已存在则报错，否则存入用户表
export async function register({ username, password, nickname, email }) {
  await delay()

  const users = readTable(DB_KEYS.USERS)
  // 判断用户名是否已被占用
  const existed = users.find((u) => u.username === username)
  if (existed) {
    throw new Error('用户名已被占用，请换个名字')
  }

  const newUser = {
    id: genId('u_'),
    username,
    // ⚠️ 演示项目：密码只做简易编码，真实项目绝不能在客户端这样存密码
    password: btoa(password),
    nickname: nickname || username,
    email: email || '',
    avatar: ''
  }
  users.push(newUser)
  writeTable(DB_KEYS.USERS, users)

  return { message: '注册成功' }
}

// 登录：校验用户名密码，成功后返回用户信息
export async function login({ username, password }) {
  await delay()

  const users = readTable(DB_KEYS.USERS)
  const user = users.find((u) => u.username === username)
  if (!user) {
    throw new Error('用户名不存在')
  }
  if (user.password !== btoa(password)) {
    throw new Error('密码错误')
  }

  // 记录当前登录用户 id
  writeTable(DB_KEYS.CURRENT_USER, user.id)

  // 返回用户信息（不返回密码字段）
  const { password: _pw, ...safeUser } = user
  return safeUser
}

// 获取当前登录用户信息
export async function getCurrentUser() {
  await delay(100)
  const currentId = readTable(DB_KEYS.CURRENT_USER, null)
  if (!currentId) {
    return null
  }
  const users = readTable(DB_KEYS.USERS)
  const user = users.find((u) => u.id === currentId) || null
  if (!user) {
    return null
  }
  const { password: _pw, ...safeUser } = user
  return safeUser
}

// 更新用户资料（昵称 / 邮箱 / 头像）
export async function updateUserProfile(patch) {
  await delay()
  const currentId = readTable(DB_KEYS.CURRENT_USER, null)
  const users = readTable(DB_KEYS.USERS)
  const idx = users.findIndex((u) => u.id === currentId)
  if (idx === -1) {
    throw new Error('用户不存在')
  }

  // 合并新资料到原用户对象上
  users[idx] = { ...users[idx], ...patch }
  writeTable(DB_KEYS.USERS, users)

  const { password: _pw, ...safeUser } = users[idx]
  return safeUser
}

// 修改密码：校验原密码，更新为新密码
export async function updatePassword({ oldPassword, newPassword }) {
  await delay()
  const currentId = readTable(DB_KEYS.CURRENT_USER, null)
  const users = readTable(DB_KEYS.USERS)
  const idx = users.findIndex((u) => u.id === currentId)
  if (idx === -1) {
    throw new Error('用户不存在')
  }
  if (users[idx].password !== btoa(oldPassword)) {
    throw new Error('原密码错误')
  }

  users[idx].password = btoa(newPassword)
  writeTable(DB_KEYS.USERS, users)
  return { message: '密码修改成功' }
}

// 退出登录：清除当前登录用户
export async function logout() {
  await delay(100)
  localStorage.removeItem(DB_KEYS.CURRENT_USER)
  return { message: '已退出登录' }
}
