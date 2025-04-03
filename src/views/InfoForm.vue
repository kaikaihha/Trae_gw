<template>
  <div class="info-form-container">
    <div class="map-container" ref="mapContainer"></div>
    
    <!-- 移动端界面 -->
    <template v-if="isMobile">
      <van-form @submit="handleSubmit">
        <van-cell-group inset>
          <van-field
            v-model="formData.shop_name"
            name="shop_name"
            label="商铺名称"
            placeholder="请输入商铺名称"
            :rules="[{ required: true, message: '请输入商铺名称' }]"
          />
          <van-field
            v-model="formData.contact"
            name="contact"
            label="联系人"
            placeholder="请输入联系人姓名"
            :rules="[{ required: true, message: '请输入联系人姓名' }]"
          />
          <van-field
            v-model="formData.phone"
            name="phone"
            label="联系电话"
            type="tel"
            placeholder="请输入联系电话"
            :rules="[{ required: true, message: '请输入联系电话' }]"
          />
          <van-field
            v-model="currentAddress"
            name="address"
            label="商铺地址"
            readonly
            placeholder="正在获取位置..."
          />
          <van-field
            v-model="formData.business_type"
            name="business_type"
            label="经营类型"
            placeholder="请选择经营类型"
            readonly
            @click="showTypePicker = true"
            :rules="[{ required: true, message: '请选择经营类型' }]"
          />
          <van-field
            v-model="formData.remarks"
            name="remarks"
            label="备注信息"
            type="textarea"
            placeholder="请输入备注信息"
            :rows="3"
          />
        </van-cell-group>
        
        <div style="margin: 16px">
          <van-button round block type="primary" native-type="submit" :loading="loading">
            提交
          </van-button>
        </div>
      </van-form>
      
      <!-- 经营类型选择器 -->
      <van-popup v-model:show="showTypePicker" position="bottom">
        <van-picker
          :columns="businessTypes"
          @confirm="onTypeSelect"
          @cancel="showTypePicker = false"
          title="选择经营类型"
          show-toolbar
        />
      </van-popup>
    </template>
    
    <!-- PC端界面 -->
    <template v-else>
      <el-card class="form-card">
        <template #header>
          <div class="card-header">
            <span>商铺信息填报</span>
          </div>
        </template>
        
        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-position="top"
          @submit.prevent="handleSubmit"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="商铺名称" prop="shop_name">
                <el-input
                  v-model="formData.shop_name"
                  placeholder="请输入商铺名称"
                />
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="联系人" prop="contact">
                <el-input
                  v-model="formData.contact"
                  placeholder="请输入联系人姓名"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="联系电话" prop="phone">
                <el-input
                  v-model="formData.phone"
                  placeholder="请输入联系电话"
                />
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="经营类型" prop="business_type">
                <el-select
                  v-model="formData.business_type"
                  placeholder="请选择经营类型"
                  style="width: 100%"
                >
                  <el-option
                    v-for="type in businessTypes"
                    :key="type.value"
                    :label="type.text"
                    :value="type.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="商铺地址">
            <el-input
              v-model="currentAddress"
              placeholder="正在获取位置..."
              readonly
            />
          </el-form-item>
          
          <el-form-item label="备注信息">
            <el-input
              v-model="formData.remarks"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              @click="handleSubmit"
              :loading="loading"
              style="width: 100%"
            >
              提交
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { showToast, showSuccessToast } from 'vant'
import { ElMessage } from 'element-plus'
import MapService from '../utils/map'

// 响应式布局
const isMobile = computed(() => window.innerWidth <= 768)

// 响应式数据
const mapContainer = ref(null)
const loading = ref(false)
const currentAddress = ref('')
const showTypePicker = ref(false)

const formData = ref({
  shop_name: '',
  contact: '',
  phone: '',
  business_type: '',
  location: null,
  remarks: ''
})

// 经营类型选项
const businessTypes = [
  { text: '餐饮美食', value: 'food' },
  { text: '零售百货', value: 'retail' },
  { text: '服装鞋帽', value: 'clothing' },
  { text: '美容美发', value: 'beauty' },
  { text: '家居建材', value: 'home' },
  { text: '其他', value: 'other' }
]

// 表单验证规则（PC端）
const rules = {
  shop_name: [
    { required: true, message: '请输入商铺名称', trigger: 'blur' }
  ],
  contact: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  business_type: [
    { required: true, message: '请选择经营类型', trigger: 'change' }
  ]
}

// 初始化地图
onMounted(async () => {
  try {
    const map = await MapService.initMap(mapContainer.value)
    const location = await MapService.getCurrentLocation()
    
    formData.value.location = location.position
    currentAddress.value = location.formattedAddress
    
    // 在地图上显示当前位置
    MapService.showCurrentLocation(map, location.position)
  } catch (error) {
    const message = '获取位置信息失败：' + error.message
    isMobile.value ? showToast(message) : ElMessage.error(message)
  }
})

// 经营类型选择
const onTypeSelect = (type) => {
  formData.value.business_type = type.value
  showTypePicker.value = false
}

// 提交表单
const handleSubmit = async () => {
  if (!formData.value.location) {
    const message = '无法获取位置信息，请检查定位权限'
    isMobile.value ? showToast(message) : ElMessage.warning(message)
    return
  }
  
  loading.value = true
  try {
    // 实际项目中应该调用后端API
    // const response = await request.post('/shop/info', formData.value)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const message = '信息提交成功'
    isMobile.value ? showSuccessToast(message) : ElMessage.success(message)
    
    // 重置表单
    formData.value = {
      shop_name: '',
      contact: '',
      phone: '',
      business_type: '',
      location: formData.value.location,
      remarks: ''
    }
  } catch (error) {
    const message = '提交失败：' + error.message
    isMobile.value ? showToast(message) : ElMessage.error(message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.info-form-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .map-container {
    height: 30%;
    width: 100%;
    margin-bottom: 16px;
  }
  
  .form-card {
    margin: 16px;
    flex: 1;
    overflow-y: auto;
  }
  
  :deep(.el-card__header) {
    padding: 12px 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}

// 移动端样式调整
.is-mobile {
  .map-container {
    height: 25%;
  }
}
</style>