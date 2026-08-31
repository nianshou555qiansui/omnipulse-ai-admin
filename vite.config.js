import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// Vite 配置文件：管「怎么启动、怎么打包」的项目配置
export default defineConfig({
  // base 设为相对路径 './'，打包后的资源引用都是相对路径，
  // 这样部署到 GitHub Pages 的子路径（仓库名/omnipulse-ai-admin/）下也能正常加载
  base: './',
  plugins: [
    vue(),
    // 自动按需导入 Element Plus 组件和图标，不用在代码里手动 import
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ],
  resolve: {
    alias: {
      // '@' 指向 src 目录，代码里写 '@/utils/xxx' 就不写一长串相对路径
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
