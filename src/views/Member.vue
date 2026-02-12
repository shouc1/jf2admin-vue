<template>
  <div class="member-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>职员列表</span>
          <div class="header-actions">
            <el-input
              v-model="searchText"
              placeholder="请输入搜索内容"
              style="width: 200px; margin-right: 10px"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon class="el-input__icon"><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </template>
      
      <!-- 成员表格 -->
      <el-table v-loading="loading" :data="filteredMemberList" style="width: 100%" @row-click="handleRowClick">
        <el-table-column prop="campusName" label="校区" width="100" sortable />
        <el-table-column prop="deptName" label="部门" width="90" sortable />
        <el-table-column prop="name" label="姓名" width="85" />
        <el-table-column prop="className" label="班级" />
        <el-table-column prop="position" label="职位" width="80" sortable/>
        <el-table-column prop="merits" label="绩效" width="80" sortable />
        <el-table-column prop="startTime" label="任职时间" width="170" sortable>
          <template #default="scope">
            {{ formatDate(scope.row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column label="离职时间" width="170">
          <template #default="scope">
            {{ formatDate(scope.row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" sortable>
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '在任中' : '已离任' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="info" @click="handleViewReport(scope.row)">查看接单记录</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 编辑对话框 -->
    <MemberEditDialog
      v-model:visible="dialogVisible"
      :member="editForm"
      :campus-list="campusList"
      :filtered-dept-list="filteredDeptList"
      :selected-row="selectedRow"
      @save="handleSave"
      @promote="handlePromote"
      @campus-change="handleCampusChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed ,watch, defineAsyncComponent} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { memberApi, deptApi, adminApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { formatDate } from '../utils/date'

// 异步加载编辑对话框组件
const MemberEditDialog = defineAsyncComponent(() => import('../components/MemberEditDialog.vue'))

const route = useRoute()
const router = useRouter()
const memberList = ref([])
const dialogVisible = ref(false)
const editForm = ref({})
const loading = ref(false)
const campusList = ref([])
const deptList = ref([])
const selectedRow = ref(null)
const searchText = ref('')

// 映射关系
const campusIdMap = ref({})
const campusNameMap = ref({})
const deptIdMap = ref({})
const deptNameMap = ref({})

// 从URL中获取memberId参数
const memberId = computed(() => {
  return route.query.memberId
})

// 过滤后的成员列表
const filteredMemberList = computed(() => {
  if (!searchText.value) {
    return memberList.value
  }
  
  const searchValue = searchText.value.toLowerCase()
  return memberList.value.filter(item => {
    return (
      item.name?.toLowerCase().includes(searchValue) ||
      item.className?.toLowerCase().includes(searchValue) ||
      item.campusName?.toLowerCase().includes(searchValue) ||
      item.deptName?.toLowerCase().includes(searchValue) ||
      item.position?.toLowerCase().includes(searchValue)
    )
  })
})

// 搜索处理函数
const handleSearch = () => {
  // 搜索逻辑已在computed中处理，这里可以添加额外的搜索逻辑
}

// 获取成员列表
onMounted(async () => {
  await fetchMemberList()
  // 加载部门和校区数据
  await getDeptCampus()
})

// 监听路由参数变化
watch(() => route.query.memberId, async () => {
  await fetchMemberList()
})

// 职位权重定义
const posPower = {
  '队长': 2,
  '部长': 3,
  '小干': 4,
  '队员': 4
}

// 获取成员列表
async function fetchMemberList() {
  loading.value = true
  try {
    let res
    if (memberId.value) {
        // 如果有memberId参数，尝试获取单个成员信息
        // 注意：这里使用memberApi.list()并在前端过滤
        // 因为当前的API配置中没有单独的获取单个成员的方法
        res = await memberApi.list()
        if (res.status === 200) {
          // 在前端过滤出指定memberId的成员
          // 使用宽松相等运算符(==)来处理类型不匹配的问题
          let data = res.data.filter(item => item.memberId == memberId.value)
          // 即使只有一个成员，也保持排序逻辑的一致性
          memberList.value = data
        }
      } else {
        // 如果没有memberId参数，获取所有成员列表
        res = await memberApi.list()
        if (res.status === 200) {
          // 按照状态、开始时间、校区、职位权重、部门、绩效的优先级进行降序排序
          const data = res.data.sort((a, b) => {
            if (a.status !== b.status) {
              return a.status > b.status ? -1 : 1
            }
            if (a.startTime !== b.startTime) {
              return a.startTime > b.startTime ? -1 : 1
            }
            if (a.campusName !== b.campusName) {
              return a.campusName > b.campusName ? -1 : 1
            }
            if (posPower[a.position] !== posPower[b.position]) {
              return posPower[a.position] > posPower[b.position] ? 1 : -1 // 职位权重排序
            }
            if (a.deptName !== b.deptName) {
              return a.deptName > b.deptName ? -1 : 1
            }
            return (b.merits || 0) > (a.merits || 0) ? -1 : 1
          })
          memberList.value = data
        }
      }
  } catch (error) {
    ElMessage.error('获取职员列表失败')
  } finally {
    loading.value = false
  }
}

// 处理表格行点击事件
const handleRowClick = async (row) => {
  selectedRow.value = row
  // 先加载部门和校区数据
  await getDeptCampus()
  // 填充表单数据
  editForm.value = {
    ...row,
    campusId: row.campusId ? row.campusId.toString() : (campusList.value.length > 0 ? campusList.value[0].id.toString() : ''),
    deptId: row.deptId ? row.deptId.toString() : '', // 确保部门ID是字符串类型
    status: row.status.toString(), // 确保状态值是字符串类型
    startTime: row.startTime ? new Date(row.startTime) : null,
    endTime: row.endTime ? new Date(row.endTime) : null
  }
  // 打开编辑对话框
  dialogVisible.value = true
}

// 处理编辑按钮点击事件
const handleEdit = async (row) => {
  await handleRowClick(row)
}

// 处理校区变化事件
const handleCampusChange = () => {
  // 重置部门选择
  editForm.value.deptId = ''
  
  console.log('校区变化:', {
    campusId: editForm.value.campusId,
    campusName: campusNameMap.value[editForm.value.campusId],
    filteredDepts: filteredDeptList.value
  })
}

// 获取部门和校区数据
async function getDeptCampus() {
  try {
    const res = await deptApi.list()
    if (res.status === 200) {
      const data = res.data
      
      // 重置映射
      campusIdMap.value = {}
      campusNameMap.value = {}
      deptIdMap.value = {}
      deptNameMap.value = {}
      campusList.value = []
      deptList.value = data
      
      // 构建映射关系
      for (const item of data) {
        // 构建校区映射
        campusIdMap.value[item.campusName] = item.campusId
        campusNameMap.value[item.campusId] = item.campusName
        
        // 构建部门映射
        if (!deptIdMap.value[item.campusName]) {
          deptIdMap.value[item.campusName] = new Map()
        }
        deptIdMap.value[item.campusName].set(item.deptName, item.deptId)
        deptNameMap.value[item.deptId] = item.deptName
      }
      
      // 构建校区列表
      const uniqueCampusList = []
      const seenCampusIds = new Set()
      for (const item of data) {
        if (!seenCampusIds.has(item.campusId)) {
          seenCampusIds.add(item.campusId)
          uniqueCampusList.push({
            id: item.campusId,
            campusName: item.campusName
          })
        }
      }
      campusList.value = uniqueCampusList
      
      console.log('部门数据加载完成:', {
        deptIdMap: deptIdMap.value,
        deptNameMap: deptNameMap.value,
        campusIdMap: campusIdMap.value,
        campusNameMap: campusNameMap.value
      })
    }
  } catch (error) {
    ElMessage.error('获取部门和校区数据失败')
    console.error('获取部门和校区数据失败:', error)
  }
}

// 过滤部门列表（根据选中的校区）
const filteredDeptList = computed(() => {
  if (!editForm.value.campusId) {
    // 如果没有选中校区，返回所有部门
    return deptList.value
  }
  
  const campusName = campusNameMap.value[editForm.value.campusId]
  if (!campusName || !deptIdMap.value[campusName]) {
    return []
  }
  
  // 根据校区名称获取部门
  const deptMap = deptIdMap.value[campusName]
  const filteredDepts = []
  
  for (const [deptName, deptId] of deptMap.entries()) {
    filteredDepts.push({
      id: deptId,
      deptName: deptName,
      campusName: campusName,
      campusId: campusIdMap.value[campusName]
    })
  }
  
  return filteredDepts
})

// 处理保存回调
const handleSave = async () => {
  await fetchMemberList()
}

// 处理提拔回调
const handlePromote = async () => {
  await fetchMemberList()
}

// 处理查看接单记录按钮点击事件
const handleViewReport = (row) => {
  // 跳转到report页面，并传递memberId参数
  router.push({
    path: '/report',
    query: {
      memberId: row.memberId
    }
  })
}


</script>

<style scoped>
.member-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}
</style>