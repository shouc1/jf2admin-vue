<template>
  <div class="login-container">
    <el-form :model="loginForm" @submit.prevent="handleLogin">
      <el-form-item label="用户名" prop="loginName">
        <el-input v-model="loginForm.loginName" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" v-model="loginForm.password" placeholder="请输入密码" show-password />
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="loginForm.remember">记住用户名</el-checkbox>
      </el-form-item>
      <el-form-item>
        <div class="login-button-container">
          <el-button type="primary" native-type="submit">登录</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const loginForm = reactive({
  loginName: '',
  password: '',
  remember: false
})

const handleLogin = async () => {
  try {
    const res = await userStore.login(loginForm)
    if (res.status === 200) {
      ElMessage.success('登录成功')
      router.push('/')
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('登录失败，请检查网络')
  }
}
</script>

<style scoped>
.login-container {
  width: 320px;
  margin: 100px auto;
  padding: 20px;
  border: 1px solid #333;
  border-radius: 8px;
  background-color: #2d2d2d;
}

/* 确保表单项标签宽度一致 */
.login-container :deep(.el-form-item__label) {
  width: 80px;
  color: #fff !important;
}

/* 用户名和密码输入框的内容区域设置左边距，确保对齐 */
.login-container :deep(.el-form-item:not(:last-child) .el-form-item__content) {
  margin-left: 80px !important;
}

/* 登录按钮所在的表单项内容区域不设置左边距 */
.login-container :deep(.el-form-item:last-child .el-form-item__content) {
  margin-left: 0 !important;
  display: flex;
  justify-content: center;
}

/* 登录按钮居中 */
.login-button-container {
  display: flex;
  justify-content: center;
}

/* 复选框标签颜色 */
.login-container :deep(.el-checkbox__label) {
  color: #fff !important;
}
</style>