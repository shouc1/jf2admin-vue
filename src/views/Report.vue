<template>
  <div class="report-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>报障管理</span>
          <div class="header-actions">
            <el-input
              v-model="searchText"
              placeholder="请输入内容"
              style="width: 200px; margin-right: 10px"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon class="el-input__icon"><Search /></el-icon>
              </template>
            </el-input>
            <el-button size="small" @click="handleGetReportRecord">获取报表</el-button>
            <el-button size="small" @click="handleEditionManage">版本管理</el-button>
          </div>
        </div>
      </template>

      <!-- 报障表格 -->
      <el-table
        v-loading="loading"
        :data="filteredReportList"
        style="width: 100%"
        @row-click="handleRowClick"
        row-class-name="report-table-row"
      >
        <el-table-column prop="campusName" label="校区" width="120" fixed="left" />
        <el-table-column prop="name" label="姓名" width="90"/>
        <el-table-column prop="reportType" label="报障类型" width="129" sortable />
        <el-table-column label="描述">
          <template #default="scope">
            <div class="description-content">
              {{ scope.row.description }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="129" />
        <el-table-column prop="reportStatus" label="状态" width="128" sortable>
          <template #default="scope">
            <el-tag :type="scope.row.reportStatus === '新报障' ? 'success' : 'info'">
              {{ scope.row.reportStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reportGroupLeaderName" label="团队队长" width="129" sortable />
        <el-table-column prop="reportGroupMemberName" label="团队队员" width="110" />
        <el-table-column prop="gmtCreate" label="报障时间" width="130" sortable>
          <template #default="scope">
            {{ formatDate(scope.row.gmtCreate) }}
          </template>
        </el-table-column>
        <el-table-column prop="gmtModified" label="对接时间" width="130" sortable>
          <template #default="scope">
            {{ formatDate(scope.row.gmtModified) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 详情对话框 -->
    <ReportDetailDialog
      v-model:visible="detailDialogVisible"
      :report="selectedReport"
    />

    <!-- 版本管理对话框 -->
    <el-dialog
      v-model="editionDialogVisible"
      title="版本管理"
      width="405px"
    >
      <el-form :model="editionForm">
        <el-form-item>
          <template #label>
            <span v-html="edition1Label"></span>
          </template>
          <el-select v-model="editionForm.edition1_status" placeholder="请选择">
            <el-option label="审查版" value="0" />
            <el-option label="完整版" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <template #label>
            <span v-html="edition2Label"></span>
          </template>
          <el-select v-model="editionForm.edition2_status" placeholder="请选择">
            <el-option label="审查版" value="0" />
            <el-option label="完整版" value="1" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleApplyEdition">提交</el-button>
          <el-button type="warning" @click="handleSwapEdition">切换发行与开发版本</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 报表对话框 -->
    <el-dialog
      v-model="reportDialogVisible"
      title="接单报表"
      width="405px"
    >
      <div class="report-buttons-container">
        <el-button
          type="primary"
          @click="handleDownloadMerits"
        >
          下载绩效报表
        </el-button>
        <el-button
          type="success"
          @click="handleRecordMerits"
        >
          保存绩效记录
        </el-button>
        <el-button
          type="danger"
          @click="handleResetMerits"
        >
          重置绩效记录
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, defineAsyncComponent } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { adminApi, reportApi, editionApi, memberApi } from '../api'
import { formatDate, isToday, isThisWeek, isThisMonth } from '../utils/date'

// 异步加载详情对话框组件
const ReportDetailDialog = defineAsyncComponent(() => import('../components/ReportDetailDialog.vue'))

// 状态管理
const router = useRouter()
const route = useRoute()
const loading = ref(false)
const reportList = ref([])
const searchText = ref('')
const detailDialogVisible = ref(false)
const editionDialogVisible = ref(false)
const reportDialogVisible = ref(false)
const selectedReport = ref({})
const editionForm = ref({})
const editionList = ref([])
const memberMeritsDown = ref({})

// 从URL中获取memberId参数
const memberId = computed(() => {
  return route.query.memberId
})

// 计算属性
const filteredReportList = computed(() => {
  // 当有搜索文本时，直接在reportList上过滤
  if (searchText.value) {
    const text = searchText.value
    // 处理特殊命令
    const commands = {
      '#今天报障': 'Today',
      '#本周报障': 'ThisWeek',
      '#本月报障': 'ThisMonth'
    }
    
    if (commands[text]) {
      return reportList.value.filter(item => {
        if (commands[text] === 'Today') {
          return isToday(item.gmtCreate)
        } else if (commands[text] === 'ThisWeek') {
          return isThisWeek(item.gmtCreate)
        } else if (commands[text] === 'ThisMonth') {
          return isThisMonth(item.gmtCreate)
        }
        return false
      })
    }
    
    // 普通搜索
    const searchKeys = [
      'address', 'name', 'className', 'campusName',
      'description', 'phone', 'reportStatus', 'reportType',
      'reportGroupLeaderName', 'reportGroupMemberName', 'gmtCreate'
    ]
    
    return reportList.value.filter(item => {
      return searchKeys.some(key => {
        const value = item[key]?.toString() || ''
        return value.includes(text)
      })
    })
  }
  
  // 当没有搜索文本时，直接返回reportList
  return reportList.value
})

// 处理搜索
function handleSearch() {
  // 当搜索文本变化时，重置分页参数
  page.value = 1
  // 如果有搜索文本，重新获取数据并过滤
  if (searchText.value) {
    // 这里可以根据实际情况决定是否重新调用fetchReportList
    // 目前的实现是在computed属性中过滤，所以不需要重新调用
  }
}

const edition1Label = computed(() => {
  if (editionList.value.length < 2) return '版本一'
  const devVerStr = '<span style="color: red">开发版本</span>'
  const publishVerStr = '<span style="color: #639949">上线版本</span>'
  return `版本一 (${editionList.value[0].publish === 1 ? publishVerStr : devVerStr})`
})

const edition2Label = computed(() => {
  if (editionList.value.length < 2) return '版本二'
  const devVerStr = '<span style="color: red">开发版本</span>'
  const publishVerStr = '<span style="color: #639949">上线版本</span>'
  return `版本二 (${editionList.value[1].publish === 1 ? publishVerStr : devVerStr})`
})

// 监听路由参数变化
watch(() => route.query.memberId, async () => {
  await fetchReportList()
})

// 生命周期
onMounted(async () => {
  await checkLoginStatus()
  await fetchReportList()
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

async function fetchReportList() {
  loading.value = true
  try {
    const res = await reportApi.list()
    
    if (res.status === 200) {
      // 处理数据
      let data = res.data
      
      // 调试：打印前2条数据的结构
      console.log('Report data structure:', JSON.stringify(data.slice(0, 2), null, 2))
      
      // 如果有memberId参数，过滤出该职员参与的报障
      if (memberId.value) {
        // 先获取该职员的信息
        const memberRes = await memberApi.list()
        if (memberRes.status === 200) {
          const member = memberRes.data.find(m => m.memberId == memberId.value)
          if (member) {
            const memberName = member.name
            // 过滤出该职员参与的报障
            data = data.filter(item => {
              // 处理团队信息
              let leaderName = ''
              let memberNameList = ''
              
              if (item.reportGroup && item.reportGroup['队长']) {
                leaderName = item.reportGroup['队长'].map(m => m.name).join(' ')
              }
              
              if (item.reportGroup && item.reportGroup['队员']) {
                memberNameList = item.reportGroup['队员'].map(m => m.name).join(' ')
              }
              
              // 检查该职员是否为队长或队员
              return leaderName.includes(memberName) || memberNameList.includes(memberName)
            })
          }
        }
      }
      
      // 格式化时间和团队信息（先处理数据）
      data.forEach(item => {
        let leaderName = ''
        let memberName = ''
        
        // 从 reportGroup 提取信息
        if (item.reportGroup) {
          // 提取队长信息
          if (item.reportGroup['队长']) {
            if (Array.isArray(item.reportGroup['队长'])) {
              leaderName = item.reportGroup['队长'].map(m => m.name).join(' ')
            } else if (typeof item.reportGroup['队长'] === 'object' && item.reportGroup['队长'].name) {
              leaderName = item.reportGroup['队长'].name
            } else if (typeof item.reportGroup['队长'] === 'string') {
              leaderName = item.reportGroup['队长']
            }
          }
          
          // 提取队员信息
          if (item.reportGroup['队员']) {
            if (Array.isArray(item.reportGroup['队员'])) {
              memberName = item.reportGroup['队员'].map(m => m.name).join(' ')
            } else if (typeof item.reportGroup['队员'] === 'object' && item.reportGroup['队员'].name) {
              memberName = item.reportGroup['队员'].name
            } else if (typeof item.reportGroup['队员'] === 'string') {
              memberName = item.reportGroup['队员']
            }
          }
        }
        
        // 设置字段
        item.reportGroupLeaderName = leaderName || '空'
        item.reportGroupMemberName = memberName || '空'
      })
      
      // 按照报障时间降序排序（最新的在前）
      data.sort((a, b) => {
        if (a.gmtCreate !== b.gmtCreate) {
          return a.gmtCreate > b.gmtCreate ? -1 : 1
        }
        return 0
      })
      
      reportList.value = data
    }
  } catch (error) {
    ElMessage.error('获取报障列表失败')
  } finally {
    loading.value = false
  }
}

function handleRowClick(row) {
  selectedReport.value = { ...row }
  detailDialogVisible.value = true
}

async function handleEditionManage() {
  try {
    const res = await editionApi.list()
    
    if (res.status === 200) {
      editionList.value = res.data
      if (editionList.value.length >= 2) {
        editionForm.value = {
          edition1_status: editionList.value[0].status,
          edition2_status: editionList.value[1].status
        }
        editionDialogVisible.value = true
      } else {
        ElMessage.error('数据错误')
      }
    }
  } catch (error) {
    ElMessage.error('获取版本信息失败')
  }
}

async function handleApplyEdition() {
  try {
    const editionData = [
      { id: 1, status: editionForm.value.edition1_status },
      { id: 2, status: editionForm.value.edition2_status }
    ]
    
    const res = await editionApi.updateStatus(editionData)
    
    if (res.status === 200) {
      ElMessage.success('修改成功')
      editionDialogVisible.value = false
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('修改失败')
  }
}

async function handleSwapEdition() {
  try {
    const res = await editionApi.swapPublish()
    
    if (res.status === 200) {
      ElMessage.success('切换成功')
      editionDialogVisible.value = false
      // 重新获取版本信息
      await handleEditionManage()
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('切换失败')
  }
}

function handleGetReportRecord() {
  reportDialogVisible.value = true
}

async function handleDownloadMerits() {
  try {
    const res = await memberApi.list()
    
    if (res.status === 200) {
      const members = res.data
      let csvContent = '班级,学号,姓名,本次绩效,本次学分\n'
      
      // 清空之前的记录
      memberMeritsDown.value = {}
      
      members.forEach(member => {
        // 计算绩效
        const curMerits = parseInt(member.merits || 0)
        if (curMerits < 50) return
        
        const meritsDown = parseInt(Math.floor(curMerits / 50) * 50)
        csvContent += `${member.className},请填写,${member.name},${meritsDown},${(meritsDown / 50 * 0.2).toFixed(2)}\n`
        
        // 保存下载记录
        memberMeritsDown.value[member.memberId] = {
          merits: meritsDown,
          name: member.name
        }
      })
      
      // 下载 CSV 文件
      downloadCSV(csvContent, `绩效报表_${formatDate(new Date())}`)
    }
  } catch (error) {
    ElMessage.error('下载报表失败')
  }
}

function handleRecordMerits() {
  if (Object.keys(memberMeritsDown.value).length === 0) {
    ElMessage.warning('无需保存')
    return
  }
  
  // 保存绩效记录到本地存储
  const memberMerits = JSON.parse(localStorage.getItem('memberMerits') || '{}')
  
  // 清空之前的记录
  localStorage.removeItem('memberMerits')
  
  // 合并新记录
  for (const memberId in memberMeritsDown.value) {
    if (memberMerits[memberId]) {
      memberMerits[memberId].merits += parseInt(memberMeritsDown.value[memberId].merits)
    } else {
      memberMerits[memberId] = memberMeritsDown.value[memberId]
    }
  }
  
  // 保存到本地存储
  localStorage.setItem('memberMerits', JSON.stringify(memberMerits))
  ElMessage.success('更新成功')
}

function handleResetMerits() {
  // 清空绩效记录
  localStorage.removeItem('memberMerits')
  localStorage.removeItem('memberMeritsDown')
  memberMeritsDown.value = {}
  ElMessage.success('重置成功')
}

// 工具函数
// 日期相关函数已从 '../utils/date' 导入

function downloadCSV(content, filename) {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename + '.csv')
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
.report-container {
  padding: 20px;
}

/* 表格行样式 */
:deep(.el-table__row.report-table-row) {
  height: 30px !important;
  min-height: 30px !important;
}

/* 表格单元格样式 */
:deep(.el-table__cell) {
  padding: 6px 5px !important;
  line-height: 1.4 !important;
}

/* 调整表格头部行高 */
:deep(.el-table__header-wrapper .el-table__row) {
  height: 36px !important;
  min-height: 36px !important;
}

/* 调整表格头部单元格样式 */
:deep(.el-table__header-wrapper .el-table__cell) {
  padding: 8px 5px !important;
}

/* 描述内容样式 */
.description-content {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  max-height: 2.8em; /* 2行 */
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 报表按钮容器样式 */
.report-buttons-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

/* 使用深度选择器确保样式应用到按钮上 */
.report-buttons-container :deep(.el-button) {
  width: 100%;
  padding: 12px 0;
  text-align: center;
  margin: 0 !important;
}
</style>