<script setup>
// ========================================================
// 分类下拉选择组件（复用：文章管理搜索、文章编辑表单都用它）
// ========================================================
// 保留 defineModel() 写法（Vue 3.4+ 的 v-model 语法糖，等价于 :modelValue + emit）。
// 你已在 nova-admin 里用过它，复盘笔记里会注明它是「:modelValue + emit 的简写」。
// ========================================================

import { ref, onMounted } from 'vue'
import { getCategoryList } from '@/api/content'

defineOptions({ name: 'ChannelSelect' })

// v-model 双向绑定：父组件传进来的选中值，改这里会自动传回父组件
const model = defineModel({ type: String, default: '' })

// 可选的宽度和提示文案（父组件可传 width / placeholder 控制）
defineProps({
  width: {
    type: String,
    default: '200px'
  },
  // 默认提示「全部」（搜索场景）；表单里传「请选择分类」
  placeholder: {
    type: String,
    default: '全部'
  }
})

// 分类列表
const categoryList = ref([])

// 页面挂载后加载分类
onMounted(async () => {
  categoryList.value = await getCategoryList()
})

// 把分类 id 传出去（父组件用 @change 接收）
const emit = defineEmits(['change'])
</script>

<template>
  <el-select
    v-model="model"
    :style="{ width }"
    :placeholder="placeholder"
    clearable
    @change="(val) => emit('change', val)"
  >
    <el-option
      v-for="item in categoryList"
      :key="item.id"
      :label="item.name"
      :value="item.id"
    />
  </el-select>
</template>
