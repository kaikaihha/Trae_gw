<template>
  <div class="checkin-container">
    <div class="map-container" ref="mapContainer"></div>
    
    <!-- 移动端界面 -->
    <template v-if="isMobile">
      <van-form @submit="handleCheckin">
        <van-cell-group inset>
          <van-field
            v-model="checkinData.remarks"
            name="remarks"
            label="备注"
            type="textarea"
            placeholder="请输入打卡备注"
            :rows="3"
          />
        </van-cell-group>
        
        <div class="location-info">
          <van-cell title="当前位置" :value="currentAddress" />
          <van-cell title="打卡范围" :value="`${checkinRange}米`" />
        </div>
        
        <div style="margin: 16px">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="loading"
            :disabled="!isInRange"
          >
            {{ isInRange ? '打卡' : '不在打卡范围内' }}
          </van-button>
        </div>
      </van-form>
    </template>
    
    <!-- PC端界面 -->
    <template v-else>
      <el-card class="checkin-form">
        <template #header>
          <div class="card-header">
            <span>打卡信息</span>
          </div>
        </template>
        
        <el-form
          ref="formRef"
          :model="checkinData"
          label-position="top"
          @submit.prevent="handleCheckin"
        >
          <el-form-item label="当前位置">
            <el-input v-model="currentAddress" readonly />
          </el-form-item>
          
          <el-form-item label="打卡范围">
            <el-input :value="`${checkinRange}米`" readonly />
          </el-form-item>
          
          <el-form-item label="备注">
            <el-input
              v-model="checkinData.remarks"
              type="textarea"
              :rows="3"
              placeholder="请输入打卡备注"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              @click="handleCheckin"
              :loading="loading"
              :disabled="!isInRange"
              style="width: 100%"
            >
              {{ isInRange ? '打卡' : '不在打卡范围内' }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCheckinStore } from '../stores/checkin'
import { showToast, showSuccessToast } from 'vant'
import { ElMessage } from 'element-plus'
import MapService from '../utils/map'

// 响应式布局
const isMobile = computed(() => window.innerWidth <= 768)

// 状态管理
const checkinStore = useCheckinStore()

// 响应式数据
const mapContainer = ref(null)
const loading = ref(false)
const currentAddress = ref('')
const isInRange = ref(false)
const checkinRange = ref(100) // 默认打卡范围100米

const checkinData = ref({
  remarks: '',
  location: null,
  timestamp: null
})

// 初始化地图
onMounted(async () => {
  try {
    const map = await MapService.initMap(mapContainer.value)
    const location = await MapService.getCurrentLocation()
    
    checkinData.value.location = location.position
    currentAddress.value = location.formattedAddress
    
    // 检查是否在打卡范围内
    const targetPoint = [116.397428, 39.90923] // 示例：目标打卡点坐标
    const distance = MapService.calculateDistance(
      location.position,
      targetPoint
    )
    
    isInRange.value = distance <= checkinRange.value
    
    // 在地图上显示当前位置和打卡范围
    MapService.showCurrentLocation(map, location.position)
    MapService.showCheckinRange(map, targetPoint, checkinRange.value)
  } catch (error) {
    const message = '获取位置信息失败：' + error.message
    isMobile.value ? showToast(message) : ElMessage.error(message)
  }
})

// 提交打卡
const handleCheckin = async () => {
  if (!isInRange.value) {
    const message = '不在打卡范围内'
    isMobile.value ? showToast(message) : ElMessage.warning(message)
    return
  }
  
  loading.value = true
  checkinData.value.timestamp = new Date().toISOString()
  
  try {
    await checkinStore.submitCheckin(checkinData.value)
    const message = '打卡成功'
    isMobile.value ? showSuccessToast(message) : ElMessage.success(message)
    checkinData.value.remarks = ''
  } catch (error) {
    const message = '打卡失败：' + error.message
    isMobile.value ? showToast(message) : ElMessage.error(message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.checkin-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .map-container {
    height: 50%;
    width: 100%;
    margin-bottom: 16px;
  }
  
  .location-info {
    margin: 16px 0;
  }
  
  .checkin-form {
    margin: 16px;
    flex: 1;
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
    height: 40%;
  }
}
</style>