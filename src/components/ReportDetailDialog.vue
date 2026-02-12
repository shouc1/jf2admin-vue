<template>
  <el-dialog v-model="dialogVisible" title="查看详情" width="408px">
    <el-form :model="selectedReport" label-width="70px">
      <el-form-item label="姓名">
        <el-input v-model="selectedReport.name" readonly />
      </el-form-item>
      <el-form-item label="校区">
        <el-input v-model="selectedReport.campusName" readonly />
      </el-form-item>
      <el-form-item label="地址">
        <el-input v-model="selectedReport.address" readonly />
      </el-form-item>
      <el-form-item label="描述">
        <el-input
          v-model="selectedReport.description"
          type="textarea"
          readonly
        />
      </el-form-item>
      <el-form-item label="报障时间">
        <el-input :value="formatDate(selectedReport.gmtCreate)" readonly />
      </el-form-item>
      <el-form-item label="对接时间">
        <el-input
          :value="selectedReport.reportGroupLeaderName === '空' ? '未对接' : formatDate(selectedReport.gmtModified)"
          readonly
        />
      </el-form-item>
      <el-form-item label="团队队长">
        <el-input v-model="selectedReport.reportGroupLeaderName" readonly />
      </el-form-item>
      <el-form-item label="团队队员">
        <el-input v-model="selectedReport.reportGroupMemberName" readonly />
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { formatDate } from '../utils/date'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  report: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['update:visible'])

// 响应式数据
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const selectedReport = ref({...props.report})

// 监听report变化，更新数据
watch(() => props.report, (newReport) => {
  selectedReport.value = {...newReport}
}, { deep: true })
</script>

<style scoped>
/* 深色主题样式 */
:deep(.el-dialog) {
  background-color: var(--tertiary-color) !important;
  border: 1px solid var(--border-color) !important;
}

:deep(.el-dialog__title) {
  color: var(--text-color) !important;
}

:deep(.el-form-item__label) {
  color: var(--text-color) !important;
}

/* 输入框样式 */
:deep(.el-input) {
  background-color: var(--secondary-color) !important;
  border: 1px solid var(--border-color) !important;
}

:deep(.el-input__inner) {
  color: var(--text-color) !important;
  background-color: var(--secondary-color) !important;
}

/* 文本域样式 */
:deep(.el-textarea) {
  background-color: var(--secondary-color) !important;
  border: 1px solid var(--border-color) !important;
}

:deep(.el-textarea__inner) {
  color: var(--text-color) !important;
  background-color: var(--secondary-color) !important;
}
</style>