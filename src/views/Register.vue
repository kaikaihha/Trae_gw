<template>
  <div class="register-container" :class="{ 'is-mobile': isMobile }">
    <div class="register-box">
      <h2 class="title">商铺走访填报系统</h2>
      
      <!-- 移动端表单 -->
      <template v-if="isMobile">
        <van-form @submit="handleSubmit">
          <van-cell-group inset>
            <van-field
              v-model="formData.username"
              name="username"
              label="用户名"
              placeholder="请输入用户名"
              :rules="[{ required: true, message: '请输入用户名' }]"
            />
            <van-field
              v-model="formData.password"
              type="password"
              name="password"
              label="密码"
              placeholder="请输入密码"
              :rules="[{ required: true, message: '请输入密码' }]"
            />
            <van-field
              v-model="formData.confirmPassword"
              type="password"
              name="confirmPassword"
              label="确认密码"
              placeholder="请再次输入密码"
              :rules="[{ required: true, message: '请再次输入密码' }]"
            />
          </van-cell-group>
          <div style="margin: 16px">
            <van-button round block type="primary" native-type="submit" :loading="loading">
              注册
            </van-button>
            <van-button round block plain type="primary" to="/login" style="margin-top: 10px">
              返回登录
            </van-button>
          </div>
        </van-form>
      </template>
      
      <!-- PC端表单 -->
      <template v-else>
        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-position="top"
          @submit.prevent="handleSubmit"
          label-width="auto"
        >
          <el-form-item label="用户名" prop="username" label-position="left">
            <el-input
              v-model="formData.username"
              placeholder="请输入用户名"
              :prefix-icon="User"
            />
          </el-form-item>
          
          <el-form-item label="密码" prop="password" label-position="left">
            <el-input
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          
          <el-form-item label="确认密码" prop="confirmPassword" label-position="left">
            <el-input
              v-model="formData.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSubmit" :loading="loading" style="width: 100%">
              注册
            </el-button>
            <el-button type="primary" plain @click="$router.push('/login')" style="width: 100%; margin-left: 0; margin-top: 10px">
              返回登录
            </el-button>
          </el-form-item>
        </el-form>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { showToast } from 'vant'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 响应式布局
const isMobile = computed(() => window.innerWidth <= 768)

// 表单数据
const formData = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

// PC端表单校验规则
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== formData.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const loading = ref(false)
const formRef = ref(null)

// 提交表单
const handleSubmit = async () => {
  if (!formData.value.username || !formData.value.password || !formData.value.confirmPassword) {
    isMobile.value ? showToast('请填写完整信息') : ElMessage.warning('请填写完整信息')
    return
  }
  
  if (formData.value.password !== formData.value.confirmPassword) {
    isMobile.value ? showToast('两次输入的密码不一致') : ElMessage.warning('两次输入的密码不一致')
    return
  }
  
  try {
    loading.value = true
    await userStore.register(formData.value.username, formData.value.password)
    isMobile.value ? showToast.success('注册成功') : ElMessage.success('注册成功')
    router.push('/login')
  } catch (error) {
    const message = error.message || '注册失败，请重试'
    isMobile.value ? showToast(message) : ElMessage.error(message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  width: 100%;
  padding: 20px 0;
}


.register-box {
  background: #fff;
  border-radius: 8px;
  padding: 40px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
}

.register-container.is-mobile .register-box {
  box-shadow: none;
  padding: 20px;
}

.title {
  text-align: center;
  margin-bottom: 30px;
  color: #409EFF;
  font-size: 24px;
}

.register-container.is-mobile .title {
  font-size: 20px;
  margin-bottom: 20px;
}
</style>