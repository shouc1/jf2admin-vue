<template>
  <div class="home-container">
    <!-- 侧边栏导航 -->
    <el-container>
      <el-aside width="150px" class="sidebar">
        <el-menu :default-active="$route.path" router>
          <el-menu-item index="/">
            <template #title>首页</template>
          </el-menu-item>
          <el-menu-item index="/member">
            <template #title>职员管理</template>
          </el-menu-item>
          <el-menu-item index="/dept">
            <template #title>部门管理</template>
          </el-menu-item>
          <el-menu-item index="/admin">
            <template #title>管理员管理</template>
          </el-menu-item>
          <el-menu-item index="/report">
            <template #title>报表管理</template>
          </el-menu-item>
          <el-menu-item index="/my">
            <template #title>个人中心</template>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <!-- 主内容区 -->
      <el-container>
        <el-header class="header">
          <div class="user-info">
            <span>{{ userStore.userRealName }}</span>
            <el-button link @click="handleLogout">退出登录</el-button>
          </div>
        </el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

// 检查登录状态
onMounted(async () => {
  const isValid = await userStore.checkToken()
  if (!isValid) {
    ElMessage.warning('登录已过期，请重新登录')
    router.push('/login')
  }
})

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
  ElMessage.success('退出登录成功')
}
</script>

<style scoped>
.home-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.el-container {
  height: 100%;
}

.sidebar {
  height: 100%;
  background-color: var(--secondary-color);
}

/* 侧边栏菜单样式 */
.sidebar :deep(.el-menu) {
  background-color: var(--secondary-color);
  border-right: 1px solid var(--border-color);
}

.sidebar :deep(.el-menu-item) {
  color: var(--text-color);
}

.sidebar :deep(.el-menu-item:hover) {
  background-color: var(--tertiary-color);
  color: var(--primary-color);
}

.sidebar :deep(.el-menu-item.is-active) {
  background-color: var(--tertiary-color);
  color: var(--primary-color);
}

.header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 20px;
  background-color: var(--secondary-color);
  border-bottom: 1px solid var(--border-color);
  height: 60px;
  color: var(--text-color);
}

/* 退出登录按钮样式 */
.header :deep(.el-button--link) {
  color: var(--primary-color);
}

.el-main {
  height: calc(100% - 60px);
  overflow-y: auto;
  padding: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}
</style>