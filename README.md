# OmniPulse 全媒体智能发布与运营中台

> 一个基于 **Vue3 + Element Plus** 的企业级后台管理系统，面向全媒体内容运营场景。
> 包含内容管理、AI 创作辅助、数据概览等完整模块。

## 技术栈

| 分类 | 技术 |
|---|---|
| 框架 | Vue 3（Composition API / `<script setup>`） |
| 构建 | Vite |
| UI | Element Plus + 图标库 |
| 状态管理 | Pinia + pinia-plugin-persistedstate（localStorage 持久化） |
| 路由 | Vue Router（hash 模式，适配静态托管） |
| 数据请求 | Axios（模拟后端接口） |
| 富文本 | @vueup/vue-quill |
| 时间处理 | dayjs |

## 功能模块

| 模块 | 说明 |
|---|---|
| 数据概览 | 统计卡片（文章/分类/草稿/待审核）、发布进度、最近发布 |
| 文章分类 | 分类的增删改查，删除时自动处理分类下文章 |
| 文章管理 | 列表、分页、搜索、筛选、发布/编辑（富文本 + 封面上传）、删除 |
| AI 工作台 | AI 对话 + 技能工坊（预设技能/自定义技能），支持中转站配置 |
| 个人中心 | 基本资料、更换头像、重置密码 |

## 快速开始

```bash
# 安装依赖
pnpm install

# 本地开发
pnpm dev

# 生产构建
pnpm build

# 本地预览构建产物
pnpm preview
```

## 演示账号

```
用户名：admin
密码：admin123
```

## 数据说明

本项目**没有真实后端**，使用 **localStorage 模拟数据库**：

- 所有业务数据（用户、分类、文章）存于浏览器 localStorage
- 首次打开自动写入**演示数据**（预置分类与文章），用于体验完整流程
- ⚠️ 这些是演示数据，非真实运营数据；仅存于本地浏览器，清除缓存会丢失
- 上传的新封面以 base64 存 localStorage，容量有限，刷新后可能丢失（预置封面不受影响）

## 目录结构

```
omnipulse-ai-admin/
├── src/
│   ├── api/              # 模拟后端接口（用户、内容）
│   ├── db/               # localStorage 数据层 + 演示数据种子
│   ├── stores/           # Pinia 状态管理（用户、AI）
│   ├── router/           # 路由 + 登录守卫
│   ├── utils/            # 工具函数（AI 服务、时间格式化）
│   ├── components/       # 通用组件（PageContainer）
│   └── views/            # 页面
│       ├── login/        # 登录/注册
│       ├── layout/       # 主布局（侧边栏 + 顶栏）
│       ├── dashboard/    # 数据概览
│       ├── article/      # 文章分类 + 文章管理
│       ├── ai/           # AI 工作台
│       └── user/         # 个人中心
└── index.html
```

## 部署

本项目已部署到 GitHub Pages（hash 路由 + 相对路径构建，静态托管刷新不 404）：

**线上地址：https://nianshou555qiansui.github.io/omnipulse-ai-admin/**

重新部署：

```bash
pnpm build
pnpm exec gh-pages -d dist --dotfiles
```

> 说明：`--dotfiles` 是必须的——构建产物里 `_plugin-vue_export-helper-*.js` 等下划线开头的文件，
> 若不带此参数会被 Jekyll 忽略导致 404（页面白屏）。仓库根目录的 `.nojekyll` 文件也用于规避此问题。

## 致谢

项目基于黑马程序员「大事件管理系统」课程知识点开发，是对课程项目的一次「换皮 + 重构」练习，用于巩固 Vue3 后台管理系统开发能力。
