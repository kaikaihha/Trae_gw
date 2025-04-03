<template>
  <div class="profile-container" :class="{ 'is-mobile': isMobile }">
    <div class="profile-box">
      <h2 class="title">个人信息</h2>
      
      <!-- 移动端表单 -->
      <template v-if="isMobile">
        <van-form @submit="handleSubmit">
          <van-cell-group inset>
            <van-field
              v-model="formData.username"
              name="username"
              label="用户名"
              placeholder="请输入用户名"
              :readonly="!isEditing"
              :rules="[{ required: true, message: '请输入用户名' }]"
            />
            <van-field
              v-model="formData.department"
              name="department"
              label="所属部门"
              placeholder="请输入所属部门"
              :readonly="!isEditing"
            />
            <van-field
              v-model="formData.role"
              name="role"
              label="用户角色"
              readonly
            />
          </van-cell-group>
          <div style="margin: 16px">
            <template v-if="isEditing">
              <van-button round block type="primary" native-type="submit" :loading="loading">
                保存
              </van-button>
              <van-button round block plain type="default" @click="cancelEdit" style="margin-top: 10px">
                取消
              </van-button>
            </template>
            <van-button v-else round block type="primary" @click="startEdit">
              编辑信息
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
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="formData.username"
              placeholder="请输入用户名"
              :readonly="!isEditing"
              prefix-icon="User"
            />
          </el-form-item>
          
          <el-form-item label="所属部门" prop="department">
            <el-input
              v-model="formData.department"
              placeholder="请输入所属部门"
              :readonly="!isEditing"
              prefix-icon="Office"
            />
          </el-form-item>
          
          <el-form-item label="用户角色">
            <el-input
              v-model="formData.role"
              readonly
              prefix-icon="UserFilled"
            />
          </el-form-item>
          
          <el-form-item>
            <template v-if="isEditing">
              <el-button type="primary" @click="handleSubmit" :loading="loading" style="width: 100%">
                保存
              </el-button>
              <el-button type="default" @click="cancelEdit" style="width: 100%; margin-left: 0; margin-top: 10px">
                取消
              </el-button>
            </template>
            <el-button v-else type="primary" @click="startEdit" style="width: 100%">
              编辑信息
            </el-button>
          </el-form-item>
        </el-form>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { showToast } from 'vant'
import { ElMessage } from 'element-plus'
import { User, Office, UserFilled } from '@element-plus/icons-vue'

const userStore = useUserStore()

// 响应式布局
const isMobile = computed(() => window.innerWidth <= 768)

// 编辑状态
const isEditing = ref(false)
const loading = ref(false)

// 表单数据
const formData = ref({
  username: '',
  department: '',
  role: ''
})

// PC端表单校验规则
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }]
}

// 获取用户信息
const getUserInfo = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  formData.value = {
    username: userInfo.username || '',
    department: userInfo.department || '',
    role: userInfo.role === 'admin' ? '管理员' : '普通用户'
  }
}

// 开始编辑
const startEdit = () => {
  isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  getUserInfo()
}

// 提交表单
const handleSubmit = async () => {
  try {
    loading.value = true
    // 这里应该调用更新用户信息的API
    // await userStore.updateUserInfo(formData.value)
    
    const message = '个人信息更新成功'
    if (isMobile.value) {
      showToast(message)
    } else {
      ElMessage.success(message)
    }
    
    isEditing.value = false
  } catch (error) {
    const message = error.message || '更新失败，请重试'
    if (isMobile.value) {
      showToast(message)
    } else {
      ElMessage.error(message)
    }
  } finally {
    loading.value = false
  }
}

// 页面加载时获取用户信息
onMounted(() => {
  getUserInfo()
})
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.profile-container.is-mobile {
  background-color: #fff;
  padding: 0;
}

.profile-box {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.profile-container.is-mobile .profile-box {
  box-shadow: none;
  padding: 16px;
}

.title {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
  font-size: 24px;
}

.profile-container.is-mobile .title {
  font-size: 20px;
  margin-bottom: 16px;
}
</style>