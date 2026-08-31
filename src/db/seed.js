// ========================================================
// 预置演示数据（seed）
// ========================================================
// 首次打开项目时，如果 localStorage 里没有数据，就把这批「演示数据」写进去，
// 让页面看起来像一个真实运营中的系统。
//
// ⚠️ 重要声明：这批数据是【演示数据】，不是真实运营数据。
//  README 里也标注了这一点，避免求职时被误认为真实业绩。
// ========================================================

import { DB_KEYS, readTable, writeTable, genId } from './database'

// 预置用户：用户名 admin / 密码 admin123
const seedUsers = [
  {
    id: genId('u_'),
    username: 'admin',
    // 演示项目不存明文密码，这里存一个简单哈希（字符串转 base64 的简易版）
    // ⚠️ 仅为演示：真实项目必须用后端加密存储，绝不能这样存密码
    password: btoa('admin123'),
    nickname: '内容运营小张',
    email: 'zhang@omnipulse.com',
    avatar: ''
  }
]

// 预置分类：围绕「全媒体内容运营」的真实分类
const seedCategories = [
  { id: genId('c_'), name: '产品动态', createTime: '2026-08-01 09:00:00' },
  { id: genId('c_'), name: '运营干货', createTime: '2026-08-02 10:30:00' },
  { id: genId('c_'), name: '行业观察', createTime: '2026-08-03 14:20:00' },
  { id: genId('c_'), name: '品牌故事', createTime: '2026-08-05 16:45:00' }
]

// 预置文章：包含富文本正文（HTML）、封面、状态、所属分类、作者
const seedArticles = [
  {
    id: genId('a_'),
    title: 'OmniPulse 平台发布：一站式全媒体内容中台',
    cateId: seedCategories[0].id, // 关联「产品动态」
    state: '已发布',
    cover: '', // 封面留空，用默认图
    content:
      '<h2>为什么需要全媒体内容中台？</h2><p>企业在多平台运营时，内容分散、发布流程割裂、数据难以汇总。</p><p>OmniPulse 将内容生产、审核、分发、数据分析整合到一个工作台，让运营团队告别「复制粘贴到各平台」的重复劳动。</p><blockquote>核心价值：一次创作，多端分发，全程可追踪。</blockquote><h3>核心能力</h3><ul><li>内容资产管理：统一存储图文、封面、草稿</li><li>智能创作辅助：AI 生成标题、润色、摘要</li><li>多平台分发：一键同步主流内容平台</li></ul>',
    createTime: '2026-08-20 09:00:00',
    author: '内容运营小张'
  },
  {
    id: genId('a_'),
    title: '从 0 到 1 搭建内容运营体系：方法论与实践',
    cateId: seedCategories[1].id, // 「运营干货」
    state: '已发布',
    cover: '',
    content:
      '<h2>内容运营的本质</h2><p>内容运营不是「写文章」，而是「用内容驱动用户增长与业务转化」。</p><p>一套完整的内容体系包括：选题规划、生产流程、审核机制、发布节奏、数据复盘。</p><h3>选题的三个来源</h3><ol><li>用户反馈：社群、评论、工单里反复出现的问题</li><li>数据驱动：内容平台后台的搜索热词</li><li>竞品情报：同行高互动内容的拆解</li></ol>',
    createTime: '2026-08-18 10:00:00',
    author: '内容运营小张'
  },
  {
    id: genId('a_'),
    title: '2026 年新媒体行业趋势观察：AI 驱动的创作变革',
    cateId: seedCategories[2].id, // 「行业观察」
    state: '已发布',
    cover: '',
    content:
      '<h2>趋势一：AI 从「辅助」走向「共创」</h2><p>2026 年，AI 在内容生产中的角色已经从「打字工具」进化为「共创者」：它可以参与选题、生成初稿、提供数据支撑。</p><h2>趋势二：视频化内容进一步主流化</h2><p>短视频与中长视频的边界逐渐模糊，图文内容需要更多视频化表达。</p>',
    createTime: '2026-08-15 14:00:00',
    author: '内容运营小张'
  },
  {
    id: genId('a_'),
    title: '我们和 10 位一线运营聊了聊「内容中台的真相」',
    cateId: seedCategories[3].id, // 「品牌故事」
    state: '待审核',
    cover: '',
    content:
      '<h2>写在前面</h2><p>为了写这篇文章，我们和 10 位来自不同行业的一线内容运营聊了聊。</p><p>他们有的在电商公司，有的在 MCN 机构，有的在传统品牌。关于内容中台，大家有共识也有分歧。</p><h3>最大的共识</h3><p>「工具不重要，流程和团队才重要。」</p>',
    createTime: '2026-08-22 09:30:00',
    author: '内容运营小张'
  },
  {
    id: genId('a_'),
    title: '内容排期表怎么设计？运营新手最容易踩的 5 个坑',
    cateId: seedCategories[1].id, // 「运营干货」
    state: '草稿',
    cover: '',
    content:
      '<h2>坑一：排期表只排「发布」，不排「生产」</h2><p>很多新手排期表只有发布时间，导致内容生产严重滞后。</p>',
    createTime: '2026-08-24 11:00:00',
    author: '内容运营小张'
  }
]

// 首次启动时写入演示数据
export function initSeedData() {
  // 如果用户表已经有数据，说明初始化过了，直接返回
  if (readTable(DB_KEYS.USERS).length > 0) {
    return
  }

  writeTable(DB_KEYS.USERS, seedUsers)
  writeTable(DB_KEYS.CATEGORIES, seedCategories)
  writeTable(DB_KEYS.ARTICLES, seedArticles)
}
