<template>
  <el-dialog v-model="dialogVisible" title="资料编辑" width="405px">
    <el-form :model="form" label-width="70px">
      <el-form-item label="姓名">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="校区">
        <el-select v-model="form.campusId" placeholder="请选择校区" @change="handleCampusChange">
          <el-option 
            v-for="campus in campusList" 
            :key="campus.id || campus.campusName" 
            :label="campus.campusName" 
            :value="campus.id ? campus.id.toString() : ''" 
          />
        </el-select>
      </el-form-item>
      <el-form-item label="部门">
        <el-select v-model="form.deptId" placeholder="请选择部门">
          <el-option 
            v-for="dept in filteredDeptList" 
            :key="dept.id || dept.deptName" 
            :label="dept.deptName" 
            :value="dept.id ? dept.id.toString() : ''" 
          />
        </el-select>
      </el-form-item>
      <el-form-item label="班级">
        <el-input v-model="form.className" placeholder="请输入班级" />
      </el-form-item>
      <el-form-item label="职位">
        <el-select v-model="form.position" placeholder="请选择职位">
          <el-option label="小干" value="小干" />
          <el-option label="部长" value="部长" />
          <el-option label="队长" value="队长" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="form.status" placeholder="请选择状态">
          <el-option label="在任中" value="1" />
          <el-option label="已离任" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="任职时间">
        <el-date-picker 
          v-model="form.startTime" 
          type="datetime" 
          placeholder="选择日期时间" 
          style="width: 100%" 
        />
      </el-form-item>
      <el-form-item label="离职时间">
        <el-date-picker 
          v-model="form.endTime" 
          type="datetime" 
          placeholder="选择日期时间" 
          style="width: 100%" 
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="success" @click="handlePromoteToAdmin">提拔为管理员</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { memberApi, adminApi } from '../api'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  member: {
    type: Object,
    default: () => ({})
  },
  campusList: {
    type: Array,
    default: () => []
  },
  filteredDeptList: {
    type: Array,
    default: () => []
  },
  selectedRow: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['update:visible', 'save', 'promote', 'campusChange'])

// 响应式数据
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const form = ref({...props.member})

// 监听member变化，更新表单数据
watch(() => props.member, (newMember) => {
  form.value = {...newMember}
}, { deep: true })

// 处理取消
const handleCancel = () => {
  dialogVisible.value = false
}

// 处理校区变化
const handleCampusChange = () => {
  form.value.deptId = ''
  emit('campusChange', form.value.campusId)
}

// 处理保存
const handleSave = async () => {
  try {
    const submitData = {
      ...form.value,
      startTime: form.value.startTime ? new Date(form.value.startTime).toISOString().slice(0, 19).replace('T', ' ') : null,
      endTime: form.value.endTime ? new Date(form.value.endTime).toISOString().slice(0, 19).replace('T', ' ') : null,
      status: parseInt(form.value.status)
    }
    
    const res = await memberApi.update(form.value.memberId, submitData)
    if (res.status === 200) {
      ElMessage.success('修改成功')
      dialogVisible.value = false
      emit('save', submitData)
    }
  } catch (error) {
    ElMessage.error('修改失败')
  }
}

// 处理提拔为管理员
const handlePromoteToAdmin = () => {
  if (!props.selectedRow) return
  
  ElMessageBox.confirm(`确定要提拔${props.selectedRow.name}为管理员吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      // 准备管理员数据
      const adminData = {
        loginName: 'adminJf' + props.selectedRow.memberId,
        password: 'adminJf' + props.selectedRow.memberId,
        memberId: props.selectedRow.memberId,
        power: 2
      }
      
      // 调用管理员创建API
      const res = await adminApi.create(adminData)
      if (res.status === 200) {
        // 显示详细的成功提示
        ElMessageBox.alert(
          `提拔成功！<br>登录名: ${adminData.loginName}<br>密码: ${adminData.password}<br>请妥善保管`,
          '提示',
          {
            confirmButtonText: '确定',
            dangerouslyUseHTMLString: true
          }
        ).then(() => {
          dialogVisible.value = false
          emit('promote', adminData)
        })
      } else {
        ElMessage.error(res.message || '提拔失败')
      }
    } catch (error) {
      ElMessage.error('提拔失败')
    }
  }).catch(() => {
    // 取消提拔
  })
}
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

/* 下拉框样式 - 更具体的选择器 */
.el-dialog :deep(.el-select) {
  background-color: var(--secondary-color) !important;
  border: 1px solid var(--border-color) !important;
}

.el-dialog :deep(.el-select__input) {
  color: var(--text-color) !important;
  background-color: var(--secondary-color) !important;
}

.el-dialog :deep(.el-select__caret) {
  color: var(--text-color) !important;
}

.el-dialog :deep(.el-select-dropdown) {
  background-color: var(--secondary-color) !important;
  border: 1px solid var(--border-color) !important;
}

.el-dialog :deep(.el-select-dropdown__item) {
  color: var(--text-color) !important;
}

.el-dialog :deep(.el-select-dropdown__item:hover) {
  background-color: var(--tertiary-color) !important;
}

.el-dialog :deep(.el-select-dropdown__item.selected) {
  background-color: var(--tertiary-color) !important;
  color: var(--primary-color) !important;
}

/* 下拉框选项框样式 - 更具体的选择器 */
.el-dialog :deep(.el-select .el-input__wrapper) {
  background-color: var(--secondary-color) !important;
  box-shadow: none !important;
  border: 1px solid var(--border-color) !important;
}

.el-dialog :deep(.el-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--primary-color) inset !important;
  border: 1px solid var(--primary-color) !important;
}

.el-dialog :deep(.el-select .el-input__inner) {
  color: var(--text-color) !important;
  background-color: var(--secondary-color) !important;
}

/* 确保所有输入框都是深色 */
.el-dialog :deep(.el-input) {
  background-color: var(--secondary-color) !important;
  border: 1px solid var(--border-color) !important;
}

.el-dialog :deep(.el-input__wrapper) {
  background-color: var(--secondary-color) !important;
  box-shadow: none !important;
  border: 1px solid var(--border-color) !important;
}

.el-dialog :deep(.el-input__inner) {
  color: var(--text-color) !important;
  background-color: var(--secondary-color) !important;
}

/* 下拉框样式 */
:deep(.el-select) {
  background-color: var(--secondary-color) !important;
  border: 1px solid var(--border-color) !important;
}

:deep(.el-select__input) {
  color: var(--text-color) !important;
  background-color: var(--secondary-color) !important;
}

:deep(.el-select__caret) {
  color: var(--text-color) !important;
}

/* 选中项样式 */
:deep(.el-select__selected-item) {
  color: var(--text-color) !important;
  background-color: var(--secondary-color) !important;
}

:deep(.el-select__placeholder) {
  color: var(--text-color) !important;
  background-color: var(--secondary-color) !important;
}

/* 下拉框包装器样式 */
:deep(.el-select__wrapper) {
  background-color: var(--secondary-color) !important;
  border: 1px solid var(--border-color) !important;
}

:deep(.el-select-dropdown) {
  background-color: var(--secondary-color) !important;
  border: 1px solid var(--border-color) !important;
}

:deep(.el-select-dropdown__item) {
  color: var(--text-color) !important;
}

:deep(.el-select-dropdown__item:hover) {
  background-color: var(--tertiary-color) !important;
}

:deep(.el-select-dropdown__item.selected) {
  background-color: var(--tertiary-color) !important;
  color: var(--primary-color) !important;
}

/* 下拉框输入框容器样式 */
:deep(.el-select .el-input) {
  background-color: var(--secondary-color) !important;
  border: 1px solid var(--border-color) !important;
}

:deep(.el-select .el-input__wrapper) {
  background-color: var(--secondary-color) !important;
  box-shadow: none !important;
  border: 1px solid var(--border-color) !important;
}

:deep(.el-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--primary-color) inset !important;
  border: 1px solid var(--primary-color) !important;
}

:deep(.el-select .el-input__inner) {
  color: var(--text-color) !important;
  background-color: var(--secondary-color) !important;
}

/* 输入框样式 */
:deep(.el-input) {
  background-color: var(--secondary-color) !important;
  border: 1px solid var(--border-color) !important;
}

:deep(.el-input__wrapper) {
  background-color: var(--secondary-color) !important;
  box-shadow: none !important;
  border: 1px solid var(--border-color) !important;
}

:deep(.el-input__inner) {
  color: var(--text-color) !important;
  background-color: var(--secondary-color) !important;
}

/* 日期选择器样式 */
:deep(.el-date-editor) {
  background-color: var(--secondary-color) !important;
  border: 1px solid var(--border-color) !important;
}

:deep(.el-date-editor__input) {
  color: var(--text-color) !important;
}

:deep(.el-date-editor__icon) {
  color: var(--text-color) !important;
}

:deep(.el-picker-panel) {
  background-color: var(--secondary-color) !important;
  border: 1px solid var(--border-color) !important;
}

:deep(.el-picker-panel__header) {
  background-color: var(--secondary-color) !important;
  border-bottom: 1px solid var(--border-color) !important;
}

:deep(.el-picker-panel__icon-btn) {
  color: var(--text-color) !important;
}

:deep(.el-picker-panel__cell) {
  color: var(--text-color) !important;
}

:deep(.el-picker-panel__cell:hover:not(.el-picker-panel__cell--disabled)) {
  background-color: var(--tertiary-color) !important;
}

:deep(.el-picker-panel__cell.el-date-table__current-day) {
  color: var(--primary-color) !important;
}

:deep(.el-picker-panel__cell.el-date-table__current-day:hover) {
  background-color: var(--tertiary-color) !important;
}

/* 按钮样式 - 恢复默认颜色 */
:deep(.el-button--primary) {
  background-color: #409EFF !important;
  border-color: #409EFF !important;
  color: #fff !important;
}

:deep(.el-button--primary:hover) {
  background-color: #66B1FF !important;
  border-color: #66B1FF !important;
}

:deep(.el-button--success) {
  background-color: #61a33f !important;
  border-color: #61a33f !important;
  color: #fff !important;
}

:deep(.el-button--success:hover) {
  background-color: #71aa54 !important;
  border-color: #71aa54 !important;
}

:deep(.el-button:not(.el-button--primary):not(.el-button--success)) {
  color: #303133 !important;
  border-color: #DCDFE6 !important;
  background-color: #fff !important;
}

:deep(.el-button:not(.el-button--primary):not(.el-button--success):hover) {
  color: #409EFF !important;
  border-color: #C6E2FF !important;
  background-color: #ECF5FF !important;
}
</style>