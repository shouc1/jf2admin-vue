<template>
  <div class="dept-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>部门管理</span>
        </div>
      </template>

      <!-- 部门列表 -->
      <el-table
        v-loading="loading"
        :data="deptList"
        style="width: 100%"
        @row-click="handleRowClick"
      >
        <el-table-column prop="campusName" label="校区" width="100" fixed="left" />
        <el-table-column prop="deptName" label="部门名" width="90" />
        <el-table-column prop="fullName" label="部门全名" width="150" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column label="建表时间" width="170">
          <template #default="scope">
            {{ formatDate(scope.row.gmtCreate) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 部门编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="资料编辑"
      width="405px"
    >
      <el-form :model="editForm" label-width="70px" :rules="rules" ref="editFormRef">
        <el-form-item label="部门名" prop="deptName">
          <el-input v-model="editForm.deptName" placeholder="请输入部门名" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="editForm.remark" placeholder="请输入备注" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi, deptApi } from '../api'
import { formatDate } from '../utils/date'

// 状态管理
const router = useRouter()
const loading = ref(false)
const deptList = ref([])
const editDialogVisible = ref(false)
const selectedDept = ref({})
const editFormRef = ref(null)

const editForm = reactive({
  deptName: '',
  remark: ''
})

const rules = {
  deptName: [{ required: true, message: '部门名不能为空', trigger: 'blur' }],
  remark: [{ required: true, message: '备注不能为空', trigger: 'blur' }]
}

// 生命周期
onMounted(async () => {
  await checkLoginStatus()
  await fetchDeptList()
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

async function fetchDeptList() {
  loading.value = true
  try {
    const res = await deptApi.list()
    
    if (res.status === 200) {
      const data = res.data
      
      // 排序
      data.sort((a, b) => {
        if (a.campusName > b.campusName) {
          return -1
        }
        return a.campusName === b.campusName ? 0 : 1
      })
      
      deptList.value = data
    }
  } catch (error) {
    ElMessage.error('获取部门列表失败')
  } finally {
    loading.value = false
  }
}

function handleRowClick(row) {
  selectedDept.value = { ...row }
  editForm.deptName = row.deptName
  editForm.remark = row.remark
  editDialogVisible.value = true
}

async function handleSubmit() {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    
    const res = await deptApi.update(selectedDept.value.deptId, {
      name: editForm.deptName,
      remark: editForm.remark
    })
    
    if (res.status === 200) {
      ElMessage.success('修改成功')
      editDialogVisible.value = false
      
      // 更新本地数据
      const index = deptList.value.findIndex(item => item.deptId === selectedDept.value.deptId)
      if (index !== -1) {
        deptList.value[index] = {
          ...deptList.value[index],
          deptName: editForm.deptName,
          fullName: selectedDept.value.campusName + editForm.deptName,
          remark: editForm.remark
        }
      }
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    if (error.name === 'Error') {
      ElMessage.error('修改失败')
    }
  }
}
</script>

<style scoped>
.dept-container {
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