// ========================================================
// 部署脚本：一键打包并推送到 GitHub Pages
// ========================================================
// 用法：pnpm run deploy
// 流程：① 先执行生产构建（vite build 输出到 dist）
//       ② 用 gh-pages 把 dist 推送到 gh-pages 分支（线上地址的部署源）
//
// 关键参数 dotfiles: true —— 构建产物里有下划线开头的文件
// （如 _plugin-vue_export-helper-*.js），gh-pages 默认不上传这类文件，
// 但 GitHub Pages 的 Jekyll 也会忽略它们，不传会白屏（已踩坑修复过）。
// ========================================================

import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { publish } from 'gh-pages'

const __dirname = dirname(fileURLToPath(import.meta.url))
// 项目根目录（scripts 的上一级）
const root = join(__dirname, '..')

// 把 gh-pages 的回调风格 API 包装成 Promise，方便用 await 等它跑完
function publishDist() {
  return new Promise((resolve, reject) => {
    publish(
      join(root, 'dist'),
      {
        branch: 'gh-pages', // 部署分支（源码在 main，产物在 gh-pages）
        dotfiles: true, // 必须：下划线开头的文件也要上传，否则线上 404
        message: 'deploy: 更新构建产物'
      },
      (err) => (err ? reject(err) : resolve())
    )
  })
}

async function main() {
  // 第一步：生产构建
  console.log('==> 开始构建（pnpm build）...')
  // Windows 下 pnpm 是 pnpm.cmd，spawnSync 默认不解析 .cmd，
  // 用 shell: true 交给系统 shell 执行（跨平台都兼容）
  const build = spawnSync('pnpm', ['build'], { stdio: 'inherit', cwd: root, shell: true })
  if (build.status !== 0) {
    console.error('构建失败，已终止部署')
    process.exit(1)
  }

  // 第二步：推送 dist 到 gh-pages 分支
  console.log('==> 构建成功，推送到 GitHub Pages...')
  try {
    await publishDist()
  } catch (err) {
    console.error('部署失败：', err.message || err)
    process.exit(1)
  }

  console.log('✅ 部署完成')
  console.log('线上地址：https://nianshou555qiansui.github.io/omnipulse-ai-admin/')
}

main()
