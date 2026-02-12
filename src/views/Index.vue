<template>
  <div class="index-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>管理员首页</span>
        </div>
      </template>

      <div class="overview-section">
        <h3>系统总览</h3>
        <div class="stats-grid">
          <el-card class="stat-card">
            <div class="stat-content">
              <h4>本周报障</h4>
              <p class="stat-number">{{ stats.weekReport }}</p>
            </div>
          </el-card>
          <el-card class="stat-card">
            <div class="stat-content">
              <h4>本月报障</h4>
              <p class="stat-number">{{ stats.monthReport }}</p>
            </div>
          </el-card>
          <el-card class="stat-card">
            <div class="stat-content">
              <h4>已处理报障</h4>
              <p class="stat-number">{{ stats.handledReport }}</p>
            </div>
          </el-card>
          <el-card class="stat-card">
            <div class="stat-content">
              <h4>总报障</h4>
              <p class="stat-number">{{ stats.totalReport }}</p>
            </div>
          </el-card>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { adminApi, reportApi } from '../api'
import { isThisWeek, isThisMonth } from '../utils/date'

// 状态管理
const router = useRouter()
const stats = ref({
  weekReport: 0,
  monthReport: 0,
  handledReport: 0,
  totalReport: 0
})

// 生命周期
onMounted(async () => {
  await checkLoginStatus()
  await fetchReportStats()
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

async function fetchReportStats() {
  try {
    const res = await reportApi.list()
    
    if (res.status === 200) {
      const reports = res.data
      let weekReport = 0
      let monthReport = 0
      let handledReport = 0
      
      reports.forEach(report => {
        if (report.reportStatus !== '新报障') {
          handledReport++
        }
        if (isThisWeek(report.gmtCreate)) {
          weekReport++
        }
        if (isThisMonth(report.gmtCreate)) {
          monthReport++
        }
      })
      
      stats.value = {
        weekReport,
        monthReport,
        handledReport,
        totalReport: reports.length
      }
    }
  } catch (error) {
    ElMessage.error('获取报障数据失败')
  }
}

// 工具函数已从 '../utils/date' 导入
</script>

<style scoped>
.index-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.overview-section {
  margin-top: 20px;
}

.overview-section h3 {
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  transition: all 0.3s ease;
  background-color: #2d2d2d !important;
  border: 1px solid #333 !important;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.stat-content {
  text-align: center;
  padding: 20px;
}

.stat-content h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #999;
}

.stat-number {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #00ff88;
}
</style>