<template>
  <div class="admin-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>管理员管理</span>
        </div>
      </template>

      <!-- 管理员列表 -->
      <el-table
        v-loading="loading"
        :data="adminList"
        style="width: 100%"
        @row-click="handleRowClick"
      >
        <el-table-column prop="campusName" label="校区" width="100" fixed="left" />
        <el-table-column prop="deptName" label="部门名" width="90" />
        <el-table-column prop="realName" label="姓名" width="90" />
        <el-table-column prop="className" label="班级" />
        <el-table-column prop="powerName" label="权限" width="100" />
        <el-table-column label="任职时间" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column label="离任时间" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.endTime) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 管理员详情对话框 -->
    <AdminDetailDialog
      v-model:visible="detailDialogVisible"
      :admin="selectedAdmin"
      @reset="handleReset"
      @view="handleView"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '../api'
import { formatDate } from '../utils/date'

// 异步加载详情对话框组件
const AdminDetailDialog = defineAsyncComponent(() => import('../components/AdminDetailDialog.vue'))

// 状态管理
const router = useRouter()
const loading = ref(false)
const adminList = ref([])
const detailDialogVisible = ref(false)
const selectedAdmin = ref({})

// 生命周期
onMounted(async () => {
  await checkLoginStatus()
  await checkPermission()
  await fetchAdminList()
})

// 方法
async function checkLoginStatus() {
  try {
    const res = await adminApi.token()
    
    if (res.status !== 200) {
      ElMessage.warning('登录已过期，请重新登录')
      router.push('/login')
    }
  } catch (error) {
    ElMessage.error('网络错误')
    router.push('/login')
  }
}

async function checkPermission() {
  const loginInfo = JSON.parse(localStorage.getItem('loginInfo') || '{}')
  if (!loginInfo.power || loginInfo.power > 1) {
    ElMessageBox.alert('权限不足', '提示', {
      confirmButtonText: '确定',
      callback: () => {
        router.push('/index')
      }
    })
  }
}

async function fetchAdminList() {
  loading.value = true
  try {
    const res = await adminApi.list()
    
    if (res.status === 200) {
      // 处理数据
      const data = res.data
      
      // 排序
      data.sort((a, b) => {
        if (a.campusName !== b.campusName) {
          return a.campusName > b.campusName ? -1 : 1
        }
        if (a.deptName !== b.deptName) {
          return a.deptName > b.deptName ? -1 : 1
        }
        return a.gmtCreate > b.gmtCreate ? -1 : 1
      })
      
      adminList.value = data
    }
  } catch (error) {
    ElMessage.error('获取管理员列表失败')
  } finally {
    loading.value = false
  }
}

function handleRowClick(row) {
  selectedAdmin.value = { ...row }
  detailDialogVisible.value = true
}

// 处理重置回调
async function handleReset() {
  // 重置逻辑已在组件内部处理
}

// 处理查看回调
function handleView(memberId) {
  // 打开新窗口查看职员信息
  window.open(`/member?memberId=${memberId}`)
}

// 处理删除回调
async function handleDelete() {
  await fetchAdminList()
}
</script>

<style scoped>
.admin-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-table {
  margin-top: 20px;
}

.el-form {
  margin-top: 20px;
}

.el-form-item {
  margin-bottom: 15px;
}
</style>