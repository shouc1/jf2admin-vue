<template>
  <el-dialog v-model="dialogVisible" title="资料编辑" width="405px">
    <el-form :model="selectedAdmin" label-width="70px">
      <el-form-item label="姓名">
        <el-input v-model="selectedAdmin.realName" readonly />
      </el-form-item>
      <el-form-item label="校区">
        <el-input v-model="selectedAdmin.campusName" readonly />
      </el-form-item>
      <el-form-item label="班级">
        <el-input v-model="selectedAdmin.className" readonly />
      </el-form-item>
      <el-form-item label="部门">
        <el-input v-model="selectedAdmin.deptName" readonly />
      </el-form-item>
      <el-form-item label="权限">
        <el-input v-model="selectedAdmin.powerName" readonly />
      </el-form-item>
      <el-form-item label="任职时间">
        <el-input :value="formatDate(selectedAdmin.startTime)" readonly />
      </el-form-item>
      <el-form-item label="离任时间">
        <el-input :value="formatDate(selectedAdmin.endTime)" readonly />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" style="width: 100%" @click="handleResetAdmin">重置登录名和密码</el-button>
      </el-form-item>
      <el-form-item>
        <el-button style="width: 100%" @click="handleViewAdmin">查看职员信息</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="danger" style="width: 100%" @click="handleDeleteAdmin">删除管理员</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '../api'
import { formatDate } from '../utils/date'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  admin: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['update:visible', 'reset', 'view', 'delete'])

// 响应式数据
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const selectedAdmin = ref({...props.admin})

// 监听admin变化，更新数据
watch(() => props.admin, (newAdmin) => {
  selectedAdmin.value = {...newAdmin}
}, { deep: true })

// 处理重置密码
const handleResetAdmin = async () => {
  ElMessageBox.confirm('您确定要重置吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await adminApi.reset(selectedAdmin.value.id)
      
      if (res.status === 200) {
        const { loginName, password } = res.data
        ElMessageBox.alert(`重置成功!<br>登录名: ${loginName}<br>密码: ${password}<br>请妥善保管`, '提示')
        emit('reset', selectedAdmin.value.id)
      } else {
        ElMessage.error(res.message)
      }
    } catch (error) {
      ElMessage.error('重置失败')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 处理查看职员信息
const handleViewAdmin = () => {
  if (selectedAdmin.value.memberId) {
    emit('view', selectedAdmin.value.memberId)
  } else {
    ElMessage.warning('无职员信息')
  }
}

// 处理删除管理员
const handleDeleteAdmin = async () => {
  ElMessageBox.confirm('您确定要删除吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(async () => {
    try {
      const res = await adminApi.delete(selectedAdmin.value.id)
      
      if (res.status === 200) {
        ElMessage.success('删除成功')
        dialogVisible.value = false
        emit('delete', selectedAdmin.value.id)
      } else {
        ElMessage.error(res.message)
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 取消操作
  })
}
</script>