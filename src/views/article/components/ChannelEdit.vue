<script setup>
// ========================================================
// 分类「新增/编辑」共用弹窗
// ========================================================
// 父组件用 ref.open(row) 打开：row 有 id = 编辑，无 id = 新增。
// 保存成功后 emit('success')，父组件刷新列表。
// ========================================================

import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { addCategory, updateCategory } from '@/api/content'

defineOptions({ name: 'ChannelEdit' })

// 弹窗显示状态
const dialogVisible = ref(false)
// 当前编辑的分类（null = 新增模式）
const editId = ref(null)

// 表单数据 + 校验规则
const formRef = ref(null)
const form = reactive({
  name: ''
})

const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 15, message: '分类名称长度 2~15 个字符', trigger: 'blur' }
  ]
}

// 提交按钮 loading
const loading = ref(false)

// 打开弹窗：父组件调用 ref.open(row)，row 是 null（新增）或 分类对象（编辑）
function open(row) {
  dialogVisible.value = true
  if (row && row.id) {
    // 编辑模式：回显已有名称
    editId.value = row.id
    form.name = row.name
  } else {
    // 新增模式：清空
    editId.value = null
    form.name = ''
  }
}

// 关闭弹窗
function onClose() {
  dialogVisible.value = false
  formRef.value?.resetFields()
}

// 保存
async function onSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    if (editId.value) {
      await updateCategory({ id: editId.value, name: form.name })
      ElMessage.success('修改成功')
    } else {
      await addCategory({ name: form.name })
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    // 通知父组件刷新列表
    emit('success')
  } catch (err) {
    ElMessage.error(err.message || '操作失败')
  } finally {
    loading.value = false
  }
}

const emit = defineEmits(['success'])

// 暴露 open 方法给父组件调用
defineExpose({ open })
</script>

<template>
  <el-dialog
    :title="editId ? '编辑分类' : '新增分类'"
    v-model="dialogVisible"
    width="420px"
    @close="onClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入分类名称" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="onSave">保存</el-button>
    </template>
  </el-dialog>
</template>
