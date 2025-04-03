<template>
  <div class="info-form-container">
    <!-- 移动端轮播图 -->
    <div v-if="isMobile" class="swiper-container">
      <van-swipe class="swiper" :autoplay="3000" indicator-color="white">
        <van-swipe-item v-for="(image, index) in formData.images" :key="index">
          <img :src="image.url" class="swipe-image" />
        </van-swipe-item>
      </van-swipe>
    </div>
    
    <!-- PC端轮播图 -->
    <div v-else class="carousel-container">
      <el-carousel height="300px">
        <el-carousel-item v-for="(image, index) in formData.images" :key="index">
          <img :src="image.url" class="carousel-image" />
        </el-carousel-item>
      </el-carousel>
    </div>
    
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
          <van-field name="image" label="打卡图片" :rules="[{ required: true, message: '请上传打卡图片' }]">
            <template #input>
              <van-uploader
                v-model="formData.images"
                :max-count="1"
                :before-read="beforeRead"
                :after-read="afterRead"
              />
            </template>
            <template #extra>
              <div class="upload-tip">请上传打卡现场图片</div>
            </template>
          </van-field>
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
              <el-form-item label="打卡图片" prop="images">
                <el-upload
                  v-model:file-list="formData.images"
                  class="upload-demo"
                  action="#"
                  :auto-upload="false"
                  :limit="1"
                  list-type="picture-card"
                  :before-upload="beforeUpload"
                  accept="image/*"
                >
                  <template #default>
                    <el-icon><Plus /></el-icon>
                  </template>
                  <template #file="{ file }">
                    <div>
                      <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
                    </div>
                  </template>
                </el-upload>
                <div class="upload-tip">请上传打卡现场图片</div>
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
import { useRoute, useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import MapService from '../utils/map'
import { useCheckinStore } from '../stores/checkin'

// 路由
const route = useRoute()
const router = useRouter()

// Store
const checkinStore = useCheckinStore()

// 编辑模式
const isEditMode = computed(() => !!route.params.id)
const editId = computed(() => route.params.id)

// 响应式布局
const isMobile = computed(() => window.innerWidth <= 768)

// 响应式数据
const loading = ref(false)
const formRef = ref(null)
const currentAddress = ref('')

// 表单数据
const formData = ref({
  shop_name: '',
  contact: '',
  phone: '',
  address: '',
  images: [],
  remarks: ''
})

// 表单验证规则
const rules = {
  shop_name: [{ required: true, message: '请输入商铺名称', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系人姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  images: [{ required: true, message: '请上传打卡图片', trigger: 'change' }]
}

// 初始化数据
onMounted(async () => {
  if (isEditMode.value) {
    const form = checkinStore.infoForms.find(f => f.id === editId.value)
    if (form) {
      formData.value = { ...form }
      currentAddress.value = form.address
    }
  }
  
  // 获取当前位置
  if (!isEditMode.value) {
    try {
      const location = await MapService.getCurrentLocation()
      currentAddress.value = location.address
      formData.value.address = location.address
    } catch (error) {
      const message = '获取位置信息失败：' + error.message
      isMobile.value ? showToast(message) : ElMessage.error(message)
    }
  }
})

// 图片上传前检查
const beforeRead = (file) => {
  const isImage = file.type.indexOf('image') !== -1
  if (!isImage) {
    isMobile.value ? showToast('请上传图片文件！') : ElMessage.warning('请上传图片文件！')
  }
  return isImage
}

// 图片上传后处理
const afterRead = (file) => {
  formData.value.images = [file]
}

// PC端图片上传前检查
const beforeUpload = (file) => {
  const isImage = file.type.indexOf('image') !== -1
  if (!isImage) {
    ElMessage.warning('请上传图片文件！')
    return false
  }
  
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    formData.value.images = [{
      url: reader.result,
      raw: file
    }]
  }
  return false
}



// 提交表单
const handleSubmit = async () => {
  if (isMobile.value) {
    // 移动端表单验证
    if (!formData.value.shop_name || !formData.value.contact || !formData.value.phone || !formData.value.images.length) {
      showToast('请填写完整信息')
      return
    }
  } else {
    // PC端表单验证
    await formRef.value.validate()
  }

  loading.value = true
  try {
    const submitData = {
      ...formData.value,
      address: currentAddress.value
    }

    if (isEditMode.value) {
      await checkinStore.updateInfoForm(editId.value, submitData)
      const message = '更新成功'
      isMobile.value ? showSuccessToast(message) : ElMessage.success(message)
    } else {
      await checkinStore.addInfoForm(submitData)
      const message = '提交成功'
      isMobile.value ? showSuccessToast(message) : ElMessage.success(message)
    }
    
    // 返回列表页
    router.push('/info-list')
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
  
  .swiper-container {
    height: 300px;
    margin-bottom: 16px;
    
    .swiper {
      height: 100%;
      
      .swipe-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
  
  .carousel-container {
    margin-bottom: 16px;
    
    .carousel-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
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

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.upload-demo {
  :deep(.el-upload--picture-card) {
    width: 200px;
    height: 200px;
    line-height: 200px;
  }
  
  :deep(.el-upload-list__item) {
    width: 200px;
    height: 200px;
  }
}


</style>