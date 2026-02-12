<template>
  <div class="my-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>个人中心</span>
        </div>
      </template>

      <div class="user-info">
        <div class="avatar-section">
          <img src="/img/avatar.jpg" alt="头像" class="avatar">
        </div>
        <div class="name-section">
          <h1>{{ userStore.userRealName }}</h1>
          <p class="dept-name">{{ userStore.userDeptName }}</p>
        </div>
      </div>

      <div class="form-section">
        <!-- 修改登录名表单 -->
        <el-form :model="loginNameForm" label-width="80px">
          <el-form-item label="登录名">
            <el-input v-model="loginNameForm.loginName" placeholder="请输入新登录名" />
            <el-button type="primary" @click="handleUpdateLoginName">修改登录名</el-button>
          </el-form-item>
        </el-form>

        <!-- 修改密码表单 -->
        <el-form :model="passwordForm" label-width="80px">
          <el-form-item label="旧密码">
            <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入旧密码" show-password />
          </el-form-item>
          <el-form-item label="新密码">
            <el-input v-model="passwordForm.password" type="password" placeholder="请输入新密码" show-password />
          </el-form-item>
          <el-form-item label="确认密码">
            <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请确认新密码" show-password />
            <el-button type="primary" @click="handleUpdatePassword">修改密码</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '../api'

// 状态管理
const router = useRouter()
const userStore = useUserStore()
const loginNameForm = ref({ loginName: '' })
const passwordForm = ref({ oldPassword: '', password: '', confirmPassword: '' })

// 生命周期
onMounted(async () => {
  await checkLoginStatus()
  loadUserInfo()
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

function loadUserInfo() {
  // 从store加载用户信息
  if (userStore.userInfo) {
    loginNameForm.value.loginName = userStore.userInfo.loginName || ''
  }
}

async function handleUpdateLoginName() {
  if (!loginNameForm.value.loginName) {
    ElMessage.warning('登录名不能为空')
    return
  }

  try {
    const res = await adminApi.updateLoginName(userStore.userInfo.adminId, {
      loginName: loginNameForm.value.loginName
    })

    if (res.status === 200) {
      ElMessageBox.alert(res.message, '提示', {
        confirmButtonText: '确定',
        callback: () => {
          // 清空登录信息并跳转到登录页
          clearLoginInfo()
          router.push('/login')
        }
      })
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('修改登录名失败')
  }
}

async function handleUpdatePassword() {
  if (!passwordForm.value.oldPassword || !passwordForm.value.password) {
    ElMessage.warning('旧密码和新密码不能为空')
    return
  }

  if (passwordForm.value.password !== passwordForm.value.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }

  try {
    const res = await adminApi.updatePassword(userStore.userInfo.adminId, {
      oldPassword: passwordForm.value.oldPassword,
      password: passwordForm.value.password
    })

    if (res.status === 200) {
      ElMessageBox.alert(res.message, '提示', {
        confirmButtonText: '确定',
        callback: () => {
          // 清空登录信息并跳转到登录页
          clearLoginInfo()
          router.push('/login')
        }
      })
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('修改密码失败')
  }
}

function clearLoginInfo() {
  userStore.logout()
}
</script>

<style scoped>
.my-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}

.avatar-section {
  margin-bottom: 20px;
}

.avatar {
  width: 250px;
  height: 250px;
  border-radius: 50%;
  object-fit: cover;
}

.name-section {
  text-align: center;
}

.name-section h1 {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: bold;
}

.dept-name {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.form-section {
  border-top: 1px solid #eee;
  padding-top: 30px;
}

.el-form {
  margin-bottom: 40px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-input {
  width: 300px;
  margin-right: 10px;
}
</style>