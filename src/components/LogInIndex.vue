<template>
  <div class="auth-form">
    <div class="tab-switch">
      <router-link to="/login" class="tab-item active">登录</router-link>
      <router-link to="/register" class="tab-item">注册</router-link>
    </div>

    <el-form :model="form" :rules="currentRules" class="login-form">
      <!-- 动态登录方式 -->
      <template v-if="!isSMSLogin">
        <!-- 手机号输入 -->
        <el-form-item prop="account">
          <el-input v-model="form.account" placeholder="请输入手机号或邮箱" class="phone-input">
          </el-input>
        </el-form-item>

        <!-- 密码输入 -->
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
      </template>

      <template v-else>
        <!-- 短信验证码输入 -->
        <SMSVerification verify-type="login" />
      </template>

      <!-- 登录按钮 -->
      <div class="login-buttons">
        <el-button type="primary" class="login-btn" @click="handleLogin" :loading="isLoading">
          {{ isLoading ? '登录中...' : '登录' }}
        </el-button>
        <el-button class="wechat-btn" @click="loginWithWechat">
          <el-icon><i class="iconfont icon-wechat" /></el-icon>
          微信登录
        </el-button>
      </div>

      <!-- 其他登录方式 -->
      <div class="other-options">
        <a class="login-link1" @click="toggleLoginMethod">
          {{ isSMSLogin ? '密码登录' : '短信登录' }}
        </a>
        <router-link to="/login/email-login" class="login-link2">邮箱登录</router-link>
        <router-link to="/login/forgot" class="forgot-password">忘记密码？</router-link>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts" name="LoginIndex">
import { ref, computed } from 'vue'
import SMSVerification from '@/components/common/SMSVerification.vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const router = useRouter()

const isSMSLogin = ref(false)
const form = ref({
  account: '',
  phone: '',
  password: '',
  captcha: '',
})

// 添加加载状态
const isLoading = ref(false)

// 动态验证规则
const currentRules = computed(() => {
  return isSMSLogin.value ? smsRules : passwordRules
})

const passwordRules = {
  account: [
    { required: true, message: '请输入手机号或邮箱', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (!/^(1[3-9]\d{9}|[\w-]+@[\w-]+\.\w+)$/.test(value)) {
          callback(new Error('请输入有效的手机号或邮箱'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度6-20位', trigger: 'blur' },
  ],
}

const smsRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' },
  ],
}

const toggleLoginMethod = () => {
  isSMSLogin.value = !isSMSLogin.value
  // 清空非当前登录方式的字段
  if (isSMSLogin.value) {
    form.value.password = ''
  } else {
    form.value.captcha = ''
  }
}

const handleLogin = async () => {
  try {
    isLoading.value = true
    let payload: any = {}

    if (isSMSLogin.value) {
      // 短信登录逻辑
      payload = {
        phone: form.value.phone,
        code: form.value.captcha,
        login_type: 'sms',
      }
    } else {
      // 密码登录逻辑
      payload = {
        account: form.value.account, // 根据后端接口可能需要改为phone或保持account
        password: form.value.password,
        login_type: 'password',
      }
    }

    const response = await axios.post('/api/users/login', payload, {
      withCredentials: true,
    })

    if (response.data.code === 200) {
      ElMessage.success('登录成功')
      // 存储token（根据实际返回字段调整）
      localStorage.setItem('access_token', response.data.data.token)
      // 跳转首页
      router.push('/')
    } else {
      handleLoginError(response.data)
    }
  } catch (err: any) {
    console.error('登录失败:', err)
    if (err.response?.data) {
      handleLoginError(err.response.data)
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
  } finally {
    isLoading.value = false
  }
}

// 添加错误处理函数
const handleLoginError = (data: any) => {
  const errorMap: { [key: number]: string } = {
    400: '请求参数错误',
    401: '账号或密码错误',
    403: '账号已被禁用',
    404: '用户不存在',
    429: '尝试次数过多，请稍后再试',
    500: '服务器内部错误',
  }

  ElMessage.error(data.message || errorMap[data.code] || '登录失败')
}

// 修改微信登录函数（示例）
const loginWithWechat = async () => {
  try {
    // 示例：跳转微信授权页面
    window.location.href = '/api/auth/wechat'
  } catch (err) {
    ElMessage.error('微信登录失败')
  }
}
</script>

<style scoped>
/* TAB 栏样式 */
.tab-switch {
  margin-bottom: 40px;
  text-align: center;
}

.tab-item {
  position: relative;
  display: inline-block;
  padding: 0 20px;
  font-size: 24px;
  font-weight: 700;
  color: #606266;
  text-decoration: none;
  transition: all 0.3s;
}

.tab-item.active {
  color: #3760f4;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #3760f4;
}

/* 表单整体宽度 */
.login-form {
  max-width: 400px;
  margin: 0 auto;
}

.el-form-item {
  margin-bottom: 24px;
}

.el-input {
  height: 44px;
}

/* 使用深度选择器覆盖 el-input 内部 prepend 区域样式，确保垂直居中 */
:deep(.el-input__prepend) {
  display: flex;
  align-items: center;
  padding: 0;
}

/* 登录按钮样式 */
.login-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 30px;
  font-size: 16px;
}

.login-btn {
  background-color: #3760f4;
  font-size: 16px;
  height: 45.6px;
}

.wechat-btn {
  width: 100%;
  font-size: 16px;
  border-radius: 6px;
  height: 45.6px;
  margin: 0 !important;
}

/* 其他登录方式 */
.other-options {
  margin-top: 25px;
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.login-link1 {
  cursor: pointer;
  color: #3760f4;
  margin-right: 30px;
}

.login-link2 {
  margin-right: auto; /* 占据剩余空间 */
}

.forgot-password {
  margin-left: auto; /* 推到最右侧 */
}

.other-options a {
  color: #3760f4;
  text-decoration: none;
}

/* 微信图标样式 */
.iconfont {
  font-family: 'iconfont' !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-wechat:before {
  content: '\e65c';
}

/* 移除 Element Plus 默认按钮间距 */
:deep(.el-button + .el-button) {
  margin-left: 0;
}
</style>
